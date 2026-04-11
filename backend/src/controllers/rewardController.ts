import { Response } from "express";
import prisma from "../lib/prisma";

export const getMyRewards = async (req: any, res: Response) => {
  try {
    const rewards = await prisma.reward.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

   
    const totalPoints = rewards.reduce((acc, curr) => acc + curr.points, 0);

    res.json({
      totalPoints,
      history: rewards
    });
  } catch (error: any) {
    res.status(500).json({ error: "Rewards fetch failed" });
  }
};