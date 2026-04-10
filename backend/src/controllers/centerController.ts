import { Response } from "express";
import prisma from "../lib/prisma";
import { WasteStatus, RequestStatus } from "@prisma/client";
import { processImages } from "../middleware/uploadMiddleware";

// 1. GET PENDING PICKUPS (Staff ke liye assigned tasks)
export const getMyAssignedPickups = async (req: any, res: Response) => {
  try {
    const staffRecord = await prisma.staff.findUnique({
      where: { userId: req.user.userId }
    });

    if (!staffRecord) return res.status(403).json({ message: "Staff record not found" });

    const tasks = await prisma.pickupRequest.findMany({
      where: { 
        staffId: staffRecord.id,
        status: 'ASSIGNED' // Sirf wahi jo abhi staff ko assigned hain
      },
      include: {
        wasteLog: {
          include: {
            category: { select: { name: true } },
            citizen: { select: { user: { select: { fullname: true, phoneNumber: true } } } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch pickup tasks: " + error.message });
  }
};

// 2. GET COMPLETED PICKUPS (Staff ki history)
export const getMyCompletedPickups = async (req: any, res: Response) => {
  try {
    const staffRecord = await prisma.staff.findUnique({
      where: { userId: req.user.userId }
    });

    if (!staffRecord) return res.status(404).json({ message: "Staff record not found" });

    const completedPickups = await prisma.pickupRequest.findMany({
      where: { 
        staffId: staffRecord.id,
        status: 'COMPLETED' 
      },
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
    console.error("Backend Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// 3. COMPLETE PICKUP (Proof of Collection + Reward Points)
export const completePickup = async (req: any, res: Response) => {
  try {
    const { requestId } = req.params; // pickupRequest ID
    const { collectionNotes } = req.body;
    const files = req.files as Express.Multer.File[]; 
    
    // Pickup ke waqt kachra collect karne ki photo zaroori hai
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Proof of collection photo is required." });
    }

    const processedPaths = await processImages(files, 'pickups');

    const staffRecord = await prisma.staff.findUnique({
      where: { userId: req.user.userId }
    });

    const pickupRequest = await prisma.pickupRequest.findUnique({
      where: { id: requestId },
      include: { wasteLog: true }
    });

    if (!pickupRequest || !staffRecord || pickupRequest.staffId !== staffRecord.id) {
      return res.status(403).json({ message: "Unauthorized or Pickup Request not found" });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Pickup Request Status update
      await tx.pickupRequest.update({
        where: { id: requestId },
        data: { status: 'COMPLETED' }
      });

      // 2. Waste Log update (Status change to COMPLETED)
      const updatedWaste = await tx.wasteLog.update({
        where: { id: pickupRequest.wasteLogId },
        data: { 
          status: 'COMPLETED',
          // Agar hum collected image save karna chahte hain toh imageUrl update ya naya field use kar sakte hain
        },
        include: { user: true }
      });

      // 3. Reward & Notifications for Citizen
      // EcoSarthi mein user ko kachra dene par points milte hain
      const rewardPoints = 50; 

      await tx.user.update({
        where: { id: updatedWaste.userId },
        data: { points: { increment: rewardPoints } }
      });

      await tx.reward.create({
        data: {
          userId: updatedWaste.userId,
          points: rewardPoints,
          activity: `Waste Collected: ${updatedWaste.materialName}`,
          badgeName: "Eco-Warrior"
        }
      });

      await tx.notification.createMany({
        data: [
          {
            userId: updatedWaste.userId,
            message: `Your pickup for "${updatedWaste.materialName}" is completed! Thank you for recycling.`
          },
          {
            userId: updatedWaste.userId,
            message: `Eco-Bonus: +${rewardPoints} points added to your wallet!`
          }
        ]
      });
    });

    res.json({ 
      message: "Pickup successful! Points awarded to the user.",
      collectionProof: processedPaths 
    });

  } catch (error: any) {
    console.error("Complete Pickup Error:", error);
    res.status(500).json({ error: "Update failed: " + error.message });
  }
};