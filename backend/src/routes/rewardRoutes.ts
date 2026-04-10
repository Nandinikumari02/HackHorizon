import { Router } from 'express';
import { getMyRewards } from '../controllers/rewardController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();


router.get('/my-points', authenticate, getMyRewards);

export default router;