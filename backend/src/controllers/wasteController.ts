import { Request, Response } from "express";
import { PrismaClient, WasteStatus, RequestStatus } from "@prisma/client";
import { processImages } from "../middleware/uploadMiddleware"; // Assuming same middleware
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { distanceKm } from "../utils/haversine";

const prisma = new PrismaClient();

const DEFAULT_ML_BASE = "https://paraphrasable-pat-proautomation.ngrok-free.dev";

export const analyzeWasteImage = async (req: any, res: Response) => {
    try {
        const file = req.file;
        const { address } = req.body;

        if (!file) return res.status(400).json({ message: "No image provided" });

        const formData = new FormData();
        if (file.path) {
            formData.append('file', fs.createReadStream(file.path), { filename: file.originalname });
        } else {
            formData.append('file', file.buffer, { filename: file.originalname });
        }

        if (address) {
            formData.append('address', address);
        }

        // 1. Call the ML Model (FastAPI)
        const mlBase = (process.env.ML_SERVICE_BASE_URL || DEFAULT_ML_BASE).replace(/\/$/, "");
        const predictPath = process.env.ML_PREDICT_PATH || "/predict";
        const predictUrl = `${mlBase}${predictPath.startsWith("/") ? predictPath : "/" + predictPath}`;

        const mlResponse = await axios.post(predictUrl, formData, {
            headers: {
                ...formData.getHeaders(),
                "ngrok-skip-browser-warning": "true",
            },
            timeout: 120000,
        });

        // 2. Normalize ML payload (camelCase + snake_case / alternate keys)
        const raw = mlResponse.data || {};
        const mlData = typeof raw === "object" && raw !== null && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};

        const prediction =
            (mlData.prediction as string) ??
            (mlData.predicted_item as string) ??
            (mlData.item as string) ??
            (mlData.label as string) ??
            (mlData.material as string) ??
            "Unknown Item";

        const category =
            (mlData.category as string) ??
            (mlData.waste_category as string) ??
            (mlData.class_name as string) ??
            "General";

        const confidenceRaw = mlData.confidence ?? mlData.score ?? mlData.probability ?? 1.0;
        const confidence =
            typeof confidenceRaw === "number"
                ? confidenceRaw
                : parseFloat(String(confidenceRaw).replace(/[^\d.-]/g, "")) || 1.0;

        const report =
            (typeof mlData.report === "object" && mlData.report !== null
                ? mlData.report
                : {}) as Record<string, unknown>;

        const guidance =
            (typeof mlData.guidance === "object" && mlData.guidance !== null
                ? mlData.guidance
                : {}) as Record<string, unknown>;

        let summary: string =
            typeof mlData.summary === "string"
                ? mlData.summary
                : typeof mlData.message === "string"
                  ? mlData.message
                  : "AI analysis completed";

        if (summary === "AI analysis completed" && typeof report.summary === "string") {
            summary = report.summary as string;
        }

        const reusable = (guidance as { reusable?: Record<string, unknown> }).reusable || {};
        const recyclable = (guidance as { recyclable?: Record<string, unknown> }).recyclable || {};
        const disposable = (guidance as { disposable?: Record<string, unknown> }).disposable || {};

        const confPct =
            typeof confidence === "number" && confidence > 0 && confidence <= 1
                ? `${(confidence * 100).toFixed(1)}%`
                : typeof confidence === "number" && confidence > 1
                  ? `${confidence.toFixed(1)}%`
                  : "—";

        // 3. Map to Frontend Structure
        const responseData = {
            detection: {
                item: prediction,
                category: category,
                confidence: confPct,
                summary: summary,
            },
            guidance: {
                reuse: {
                    possible: (reusable.possible as boolean) ?? true,
                    ideas: Array.isArray(reusable.ideas)
                        ? (reusable.ideas as string[])
                        : reusable.ideas
                          ? [String(reusable.ideas)]
                          : [],
                    explanation:
                        (report.importance as string) ||
                        (reusable.explanation as string) ||
                        (reusable.tips as string) ||
                        "",
                },
                recycle: {
                    possible: (recyclable.possible as boolean) ?? true,
                    methods: Array.isArray(recyclable.methods)
                        ? (recyclable.methods as string[])
                        : recyclable.methods
                          ? [String(recyclable.methods)]
                          : [],
                    explanation:
                        (report.why_it_matters as string) ||
                        (recyclable.explanation as string) ||
                        (recyclable.tips as string) ||
                        "",
                },
                disposal: {
                    type: (disposable.type as string) || "external",
                    homeMethods:
                        (disposable.home_disposal as string) ||
                        (disposable.homeMethods as string) ||
                        "",
                    externalOptions: Array.isArray(disposable.external_options)
                        ? (disposable.external_options as string[])
                        : disposable.external_options
                          ? [String(disposable.external_options)]
                          : [],
                    explanation: report.facts
                        ? Array.isArray(report.facts)
                            ? (report.facts as string[]).join(". ")
                            : String(report.facts)
                        : (disposable.explanation as string) || "",
                },
            },
            ngo: {
                available: true,
                suggestion: Array.isArray(report.innovations)
                    ? String((report.innovations as unknown[])[0] || "")
                    : (report.innovations as string) ||
                      "Look for local repair cafés, e-waste drives, and community composting in your area.",
            },
        };

        return res.json(responseData);

    } catch (error: any) {
        console.error("Analysis Error:", error.response?.data || error.message);
        res.status(500).json({ 
            error: "EcoSarthi analysis failed to sync with the ML service.",
            details: error.message 
        });
    }
};
// --- 2. [CITIZEN] - LOG WASTE & CREATE PICKUP ---
export const logWasteAndRequestPickup = async (req: any, res: Response) => {
    try {
        const { materialName, latitude, longitude, categoryId, recycleTip, reuseTip, disposeTip, requestPickup, centerId } = req.body;
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

        // 2. If user wants pickup immediately, attach the selected center or nearest matching center.
        if (requestPickup) {
            let center = null;
            if (centerId) {
                center = await prisma.recyclingCenter.findUnique({ where: { id: String(centerId) } });
            }

            if (!center && categoryId) {
                center = await prisma.recyclingCenter.findFirst({ where: { categoryId } });
            }

            if (!center) {
                return res.status(400).json({ error: "No recycling center available to fulfill this pickup request." });
            }

            await prisma.pickupRequest.create({
                data: {
                    wasteLogId: wasteLog.id,
                    citizenId: req.user.citizenId,
                    centerId: center.id,
                    status: 'PENDING'
                }
            });
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
                wasteLog: { include: { category: true } },
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

/** Public list of waste categories (for logging scans when no recycling center exists yet). */
export const getWasteCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany({
            select: { id: true, name: true, description: true },
            orderBy: { name: "asc" },
        });
        res.json(categories);
    } catch (error: any) {
        res.status(500).json({ error: error?.message || "Failed to fetch categories" });
    }
};

/**
 * Nearby recycling centers: sorted by Haversine distance from user lat/lng.
 * Optionally filters by categoryId. Optionally calls ML `nearby_prediction` (same host as predict).
 * Query: latitude, longitude, categoryId?, address?
 */
export const getNearbyRecyclingCenters = async (req: Request, res: Response) => {
    try {
        const lat = parseFloat(String(req.query.latitude ?? ""));
        const lng = parseFloat(String(req.query.longitude ?? ""));
        if (Number.isNaN(lat) || Number.isNaN(lng)) {
            return res.status(400).json({
                message: "Query parameters latitude and longitude are required (decimal degrees).",
            });
        }

        const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;
        const address = typeof req.query.address === "string" ? req.query.address : undefined;

        const where = categoryId ? { categoryId } : {};
        const rows = await prisma.recyclingCenter.findMany({
            where,
            include: { category: { select: { id: true, name: true } } },
        });

        const centers = rows
            .map((c) => ({
                ...c,
                distanceKm: Math.round(distanceKm(lat, lng, c.latitude, c.longitude) * 10) / 10,
            }))
            .sort((a, b) => a.distanceKm - b.distanceKm)
            .slice(0, 25);

        let mlNearby: unknown[] = [];
        try {
            const mlBase = (process.env.ML_SERVICE_BASE_URL || DEFAULT_ML_BASE).replace(/\/$/, "");
            const nearbyPath = process.env.ML_NEARBY_PATH || "/nearby_prediction";
            const nearbyUrl = `${mlBase}${nearbyPath.startsWith("/") ? nearbyPath : "/" + nearbyPath}`;

            const mlRes = await axios.post(
                nearbyUrl,
                {
                    latitude: lat,
                    longitude: lng,
                    address: address ?? "",
                    category_id: categoryId ?? null,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "ngrok-skip-browser-warning": "true",
                    },
                    timeout: 25000,
                }
            );

            const d = mlRes.data;
            if (Array.isArray(d)) mlNearby = d;
            else if (d && typeof d === "object") {
                const o = d as Record<string, unknown>;
                const arr =
                    (Array.isArray(o.centers) && o.centers) ||
                    (Array.isArray(o.results) && o.results) ||
                    (Array.isArray(o.nearby) && o.nearby) ||
                    (Array.isArray(o.data) && o.data) ||
                    [];
                mlNearby = arr;
            }
        } catch {
            mlNearby = [];
        }

        res.json({
            userLocation: { latitude: lat, longitude: lng },
            centers,
            mlNearby,
            mlNearbyAvailable: mlNearby.length > 0,
        });
    } catch (error: any) {
        res.status(500).json({ error: error?.message || "Failed to load nearby centers" });
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

/** Partners / admins: list pickup staff to assign (same organization, or all staff for ADMIN). */
export const getOrganizationStaff = async (req: any, res: Response) => {
    try {
        if (req.user.role === "ADMIN") {
            const staffRows = await prisma.staff.findMany({
                where: { user: { role: "WASTE_STAFF" } },
                include: { user: { select: { id: true, fullname: true, email: true, role: true } } },
            });
            return res.json(
                staffRows.map((s) => ({
                    id: s.id,
                    fullname: s.user.fullname,
                    email: s.user.email,
                    organization: s.organization,
                }))
            );
        }

        const myStaff = await prisma.staff.findUnique({ where: { userId: req.user.id } });
        if (!myStaff) return res.status(403).json({ message: "Staff profile not found" });

        const org = myStaff.organization || "General";
        const staffRows = await prisma.staff.findMany({
            where: {
                organization: org,
                user: { role: "WASTE_STAFF" },
            },
            include: { user: { select: { id: true, fullname: true, email: true, role: true } } },
        });

        res.json(
            staffRows.map((s) => ({
                id: s.id,
                fullname: s.user.fullname,
                email: s.user.email,
                organization: s.organization,
            }))
        );
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to list staff" });
    }
};

/** Department Admin: Get all pickup requests for dashboard */
export const getDepartmentPickupRequests = async (req: any, res: Response) => {
    try {
        const requests = await prisma.pickupRequest.findMany({
            where: {
                status: {
                    in: ['PENDING', 'ASSIGNED']
                }
            },
            include: {
                wasteLog: {
                    include: {
                        category: { select: { name: true } },
                        citizen: { 
                            include: { 
                                user: { select: { fullname: true, phoneNumber: true } } 
                            } 
                        }
                    }
                },
                center: {
                    include: { category: { select: { name: true } } }
                },
                staff: {
                    include: { user: { select: { fullname: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Transform the data to match the expected format for department dashboard
        const transformedRequests = requests.map(req => ({
            id: req.id,
            title: `Waste Pickup: ${req.wasteLog.materialName}`,
            description: `Pickup request for ${req.wasteLog.materialName}`,
            status: req.status === 'PENDING' ? 'OPEN' : req.status === 'ASSIGNED' ? 'IN_PROGRESS' : req.status,
            createdAt: req.createdAt,
            updatedAt: req.updatedAt,
            address: `${req.wasteLog.latitude?.toFixed(4)}, ${req.wasteLog.longitude?.toFixed(4)}`,
            location: {
                address: `${req.wasteLog.latitude?.toFixed(4)}, ${req.wasteLog.longitude?.toFixed(4)}`
            },
            staff: req.staff,
            citizen: req.wasteLog.citizen,
            category: req.wasteLog.category,
            center: req.center,
            wasteLog: req.wasteLog
        }));

        res.json(transformedRequests);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch pickup requests" });
    }
};