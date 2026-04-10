import api from "./api"; // Ensure karein aapka axios instance sahi path par hai

export const dashboardService = {
  // Super Admin ke liye data fetch karne wala function
  getSuperAdminStats: async () => {
    try {
      const response = await api.get("/dashboard/super-admin/stats");
      return response.data; // Backend se jo JSON bhej rahe ho wo yahan milega
    } catch (error) {
      console.error("SuperAdmin Stats Fetch Error:", error);
      throw error;
    }
  },

  // Department Admin ke liye data fetch karne wala function
  getDeptStats: async () => {
    try {
      const response = await api.get("/dashboard/stats");
      return response.data;
    } catch (error) {
      console.error("Dept Stats Fetch Error:", error);
      throw error;
    }
  }
};