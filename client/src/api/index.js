import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Send HttpOnly cookies with every request
});

// Handle 401 globally — attempt refresh token logic
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalConfig = err.config;

    if (originalConfig.url !== '/auth/refresh' && err.response) {
      // If 401 Unauthorized and we haven't retried yet
      if (err.response.status === 401 && !originalConfig._retry) {
        originalConfig._retry = true;

        try {
          // Attempt to refresh token using the HttpOnly refresh cookie
          await api.post('/auth/refresh');
          
          // Retry original request
          return api(originalConfig);
        } catch (_error) {
          // Refresh failed, user needs to login again
          localStorage.removeItem('sf_company');
          window.location.href = '/login';
          return Promise.reject(_error);
        }
      }
    }

    // If it's a 401 from the refresh endpoint itself (or another error), force logout
    if (err.response?.status === 401 && originalConfig.url === '/auth/refresh') {
      localStorage.removeItem('sf_company');
      window.location.href = '/login';
    }

    return Promise.reject(err);
  }
);

// --- Auth ---
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.put(`/auth/reset-password/${token}`, data),
};

// --- Roles ---
export const rolesAPI = {
  list: () => api.get('/roles'),
  get: (id) => api.get(`/roles/${id}`),
  create: (data) => api.post('/roles', data),
  update: (id, data) => api.patch(`/roles/${id}`, data),
  remove: (id) => api.delete(`/roles/${id}`),
  parseJD: (formData) => api.post('/roles/parse-jd', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// --- Email ---
export const emailAPI = {
  list: () => api.get('/email'),
  create: (data) => api.post('/email', data),
  delete: (id) => api.delete(`/email/${id}`),
};

// --- Candidates ---
export const candidatesAPI = {
  create: (roleId, data) => api.post(`/roles/${roleId}/candidates`, data),
  bulkUpload: (roleId, formData) => api.post(`/roles/${roleId}/candidates/bulk`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  upload: (roleId, formData) =>
    api.post(`/roles/${roleId}/candidates/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadGlobal: (formData) =>
    api.post('/candidates/upload-global', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  list: (roleId, params) => api.get(`/roles/${roleId}/candidates`, { params }),
  getAll: () => api.get('/candidates'),
  get: (id) => api.get(`/candidates/${id}`),
  updateStatus: (id, data) => api.patch(`/candidates/${id}/status`, data),
  remove: (id) => api.delete(`/candidates/${id}`),
  export: (roleId, format = 'csv') =>
    api.get(`/roles/${roleId}/export`, { params: { format }, responseType: 'blob' }),
  analytics: (roleId) => api.get(`/roles/${roleId}/analytics`),
};

export default api;
