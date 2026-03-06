// Role Constants
export const ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  CLIENT: 'user',
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
  text: '#1a1a1a',
  textLight: '#535252ff',
  surface: '#ffffff',
  border: '#cccccc',
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.48,
    shadowRadius: 11.95,
    elevation: 10,
  },
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    h1: 32,
    h2: 24,
    h3: 18,
    body: 16,
    caption: 14,
    small: 12,
  },
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

export function hoursToHMS(totalSeconds) {
  totalSeconds = Math.floor(totalSeconds);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return `${String(h).padStart(2, "0")} h : ${String(m).padStart(2, "0")} m : ${String(s).padStart(2, "0")} s`;
}

export const LocalTime = value => {
  if (!value) return 'N/A';
  const d = new Date(value);
  console.log(d.toLocaleTimeString(), 'd.toLocaleTimeString()')
  return d.toLocaleTimeString();
};
