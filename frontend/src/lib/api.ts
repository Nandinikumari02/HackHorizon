import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Your Node.js server URL
});

// This interceptor automatically grabs your JWT from storage 
// and puts it in the header of every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;