import { Response } from "express";
import prisma from "../lib/prisma";

// 1. [ANY] - GET MY NOTIFICATIONS (EcoSarthi alerts, points, pickups)
export const getMyNotifications = async (req: any, res: Response) => {
  try {
    // req.user.id ya userId check kar lena tumhare auth middleware ke hisaab se
    const userId = req.user.id || req.user.userId;

    const notifications = await prisma.notification.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      take: 20 // Recent 20 alerts (Points, Pickups, News)
    });

    const unreadCount = await prisma.notification.count({
      where: { 
        userId: userId, 
        isRead: false 
      }
    });

    res.json({ 
        notifications, 
        unreadCount,
        message: "EcoSarthi alerts fetched successfully" 
    });
  } catch (error: any) {
    console.error("Notification Error:", error.message);
    res.status(500).json({ error: "Notification fetch failed" });
  }
};

// 2. [ANY] - MARK SPECIFIC NOTIFICATION AS READ
export const markAsRead = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user.userId;

    // Security check: Notification usi user ki honi chahiye jo request kar raha hai
    const notification = await prisma.notification.findUnique({
        where: { id }
    });

    if (!notification || notification.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized or Notification not found" });
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.json({ message: "Notification marked as read" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update notification" });
  }
};

// 3. [ANY] - MARK ALL AS READ (Optional but good for UX)
export const markAllAsRead = async (req: any, res: Response) => {
    try {
        const userId = req.user.id || req.user.userId;

        await prisma.notification.updateMany({
            where: { userId: userId, isRead: false },
            data: { isRead: true }
        });

        res.json({ message: "All notifications marked as read" });
    } catch (error: any) {
        res.status(500).json({ error: "Failed to update notifications" });
    }
};