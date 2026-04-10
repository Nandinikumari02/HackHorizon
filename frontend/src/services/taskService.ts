import api from './api';


export const API_BASE_URL = 'http://localhost:5000'; 

export const taskService = {
  // 1. Get Pending Tasks
  getMyTasks: () => api.get('/tasks/my-tasks'),

  // 2. Get Completed Tasks (Staff History)
  getMyCompletedTasks: () => api.get('/tasks/completed'),

  // 3. Complete Task
  completeTask: (taskId: string, formData: FormData) => 
    api.patch(`/tasks/complete/${taskId}`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data' 
      }
    }),
};