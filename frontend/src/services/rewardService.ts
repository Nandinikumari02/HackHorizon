import api from './api';

export const rewardService = {
  getMyRewards: () => api.get('/rewards/my'),
};