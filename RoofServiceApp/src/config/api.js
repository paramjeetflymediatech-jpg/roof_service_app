import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  API_BASE_URL as ENV_API_BASE_URL,
  SERVER_URL as ENV_SERVER_URL,
} from '@env';
import { Platform } from 'react-native';

// Use environment variables from .env file 
// Falls back to localhost for development if .env is not configured
export const API_BASE_URL = ENV_API_BASE_URL || "http://localhost:5001/api";
export const SERVER_URL = ENV_SERVER_URL || 'http://localhost:5001';
// export const API_BASE_URL = ENV_API_BASE_URL || Platform.OS == "android" ? "http://10.0.2.2:5001/api" : "http://localhost:5001/api";
// export const SERVER_URL = ENV_SERVER_URL || Platform.OS === "android" ? 'http://10.0.2.2:5001' : 'http://localhost:5001';
console.log(API_BASE_URL, '------------a')

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
  getAllUsers: (params = {}) => apiClient.get('/users', { params }),
  getUserById: id => apiClient.get(`/users/${id}`),
  createUser: data => apiClient.post('/users', data),
  updateUser: (id, data) => apiClient.put(`/users/${id}`, data),
  deleteUser: id => apiClient.delete(`/users/${id}`),
  updateProfile: data => apiClient.put('/users/me', data),
  uploadProfilePicture: formData =>
    apiClient.post('/users/me/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  deleteMyAccount: () => apiClient.delete('/users/me'),
  requestAccountDeletion: () => apiClient.post('/users/me/request-deletion'),
  cancelAccountDeletion: () => apiClient.post('/users/me/cancel-deletion'),

  // Jobs (for employees)
  getAllJobs: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiClient.get(`/jobs${params ? `?${params}` : ''}`);
  },
  getJobById: jobId => apiClient.get(`/jobs/${jobId}`),
  createJob: data => apiClient.post('/jobs', data),
  createSelfJob: (data, config = {}) => apiClient.post('/jobs/self-create', data, config),
  updateJob: (jobId, data) => apiClient.put(`/jobs/${jobId}`, data),
  updateJobStatus: (jobId, data) =>
    apiClient.put(`/jobs/${jobId}/status`, data),
  getEmployeeJobs: (employeeId, params = {}) =>
    apiClient.get(`/jobs/employee/${employeeId}`, { params }),
  getMyJobs: (params = {}) => apiClient.get('/jobs/my-jobs', { params }),
  startJob: (jobId, data) => apiClient.post(`/jobs/${jobId}/start`, data),
  pauseJob: jobId => apiClient.post(`/jobs/${jobId}/pause`),
  resumeJob: jobId => apiClient.post(`/jobs/${jobId}/resume`),
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
  getGallery: params => apiClient.get('/gallery', { params }),
  getGalleryFolders: () => apiClient.get('/gallery/folders'),
  getGalleryCategories: params =>
    apiClient.get('/gallery/categories', { params }),
  createGalleryItem: data => apiClient.post('/gallery', data),
  updateGalleryItem: (id, data) => apiClient.put(`/gallery/${id}`, data),
  deleteGalleryItem: id => apiClient.delete(`/gallery/${id}`),

  // Image upload
  uploadImage: formData =>
    apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Estimates
  getEstimates: (params = {}) => apiClient.get('/estimates', { params }),
  getEstimateById: id => apiClient.get(`/estimates/${id}`),
  createEstimate: data => apiClient.post('/estimates', data),
  updateEstimate: (id, data) => apiClient.put(`/estimates/${id}`, data),
  deleteEstimate: id => apiClient.delete(`/estimates/${id}`),

  // Invoices
  getInvoices: (params = {}) => apiClient.get('/invoices', { params }),
  getInvoiceById: id => apiClient.get(`/invoices/${id}`),
  createInvoice: data => apiClient.post('/invoices', data),
  updateInvoice: (id, data) => apiClient.put(`/invoices/${id}`, data),
  deleteInvoice: id => apiClient.delete(`/invoices/${id}`),

  // Timesheets
  getTimesheet: (employeeId, params = {}) =>
    apiClient.get(`/timesheets/employee/${employeeId}`, { params }),
};

export default apiClient;
