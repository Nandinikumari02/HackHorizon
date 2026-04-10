import api from './api';

// 1. Interface ko Backend (Prisma Model) ke hisab se update kiya
export interface SecurityScanResponse {
  id: string;
  buildingName: string;
  location: string;
  constructionYear: number;
  lastRenovation: number;
  imagePath: string;
  healthScore: number;
  riskLevel: string;
  summary: string;
  recommendations: string[];
  imageConfidence: number;
  createdAt: string;
}

// User se lene wali details ka type
export interface ScanDetails {
  name: string;
  location: string;
  year: string;
  renovation: string;
}

export const securityService = {
  /**
   * ✅ Send infrastructure image + details for AI Security Analysis
   * Backend Endpoint: POST /api/security/analyze
   */
  scanInfrastructure: (imageFile: File, details: ScanDetails) => {
    const formData = new FormData();
    
    // Key 'image' backend ke upload.single('image') se match kar rahi hai
    formData.append('image', imageFile);
    
    // Backend controller req.body se ye fields uthayega
    formData.append('name', details.name);
    formData.append('location', details.location);
    formData.append('construction_year', details.year);
    formData.append('last_renovation', details.renovation);

    return api.post<SecurityScanResponse>('/security/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * ✅ Fetch history of all scans for the logged-in user
   */
  getScanHistory: () => api.get<SecurityScanResponse[]>('/security/history'),
};