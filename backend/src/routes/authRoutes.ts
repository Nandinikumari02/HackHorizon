import { Router } from 'express';
import { 
    registerCitizen, 
    login, 
    getMe, 
    createStaffOrPartner 
} from '../controllers/authController';
import { authenticate, checkRole } from '../middleware/authMiddleware';

const router = Router();

// --- 1. PUBLIC ROUTES ---
router.post('/register', registerCitizen);
router.post('/login', login);

// --- 2. PROTECTED ROUTES ---
router.get('/me', authenticate, getMe);

// --- 3. PRIVILEGED ROUTES (RBAC) ---
router.post(
    '/create-staff', 
    authenticate, 
    checkRole(['ADMIN', 'RECYCLING_PARTNER']), 
    createStaffOrPartner
);



export default router;