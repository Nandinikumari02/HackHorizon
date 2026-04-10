// import { Router } from "express";
// import { 
//   createDepartment, 
//   createCategory, 
//   getMyStaff, 
//   getAllDepartments, getMyDepartmentRoles,
//   getDepartmentAdmins,
//   getStaffIssues
 
// } from "../controllers/centerController";
// import { authenticate, checkRole } from "../middleware/authMiddleware";

// const router = Router();


// router.post("/", authenticate, checkRole(["SUPER_ADMIN"]), createDepartment);
// router.post("/category", authenticate, checkRole(["DEPARTMENT_ADMIN"]), createCategory);
// router.get("/staff", authenticate, checkRole(["DEPARTMENT_ADMIN"]), getMyStaff);
// router.get("/staff/:staffId/issues", authenticate, checkRole(["DEPARTMENT_ADMIN"]), getStaffIssues);
// router.get("/all", authenticate, getAllDepartments);

// router.get("/my-roles", authenticate, checkRole(["DEPARTMENT_ADMIN"]), getMyDepartmentRoles);

// router.get("/:id/admins",authenticate,checkRole(["SUPER_ADMIN"]),getDepartmentAdmins);

// export default router;



import { Router } from 'express';
import { 
    getMyAssignedPickups, 
    getMyCompletedPickups, 
    completePickup 
} from '../controllers/pickupController';
import { authenticate, checkRole } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

// Sabhi routes ke liye login hona aur WASTE_STAFF role hona zaroori hai
router.use(authenticate);
router.use(checkRole(['WASTE_STAFF', 'ADMIN']));

// --- 1. STAFF DASHBOARD ---
// Staff apne assigned tasks dekh sakta hai
router.get('/assigned', getMyAssignedPickups);

// Staff apni history dekh sakta hai
router.get('/history', getMyCompletedPickups);

// --- 2. OPERATIONAL ROUTE ---
// Pickup complete karne ke liye (Photo upload ke saath)
// 'files' wo key hai jo frontend se image array bhejte waqt use hogi
router.patch(
    '/complete/:requestId', 
    upload.array('files', 5), 
    completePickup
);

export default router;