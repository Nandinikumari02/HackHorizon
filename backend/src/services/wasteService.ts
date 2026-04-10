import prisma from "../lib/prisma";
import { WasteStatus, RequestStatus } from "@prisma/client";

interface LogWasteInput {
  materialName: string;
  categoryId: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  recycleTip?: string;
  reuseTip?: string;
  disposeTip?: string;
  requestPickup: boolean; // Kya user kachra uthwana chahta hai?
}

export const logWasteService = async (
  userId: string,
  citizenId: string,
  data: LogWasteInput
) => {
  // 1. Check if Category exists
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!category) throw new Error("Invalid waste category");

  // 2. Transaction: Log Waste + Create Pickup (if requested)
  return await prisma.$transaction(async (tx) => {
    // A. Create the Waste Log
    const wasteLog = await tx.wasteLog.create({
      data: {
        userId,
        citizenId,
        categoryId: data.categoryId,
        materialName: data.materialName,
        imageUrl: data.imageUrl,
        confidence: 0,
        latitude: data.latitude,
        longitude: data.longitude,
        recycleTip: data.recycleTip,
        reuseTip: data.reuseTip,
        disposeTip: data.disposeTip,
        status: data.requestPickup ? 'REQUESTED_PICKUP' : 'SCANNED',
      },
    });

    // B. Create Pickup Request if citizen opted for it
    if (data.requestPickup) {
      // Find a center that handles this category
      const nearestCenter = await tx.recyclingCenter.findFirst({
        where: { categoryId: data.categoryId }
      });

      if (!nearestCenter) {
        throw new Error("No recycling center available for the selected category");
      }

      await tx.pickupRequest.create({
        data: {
          wasteLogId: wasteLog.id,
          citizenId: citizenId,
          centerId: nearestCenter.id,
          status: 'PENDING',
        }
      });
    }

    return wasteLog;
  });
};

// 3. Get Citizen's Waste History (Like your getCitizenIssues)
export const getCitizenWasteHistory = async (citizenId: string) => {
  return prisma.wasteLog.findMany({
    where: { citizenId },
    include: {
      category: { select: { name: true } },
      pickupRequest: {
        include: {
          staff: {
            include: { user: { select: { fullname: true, phoneNumber: true } } }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });
};