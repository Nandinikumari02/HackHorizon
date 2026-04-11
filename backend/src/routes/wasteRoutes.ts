import { Router } from 'express';
import { 
    analyzeWasteImage, 
    logWasteAndRequestPickup, 
    getMyWasteLogs, 
    getRecyclingCenters,
    getWasteCategories,
    getNearbyRecyclingCenters,
    getPendingPickups,
    assignPickupStaff,
    getMyTasks,
    completePickup,
    getCitizenStats,
    getOrganizationStaff,
    getDepartmentPickupRequests
} from '../controllers/wasteController';
import { authenticate, checkRole } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

// --- 1. AI & LOGGING (Citizens Only) ---
// AI prediction ke liye image bhejna
router.post('/analyze', authenticate, upload.single('file'), analyzeWasteImage);

// Waste log karna aur pickup request trigger karna
router.post('/log', authenticate, upload.single('file'), logWasteAndRequestPickup);

// Citizen apna data aur dashboard stats dekh sake
router.get('/my-history', authenticate, getMyWasteLogs);
router.get('/stats', authenticate, getCitizenStats);


// --- 2. MANAGEMENT (Recycling Partners/Admins) ---
// Saari pending requests dekhna (Assignment ke liye)
router.get(
    '/pending-pickups', 
    authenticate, 
    checkRole(['RECYCLING_PARTNER', 'ADMIN']), 
    getPendingPickups
);

// Pickup Staff assign karna
router.post(
    '/assign-staff', 
    authenticate, 
    checkRole(['RECYCLING_PARTNER', 'ADMIN']), 
    assignPickupStaff
);

router.get(
    '/organization-staff',
    authenticate,
    checkRole(['RECYCLING_PARTNER', 'ADMIN']),
    getOrganizationStaff
);

// Department dashboard ke liye pickup requests
router.get(
    '/department-pickups',
    authenticate,
    checkRole(['RECYCLING_PARTNER', 'ADMIN']),
    getDepartmentPickupRequests
);


// --- 3. OPERATIONS (Waste Staff Only) ---
// Staff ko unke assigned tasks dikhana
router.get(
    '/my-tasks', 
    authenticate, 
    checkRole(['WASTE_STAFF', 'ADMIN']), 
    getMyTasks
);

// Pickup complete karke reward points trigger karna
router.post(
    '/complete-pickup', 
    authenticate, 
    checkRole(['WASTE_STAFF', 'ADMIN']), 
    completePickup
);


// --- 4. PUBLIC ---
// Nearby centers ki location dekhne ke liye
router.get('/centers', getRecyclingCenters);
// All categories (for scan log / pickup matching without requiring a center row)
router.get('/categories', getWasteCategories);
router.get('/nearby-centers', getNearbyRecyclingCenters);

export default router;