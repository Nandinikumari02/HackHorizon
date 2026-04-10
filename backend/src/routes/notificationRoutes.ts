import { Router } from 'express';
import { 
    getMyNotifications, 
    markAsRead, 
    markAllAsRead 
} from '../controllers/notificationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Sabhi notification routes ke liye login hona zaroori hai
router.use(authenticate);

// --- 1. FETCH ALERTS ---
// Saari notifications aur unread count lene ke liye
router.get('/', getMyNotifications);

// --- 2. UPDATE STATUS ---
// Kisi ek specific notification ko read mark karne ke liye
router.patch('/:id/read', markAsRead);

// Poori list ko ek saath read mark karne ke liye (Clean UI)
router.post('/mark-all-read', markAllAsRead);

export default router;