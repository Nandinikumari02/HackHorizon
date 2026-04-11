import axios from 'axios';

const API_URL = "http://localhost:5000/api/auth";

// Create an axios instance to handle token injection automatically
const authApi = axios.create({
  baseURL: API_URL,
});

// Interceptor to add Bearer token to every request
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('eco_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  // 1. Get Current User Data (Fixes the 500 error source)
  getMe: async () => {
    try {
      const response = await authApi.get('/me');
      return response.data;
    } catch (error) {
      // If token is invalid or expired, clear storage
      localStorage.removeItem('eco_token');
      throw error;
    }
  },

  // 2. Register (Payload matches your backend userData)
  register: async (userData: any) => {
    const response = await axios.post(`${API_URL}/register`, userData);
    if (response.data.token) {
      localStorage.setItem('eco_token', response.data.token);
    }
    return response.data;
  },

  // 3. Login
  login: async (credentials: { email: string; pass: string }) => {
    const response = await axios.post(`${API_URL}/login`, credentials);
    if (response.data.token) {
      localStorage.setItem('eco_token', response.data.token);
    }
    return response.data;
  },

  // 4. Logout
  logout: () => {
    localStorage.removeItem('eco_token');
    window.location.href = '/login';
  },

  forgotPassword: async (_email: string) => {
    throw new Error('Password reset is not enabled for this build.');
  },

  resetPassword: async (_payload: { email: string; otp: string; newPassword: string }) => {
    throw new Error('Password reset is not enabled for this build.');
  },
};