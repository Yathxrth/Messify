import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('messify_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('messify_token');
      localStorage.removeItem('messify_user');
      // Redirect to login if token expired
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth & Profile API
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  getUsers: () => API.get('/auth/users'),
  updateProfile: (data) => API.put('/auth/profile', data),
  getFeeSummary: () => API.get('/auth/fee-summary'),
};

// Complaints API
export const complaintAPI = {
  create: (data) => API.post('/complaints', data),
  getMyComplaints: () => API.get('/complaints/my'),
  getAll: (params) => API.get('/complaints', { params }),
  updateStatus: (id, data) => API.put(`/complaints/${id}/status`, data),
  delete: (id) => API.delete(`/complaints/${id}`),
};

// Admin & Worker Management API
export const adminAPI = {
  getStudents: (params) => API.get('/admin/students', { params }),
  verifyStudent: (id, status) => API.put(`/admin/students/${id}/verify`, { status }),
  toggleBlock: (id, isBlocked) => API.put(`/admin/students/${id}/block`, { isBlocked }),
  getAttendanceReport: (date) => API.get('/admin/attendance-report', { params: { date } }),
  getAnalytics: () => API.get('/admin/analytics'),
  getFilteredRatings: (params) => API.get('/admin/ratings-filtered', { params }),
};

// Menu API
export const menuAPI = {
  getAll: () => API.get('/menus'),
  getToday: () => API.get('/menus/today'),
  create: (data) => API.post('/menus', data),
  update: (id, data) => API.put(`/menus/${id}`, data),
  delete: (id) => API.delete(`/menus/${id}`),
};

// OptOut API
export const optoutAPI = {
  create: (data) => API.post('/optouts', data),
  getMine: () => API.get('/optouts/me'),
  cancel: (id) => API.delete(`/optouts/${id}`),
  getStats: (date) => API.get(`/optouts/stats${date ? `?date=${date}` : ''}`),
  getRefund: (studentId, startDate, endDate) =>
    API.get(`/optouts/refund/${studentId}?startDate=${startDate}&endDate=${endDate}`),
};

// Feedback API
export const feedbackAPI = {
  submit: (data) => API.post('/feedback', data),
  getAll: (params) => API.get('/feedback', { params }),
  getStats: () => API.get('/feedback/stats'),
};

// Notification API
export const notificationAPI = {
  getAll: (params) => API.get('/notifications', { params }),
  create: (data) => API.post('/notifications', data),
  delete: (id) => API.delete(`/notifications/${id}`),
};

export default API;
