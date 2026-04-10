import api from './api';

export const wasteService = {
    // --- 1. AI & LOGGING (Citizens) ---

    /**
     * Sends image and address to friend's ML model via backend
     * @param file - The image file from the input
     * @param address - User-provided address string
     */
    analyzeWaste: async (file: File, address: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('address', address);

        // Axios automatically sets multipart/form-data with correct boundary
        const response = await api.post('/waste/analyze', formData);
        return response.data;
    },

    /**
     * Saves the waste log to PostgreSQL and optionally triggers pickup
     */
    logWaste: async (wasteData: {
        materialName: string;
        latitude: number;
        longitude: number;
        categoryId: string;
        recycleTip?: string;
        reuseTip?: string;
        disposeTip?: string;
        requestPickup: boolean;
    }, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        
        // Append text fields to FormData
        Object.entries(wasteData).forEach(([key, value]) => {
            formData.append(key, String(value));
        });

        const response = await api.post('/waste/log', formData);
        return response.data;
    },

    getMyHistory: async () => {
        const response = await api.get('/waste/my-history');
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/waste/stats');
        return response.data;
    },

    // --- 2. MANAGEMENT (Partners/Admins) ---

    getPendingPickups: async () => {
        const response = await api.get('/waste/pending-pickups');
        return response.data;
    },

    assignStaff: async (requestId: string, staffId: string) => {
        const response = await api.post('/waste/assign-staff', { requestId, staffId });
        return response.data;
    },

    // --- 3. OPERATIONS (Waste Staff) ---

    getMyTasks: async () => {
        const response = await api.get('/waste/my-tasks');
        return response.data;
    },

    completePickup: async (requestId: string) => {
        const response = await api.post('/waste/complete-pickup', { requestId });
        return response.data;
    },

    // --- 4. PUBLIC ---

    getRecyclingCenters: async () => {
        const response = await api.get('/waste/centers');
        return response.data;
    }
};