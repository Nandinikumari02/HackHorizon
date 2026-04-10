import api from './api';

export const issueService = {
  // ✅ NEW: AI Image Analysis (Autofill support)
  // Backend: POST /api/issues/analyze
  analyzeImage: (imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile); // Key name 'image' matches backend upload.single('image')
    
    return api.post('/issues/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 1. [CITIZEN] - Create Issue with Multiple Images
  createIssue: (data: any, images: File[]) => {
    const formData = new FormData();

    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('address', data.address);
    formData.append('latitude', data.latitude?.toString() || "0");
    formData.append('longitude', data.longitude?.toString() || "0");
    formData.append('departmentId', data.departmentId);
    formData.append('categoryId', data.categoryId);

    // Saari images ko 'beforeImages' key ke saath append karein
    images.forEach((file) => {
      formData.append('beforeImages', file);
    });

    return api.post('/issues', formData);
  },  

  // 2. [CITIZEN] 
  getMyIssues: () => api.get('/issues/my'),

  // 3. [DEPT ADMIN] 
  getDeptIssues: () => api.get('/issues/dept'),

  // 4. [SUPER ADMIN]
  getAllIssues: () => api.get('/issues/all'), 

  // 5. [DEPT ADMIN] 
  assignIssue: (data: {issueId: string, staffId: string, comment?: string}) => 
    api.patch('/issues/assign', data),

  // 6. [COMMON] 
  getTimeline: (issueId: string) => api.get(`/issues/${issueId}/timeline`),

  toggleUpvote: (issueId: string) => 
    api.post(`/issues/${issueId}/upvote`),

  addComment: (issueId: string, content: string) => 
    api.post(`/issues/${issueId}/comment`, { content }),
};