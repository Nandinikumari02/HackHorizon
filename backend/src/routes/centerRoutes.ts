import { Router } from 'express';
import { 
    analyzeWasteImage, 
    logWasteAndRequestPickup, 
    getMyWasteLogs, 
    getCitizenStats,
    getRecyclingCenters,
    getPendingPickups,
    assignPickupStaff
} from '../controllers/wasteController'; // Ensure path is correct
import { authenticate, checkRole } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

// --- 1. AI & LOGGING (Citizen Focus) ---
// AI analysis ke liye single image upload
router.post(
    '/analyze', 
    authenticate, 
    upload.single('file'), 
    analyzeWasteImage
);

// Kachra log karne aur pickup request dalne ke liye
router.post(
    '/log', 
    authenticate, 
    upload.single('file'), 
    logWasteAndRequestPickup
);

// Citizen apni history aur stats dekh sake
router.get('/my-logs', authenticate, getMyWasteLogs);
router.get('/stats', authenticate, getCitizenStats);

// --- 2. PUBLIC/GENERAL ---
// Maps ya list dikhane ke liye
router.get('/locations', getRecyclingCenters);

// --- 3. PARTNER/ADMIN OPS ---
// Sirf Partners/Admins hi pending requests dekh sakte hain aur staff assign kar sakte hain
router.get(
    '/pending-pickups', 
    authenticate, 
    checkRole(['RECYCLING_PARTNER', 'ADMIN']), 
    getPendingPickups
);

router.post(
    '/assign-staff', 
    authenticate, 
    checkRole(['RECYCLING_PARTNER', 'ADMIN']), 
    assignPickupStaff
);

export default router;