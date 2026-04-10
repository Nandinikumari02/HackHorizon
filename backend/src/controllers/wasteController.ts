import { Request, Response } from "express";
import { PrismaClient, WasteStatus, RequestStatus } from "@prisma/client";
import { processImages } from "../middleware/uploadMiddleware"; // Assuming same middleware
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const prisma = new PrismaClient();

export const analyzeWasteImage = async (req: any, res: Response) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ message: "No image provided" });

        // A. Call Friend's ML Model
        const formData = new FormData();
        if (file.path) {
            formData.append('file', fs.createReadStream(file.path), { filename: file.originalname });
        } else {
            formData.append('file', file.buffer, { filename: file.originalname });
        }

        console.log("Fetching data from Friend's full-stack ML Model...");
        const mlResponse = await axios.post('https://paraphrasable-pat-proautomation.ngrok-free.dev/predict', formData, {
            headers: { 
                ...formData.getHeaders(), 
                'ngrok-skip-browser-warning': 'true' 
            }
        });

        // B. Destructure according to Friend's new JSON format
        const { 
            prediction, 
            category, 
            confidence, 
            guidance, 
            nearby_facilities,
            summary 
        } = mlResponse.data;

        // C. Nearby Centers logic 
        // Agar dost ka model hi facilities de raha hai toh hum wahi use karenge
        // Warna purani nearby API call bhi rakh sakte ho. 
        // Filhal hum model wala hi data priority pe rakhenge.
        const centers = nearby_facilities || [];

        // D. Final Response for your Frontend
        return res.json({
            detection: {
                item: prediction || "Unknown",
                category: category || "General",
                confidence: `${((confidence || 0) * 100).toFixed(2)}%`,
                summary: summary
            },
            // Mapping nested guidance to flat arrays for frontend ease
            reuseIdeas: guidance?.reusable?.ideas || [],
            recycleInstructions: guidance?.recyclable?.methods || [],
            disposalOptions: guidance?.disposable?.external_options || [],
            explanations: {
                reuse: guidance?.reusable?.explanation,
                recycle: guidance?.recyclable?.explanation,
                disposal: guidance?.disposable?.explanation
            },
            nearbyCenters: centers.slice(0, 3) 
        });

    } catch (error: any) {
        console.error("New JSON Mapping Error:", error.message);
        res.status(500).json({ 
            error: "Failed to process friend's model output.",
            details: error.message 
        });
    }
};
// --- 2. [CITIZEN] - LOG WASTE & CREATE PICKUP ---
export const logWasteAndRequestPickup = async (req: any, res: Response) => {
    try {
        const { materialName, latitude, longitude, categoryId, recycleTip, reuseTip, disposeTip, requestPickup } = req.body;
        const file = req.file;

        let imageUrl = "";
        if (file) {
            const uploadedPaths = await processImages([file], 'waste-logs');
            imageUrl = uploadedPaths[0];
        }

        // 1. Create Waste Log
        const wasteLog = await prisma.wasteLog.create({
            data: {
                imageUrl,
                materialName,
                confidence: 0.95,
                recycleTip,
                reuseTip,
                disposeTip,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                status: requestPickup ? 'REQUESTED_PICKUP' : 'SCANNED',
                userId: req.user.id,
                citizenId: req.user.citizenId,
                categoryId
            }
        });

        // 2. If user wants pickup immediately, find nearest center and create request
        if (requestPickup) {
            const nearestCenter = await prisma.recyclingCenter.findFirst({
                where: { categoryId }
                // Yahan tum spatial query bhi laga sakte ho future mein
            });

            if (nearestCenter) {
                await prisma.pickupRequest.create({
                    data: {
                        wasteLogId: wasteLog.id,
                        citizenId: req.user.citizenId,
                        centerId: nearestCenter.id,
                        status: 'PENDING'
                    }
                });
            }
        }

        res.status(201).json({ message: "Waste logged successfully", data: wasteLog });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- 3. [PARTNER/ADMIN] - GET PENDING PICKUPS ---
export const getPendingPickups = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const staffRecord = await prisma.staff.findUnique({ where: { userId } });

        if (!staffRecord) return res.status(403).json({ message: "Unauthorized" });

        const requests = await prisma.pickupRequest.findMany({
            where: { 
                status: 'PENDING',
                // Optional: Filter by organization/center
            },
            include: {
                wasteLog: true,
                citizen: { include: { user: { select: { fullname: true, phoneNumber: true } } } }
            }
        });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch pickups" });
    }
};

