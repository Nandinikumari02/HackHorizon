import prisma from "../lib/prisma";
import { RequestStatus } from "@prisma/client";

// 1. [STAFF] - Apne assigned pickups ki list dekhna
export const getMyAssignedPickups = async (userId: string) => {
  const staff = await prisma.staff.findUnique({
    where: { userId },
  });

  if (!staff) throw new Error("Staff profile not found");

  return prisma.pickupRequest.findMany({
    where: { 
        staffId: staff.id,
        status: 'ASSIGNED' // Sirf wahi jo abhi pending hain
    },
    include: {
      wasteLog: {
        include: {
          category: { select: { name: true } },
          citizen: { 
            include: { 
              user: { select: { fullname: true, phoneNumber: true } } 
            } 
          },
        }
      }
    },
    orderBy: { createdAt: "desc" }, 
  });
};

// 2. [STAFF] - Pickup Status Update (e.g., On the way)
export const updatePickupStatus = async (
  requestId: string,
  status: RequestStatus,
  userId: string 
) => {
  const staff = await prisma.staff.findUnique({ where: { userId } });
  if (!staff) throw new Error("Staff not found");

  const pickup = await prisma.pickupRequest.findFirst({
    where: { id: requestId, staffId: staff.id }
  });

  if (!pickup) throw new Error("Unauthorized: This pickup is not assigned to you.");

  return prisma.pickupRequest.update({
    where: { id: requestId },
    data: { status }
  });
};

// 3. [STAFF] - Complete Pickup + Award Rewards (The EcoSarthi Core)
export const finalizePickup = async (
  requestId: string,
  userId: string, // Staff's user ID
  rewardPoints: number = 50 
) => {
  const staff = await prisma.staff.findUnique({ where: { userId } });
  if (!staff) throw new Error("Staff not found");

  const pickup = await prisma.pickupRequest.findUnique({
    where: { id: requestId },
    include: { wasteLog: true }
  });

  if (!pickup || pickup.staffId !== staff.id) {
    throw new Error("Unauthorized or Request not found.");
  }

  // Transaction: Pickup complete karo + User ko points do + Notification bhejo
  return await prisma.$transaction(async (tx) => {
    // A. Update Pickup & WasteLog status
    await tx.pickupRequest.update({
      where: { id: requestId },
      data: { status: 'COMPLETED' }
    });

    await tx.wasteLog.update({
      where: { id: pickup.wasteLogId },
      data: { status: 'COMPLETED' }
    });

    // B. Award Points to the Citizen
    await tx.user.update({
      where: { id: pickup.wasteLog.userId },
      data: { points: { increment: rewardPoints } }
    });

    // C. Log the Reward Entry
    await tx.reward.create({
      data: {
        userId: pickup.wasteLog.userId,
        points: rewardPoints,
        activity: `Waste Picked: ${pickup.wasteLog.materialName}`,
      }
    });

    // D. Notify the Citizen
    await tx.notification.create({
      data: {
        userId: pickup.wasteLog.userId,
        message: `Pickup Completed! You earned ${rewardPoints} Eco-Points. Thank you for recycling!`
      }
    });

    return { success: true, message: "Pickup completed and points awarded." };
  });
};