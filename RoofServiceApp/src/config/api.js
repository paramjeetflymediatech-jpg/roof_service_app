import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    // const userData = await AsyncStorage.getItem('user');
    // if (userData) {
      const user = JSON.parse(userData);
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// API Methods
export const api = {
  // Auth
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (data) => apiClient.post('/auth/register', data),
  
  // Leads/Quotes
  getLeads: () => apiClient.get('/leads'),
  getLeadById: (id) => apiClient.get(`/leads/${id}`),
  createLead: (data) => apiClient.post('/leads', data),
  updateLead: (id, data) => apiClient.put(`/leads/${id}`, data),
  assignLead: (id, data) => apiClient.put(`/leads/${id}/assign`, data),
  
  // Users
  getUsers: (role) => apiClient.get(`/users?role=${role}`),
  getUserById: (id) => apiClient.get(`/users/${id}`),
  
  // Jobs (for employees)
  getEmployeeJobs: (employeeId) => apiClient.get(`/jobs/employee/${employeeId}`),
  updateJobStatus: (jobId, data) => apiClient.put(`/jobs/${jobId}`, data),
  
  // Image upload
  uploadImage: (formData) => apiClient.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export default apiClient;
