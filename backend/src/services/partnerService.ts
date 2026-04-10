import prisma from "../lib/prisma";
import { RequestStatus } from "@prisma/client";

// 1. [PARTNER] - Get all pickup requests for the Partner's Organization
export const getCenterPickups = async (userId: string) => {
    // Partner ki profile Staff table mein hi hai (role se differentiate karte hain)
    const partner = await prisma.staff.findUnique({
        where: { userId },
    });

    if (!partner) throw new Error("Partner profile not found");
    if (!partner.organization) throw new Error("Partner organization is not configured");

    return prisma.pickupRequest.findMany({
        where: {
            // Sirf wahi requests jo partner ki organization/center name se linked hain
            center: {
                name: partner.organization 
            }
        },
        include: {
            wasteLog: {
                include: {
                    category: { select: { name: true } },
                    citizen: { include: { user: { select: { fullname: true, phoneNumber: true } } } }
                }
            },
            staff: { // Assigned Pickup Boy
                include: { user: { select: { fullname: true } } }
            }
        },
        orderBy: { createdAt: "desc" },
    });
};

// 2. [PARTNER] - Assign Pickup to a specific Field Staff (Pickup Boy)
export const assignPickupToStaff = async (
    requestId: string,
    staffId: string,
    partnerUserId: string
) => {
    // Partner check
    const partner = await prisma.staff.findUnique({
        where: { userId: partnerUserId },
    });
    if (!partner) throw new Error("Partner not found");

    // Staff (Pickup Boy) check - Same organization honi chahiye
    const staff = await prisma.staff.findUnique({
        where: { id: staffId },
        include: { user: { select: { fullname: true } } }
    });

    if (!staff || staff.organization !== partner.organization)
        throw new Error("Staff does not belong to your organization/center");

    // Transaction: Assignment update + Notification creation
    return await prisma.$transaction(async (tx) => {
        const updatedRequest = await tx.pickupRequest.update({
            where: { id: requestId },
            data: {
                staffId,
                status: 'ASSIGNED', // RequestStatus.ASSIGNED
            },
        });

        // Notify the Staff (Pickup Boy)
        await tx.notification.create({
            data: {
                userId: staff.userId,
                message: `New Pickup Task: You have been assigned a new pickup request (ID: ${requestId}).`,
            }
        });

        // Notify the Citizen
        const wasteLog = await tx.wasteLog.findUnique({ where: { id: updatedRequest.wasteLogId } });
        if (wasteLog) {
            await tx.notification.create({
                data: {
                    userId: wasteLog.userId,
                    message: `Good News! ${staff.user.fullname} has been assigned to collect your waste.`,
                }
            });
        }

        return updatedRequest;
    });
};