// --- 4. [PARTNER] - ASSIGN STAFF FOR PICKUP ---
export const assignPickupStaff = async (req: any, res: Response) => {
    try {
        const { requestId, staffId } = req.body;

        const result = await prisma.$transaction(async (tx) => {
            const updatedRequest = await tx.pickupRequest.update({
                where: { id: requestId },
                data: { staffId, status: 'ASSIGNED' },
                include: { wasteLog: true }
            });

            // Notify Staff & Citizen
            await tx.notification.create({
                data: {
                    userId: (await tx.staff.findUnique({ where: { id: staffId } }))!.userId,
                    message: `New Pickup Assigned: ${updatedRequest.wasteLog.materialName}`
                }
            });

            return updatedRequest;
        });

        res.json({ message: "Staff assigned successfully", data: result });
    } catch (error: any) {
        res.status(500).json({ error: "Assignment failed" });
    }
};

// --- 5. [STAFF] - COMPLETE PICKUP & AWARD POINTS ---
export const completePickup = async (req: any, res: Response) => {
    try {
        const { requestId } = req.body;

        const request = await prisma.pickupRequest.findUnique({
            where: { id: requestId },
            include: { wasteLog: true }
        });

        if (!request) return res.status(404).json({ error: "Request not found" });

        await prisma.$transaction([
            // 1. Update Request & Log Status
            prisma.pickupRequest.update({
                where: { id: requestId },
                data: { status: 'COMPLETED' }
            }),
            prisma.wasteLog.update({
                where: { id: request.wasteLogId },
                data: { status: 'COMPLETED' }
            }),
            // 2. Award Points to User
            prisma.user.update({
                where: { id: request.wasteLog.userId },
                data: { points: { increment: 50 } }
            }),
            // 3. Create Reward Entry
            prisma.reward.create({
                data: {
                    userId: request.wasteLog.userId,
                    points: 50,
                    activity: `Recycled ${request.wasteLog.materialName}`
                }
            })
        ]);

        res.json({ message: "Pickup completed. User rewarded with 50 points!" });
    } catch (error: any) {
        res.status(500).json({ error: "Completion failed" });
    }
};

// --- 6. [CITIZEN] - MY WASTE HISTORY ---
export const getMyWasteLogs = async (req: any, res: Response) => {
    try {
        const logs = await prisma.wasteLog.findMany({
            where: { userId: req.user.id },
            include: { pickupRequest: true, category: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch logs" });
    }
};

export const getRecyclingCenters = async (req: Request, res: Response) => {
    try {
        const centers = await prisma.recyclingCenter.findMany({
            include: { category: true }
        });
        res.json(centers);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch centers" });
    }
};

// --- 8. [STAFF] - GET MY ASSIGNED TASKS ---
export const getMyTasks = async (req: any, res: Response) => {
    try {
        const staffRecord = await prisma.staff.findUnique({ 
            where: { userId: req.user.id } 
        });

        if (!staffRecord) return res.status(403).json({ message: "Staff profile not found" });

        const tasks = await prisma.pickupRequest.findMany({
            where: { 
                staffId: staffRecord.id,
                status: 'ASSIGNED'
            },
            include: {
                wasteLog: true,
                citizen: { include: { user: { select: { fullname: true, phoneNumber: true } } } }
            }
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
};

// --- 9. [CITIZEN] - DASHBOARD STATS ---
export const getCitizenStats = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        
        const [user, totalLogs, completedPickups] = await prisma.$transaction([
            prisma.user.findUnique({ where: { id: userId }, select: { points: true } }),
            prisma.wasteLog.count({ where: { userId } }),
            prisma.wasteLog.count({ where: { userId, status: 'COMPLETED' } })
        ]);

        res.json({
            points: user?.points || 0,
            totalScans: totalLogs,
            recycledItems: completedPickups,
            carbonSaved: completedPickups * 0.5 // Mock logic: 0.5kg per item
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch stats" });
    }
};