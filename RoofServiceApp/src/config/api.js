import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this to your backend server IP/URL
// export const API_BASE_URL = 'https://api.mainstreet-roofing.ca/api'; // For physical device
// export const SERVER_URL = 'https://api.mainstreet-roofing.ca' // For physical device

export const API_BASE_URL = 'http://10.0.2.2:5000/api';
export const SERVER_URL = 'http://10.0.2.2:5000';

// export const API_BASE_URL_IOS = 'http://localhost:5000/api'; // For iOS simulator

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Logout callback - will be set by AuthProvider
let onUnauthorized = null;

export const setOnUnauthorized = callback => {
  onUnauthorized = callback;
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async config => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      }
    } catch (error) {
      console.log('Error getting auth token:', error);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  async error => {
    // Check if user was deleted or unauthorized (401 or 404 on user-related endpoints)
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('user');
      // Trigger logout in the app
      if (onUnauthorized) {
        onUnauthorized();
      }
    }
    return Promise.reject(error);
  },
);

// API Methods
export const api = {
  // Auth
  login: credentials => apiClient.post('/auth/login', credentials),
  register: data => apiClient.post('/auth/register', data),
  getMe: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
  forgotPassword: email => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: data => apiClient.post('/auth/reset-password', data),

  // Leads/Quotes
  getLeads: (params = {}) => apiClient.get('/leads', { params }),
  searchLeads: (search, params = {}) =>
    apiClient.get('/leads', { params: { ...params, search } }),
  getLeadById: id => apiClient.get(`/leads/${id}`),
  createLead: (data, config = {}) =>
    apiClient.post('/leads/create', data, config),
  updateLead: (id, data) => apiClient.put(`/leads/${id}`, data),
  assignLead: (id, data) => apiClient.put(`/leads/${id}/assign`, data),
  deleteLead: id => apiClient.delete(`/leads/${id}`),
  updateMyLead: (id, data, config = {}) =>
    apiClient.put(`/leads/my/${id}`, data, config),

  // Users
  getUsers: role => apiClient.get(`/users${role ? `?role=${role}` : ''}`),
  getUserById: id => apiClient.get(`/users/${id}`),
  createUser: data => apiClient.post('/users', data),
  updateUser: (id, data) => apiClient.put(`/users/${id}`, data),
  deleteUser: id => apiClient.delete(`/users/${id}`),
  updateMe: data => apiClient.put('/users/me', data),

  // Jobs (for employees)
  getAllJobs: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiClient.get(`/jobs${params ? `?${params}` : ''}`);
  },
  getJobById: jobId => apiClient.get(`/jobs/${jobId}`),
  createJob: data => apiClient.post('/jobs', data),
  updateJob: (jobId, data) => apiClient.put(`/jobs/${jobId}`, data),
  updateJobStatus: (jobId, data) =>
    apiClient.put(`/jobs/${jobId}/status`, data),
  getEmployeeJobs: employeeId => apiClient.get(`/jobs/employee/${employeeId}`),
  getMyJobs: () => apiClient.get('/jobs/my-jobs'),
  startJob: jobId => apiClient.post(`/jobs/${jobId}/start`),
  completeJob: (jobId, data) => apiClient.post(`/jobs/${jobId}/complete`, data),
  getJobLogs: jobId => apiClient.get(`/jobs/${jobId}/logs`),
  getEmployeeStats: employeeId =>
    apiClient.get(`/jobs/stats/${employeeId || ''}`),
  deleteJob: jobId => apiClient.delete(`/jobs/${jobId}`),

  // Services
  getServices: () => apiClient.get('/services'),
  getServiceById: id => apiClient.get(`/services/${id}`),
  createService: (data, config = {}) =>
    apiClient.post('/services', data, config),
  updateService: (id, data, config = {}) =>
    apiClient.put(`/services/${id}`, data, config),
  deleteService: id => apiClient.delete(`/services/${id}`),

  // Gallery
  getGallery: () => apiClient.get('/gallery'),
  createGalleryItem: data =>
    apiClient.post('/gallery', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateGalleryItem: (id, data) =>
    apiClient.put(`/gallery/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteGalleryItem: id => apiClient.delete(`/gallery/${id}`),

  // Image upload
  uploadImage: formData =>
    apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default apiClient;
