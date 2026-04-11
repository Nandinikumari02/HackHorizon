import api from './api';
import { normalizeAnalyzeResponse, type NormalizedAnalyzeResult } from '@/lib/analyzeResult';
import { enrichScanGuidance } from '@/lib/enrichScanGuidance';

// Define the payload interface to keep things clean
export interface WasteLogPayload {
    materialName: string;
    categoryName?: string; // New field from AI
    latitude: number;
    longitude: number;
    categoryId: string;
    centerId?: string;
    recycleTip?: string;
    reuseTip?: string;
    disposeTip?: string;
    ngoSuggestion?: string; // New field from AI
    requestPickup: boolean;
}

export const wasteService = {
    // --- 1. AI & LOGGING (Citizens) ---

    /**
     * Sends image to backend for ML analysis
     */
    analyzeWaste: async (file: File, address: string): Promise<NormalizedAnalyzeResult> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('address', address);

        const response = await api.post('/waste/analyze', formData);
        const normalized = normalizeAnalyzeResponse(response.data);
        return enrichScanGuidance(normalized);
    },

    /** Nearby centers: DB sorted by distance + optional ML `nearby_prediction` extras. */
    getNearbyCenters: async (params: {
        latitude: number;
        longitude: number;
        categoryId?: string;
        address?: string;
    }) => {
        const search = new URLSearchParams();
        search.set('latitude', String(params.latitude));
        search.set('longitude', String(params.longitude));
        if (params.categoryId) search.set('categoryId', params.categoryId);
        if (params.address?.trim()) search.set('address', params.address.trim());
        const response = await api.get(`/waste/nearby-centers?${search.toString()}`);
        return response.data;
    },

    /**
     * Saves the waste log to PostgreSQL
     */
    logWaste: async (wasteData: WasteLogPayload, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        
        // Use a more robust way to append fields
        Object.entries(wasteData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                // Special handling for boolean to avoid backend string-truthy bugs
                const formattedValue = typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value);
                formData.append(key, formattedValue);
            }
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
    },

    /** All `Category` rows — use for resolving `categoryId` when saving a scan (works without any recycling center). */
    getWasteCategories: async () => {
        const response = await api.get('/waste/categories');
        return response.data;
    },

    getOrganizationStaff: async () => {
        const response = await api.get('/waste/organization-staff');
        return response.data;
    },
};

/** Legacy civic-issue API surface (unused by EcoSarthi waste flow; stubs keep old pages compiling). */
export const issueService = {
    getAllIssues: async () => ({ data: [] as unknown[] }),
    getDeptIssues: async () => ({ data: [] as unknown[] }),
    assignIssue: async (_payload: { issueId: string; staffId: string; comment?: string }) => ({ data: {} }),
};