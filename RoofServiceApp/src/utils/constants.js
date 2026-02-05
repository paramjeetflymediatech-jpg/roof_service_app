// Role Constants
export const ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  CLIENT: 'client',
};

// Lead Status Constants
export const LEAD_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Job Status for Employees
export const JOB_STATUS = {
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

// Colors
export const COLORS = {
  primary: '#1e3a5f',
  secondary: '#f5a623',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  white: '#ffffff',
  background: '#f5f5f5',
  text: '#333333',
  textLight: '#666666',
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  TIMEOUT: 10000,
};

// Screen Names
export const SCREENS = {
  LOGIN: 'Login',
  CLIENT_HOME: 'ClientHome',
  CLIENT_QUOTE: 'ClientQuote',
  ADMIN_DASHBOARD: 'AdminDashboard',
  ADMIN_QUOTES: 'AdminQuotes',
  ADMIN_ASSIGN: 'AdminAssign',
  EMPLOYEE_DASHBOARD: 'EmployeeDashboard',
  EMPLOYEE_JOB_DETAIL: 'EmployeeJobDetail',
};
