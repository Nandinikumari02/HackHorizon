import api from './api';

export const departmentService = {

  // 1. Citizen ke liye saare departments aur categories fetch karna
  getAllDepartments: () => api.get('/departments/all'),

  // 2. Super Admin ke liye naya department banana
  createDepartment: (data: { 
    name: string; 
    description?: string; 
    supportedRoles: string[] 
  }) => api.post('/departments', data),

  // 3. Dept Admin ke liye category add karna
  createCategory: (data: { 
    name: string; 
    departmentId: string 
  }) => api.post('/departments/category', data),

  // 4. Dept Admin ke liye staff list dekhna
  getMyStaff: () => api.get('/departments/staff'),

  getStaffIssues: (staffId: string) => 
    api.get(`/departments/staff/${staffId}/issues`),

  // 5. Dept Admin roles
  getMyRoles: () => api.get('/departments/my-roles'),

  // 6. ✅ NEW — Get Department Admins
  getDepartmentAdmins: (departmentId: string) =>
    api.get(`/departments/${departmentId}/admins`),

  // 7. Get Department Pickup Requests for Dashboard
  getDepartmentPickupRequests: () => api.get('/waste/department-pickups'),

};