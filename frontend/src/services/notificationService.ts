import api from './api';

export const notificationService = {
  getMyNotifications: () => api.get('/notifications'),

  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),

  markAllRead: () => api.post('/notifications/mark-all-read'),
};