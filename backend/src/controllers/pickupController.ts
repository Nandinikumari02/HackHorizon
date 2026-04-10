import { Response } from "express";
import prisma from "../lib/prisma";
import { processImages } from "../middleware/uploadMiddleware";

// 1. GET PENDING PICKUPS (For Staff)
export const getMyAssignedPickups = async (req: any, res: Response) => {
  try {
    const staffId = req.user.staffId; // From JWT
    if (!staffId) return res.status(403).json({ message: "Staff record not found" });

    const tasks = await prisma.pickupRequest.findMany({
      where: { staffId, status: 'ASSIGNED' },
      include: {
        wasteLog: {
          include: {
            category: { select: { name: true } },
            user: { select: { fullname: true, phoneNumber: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 2. GET COMPLETED PICKUPS (Staff history)
export const getMyCompletedPickups = async (req: any, res: Response) => {
  try {
    const staffId = req.user.staffId;
    if (!staffId) return res.status(403).json({ message: "Staff record not found" });

    const completedPickups = await prisma.pickupRequest.findMany({
      where: { staffId, status: 'COMPLETED' },
      include: {
        wasteLog: {
          select: {
            id: true,
            materialName: true,
            imageUrl: true,
            latitude: true,
            longitude: true,
            status: true,
            updatedAt: true,
            category: { select: { name: true } }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(completedPickups);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 3. COMPLETE PICKUP (The Core logic)
export const completePickup = async (req: any, res: Response) => {
  try {
    const { requestId } = req.params;
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Proof of collection photo is required." });
    }

    const processedPaths = await processImages(files, 'pickups');

    const pickupRequest = await prisma.pickupRequest.findUnique({
      where: { id: requestId },
      include: { wasteLog: true }
    });

    if (!pickupRequest || pickupRequest.staffId !== req.user.staffId) {
      return res.status(403).json({ message: "Unauthorized or Invalid Request" });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update Request
      await tx.pickupRequest.update({
        where: { id: requestId },
        data: { status: 'COMPLETED' }
      });

      // 2. Update Waste Log
      await tx.wasteLog.update({
        where: { id: pickupRequest.wasteLogId },
        data: { status: 'COMPLETED' }
      });

      // 3. Reward User
      await tx.user.update({
        where: { id: pickupRequest.wasteLog.userId },
        data: { points: { increment: 50 } }
      });

      // 4. Notification & Reward Record
      await tx.reward.create({
        data: {
          userId: pickupRequest.wasteLog.userId,
          points: 50,
          activity: `Recycled ${pickupRequest.wasteLog.materialName}`,
        }
      });
    });

    res.json({ message: "Pickup completed! Points awarded.", proof: processedPaths });
  } catch (error: any) {
    res.status(500).json({ error: "Update failed: " + error.message });
  }
};