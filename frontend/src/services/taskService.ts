import api from './api';

export const API_BASE_URL = 'http://localhost:5000';

/** Staff field operations: assigned pickups, history, complete with photo proofs. */
export const taskService = {
  getAssignedPickups: () => api.get('/pickups/assigned'),

  getCompletedPickups: () => api.get('/pickups/history'),

  completePickupWithProof: (requestId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return api.patch(`/pickups/complete/${requestId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
