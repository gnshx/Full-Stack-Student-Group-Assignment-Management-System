import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('je_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('je_token');
      localStorage.removeItem('je_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Users
export const usersAPI = {
  me: () => api.get('/users/me'),
  students: () => api.get('/users/students'),
};

// Groups
export const groupsAPI = {
  create: (data) => api.post('/groups', data),
  mine: () => api.get('/groups/mine'),
  all: () => api.get('/groups'),
  get: (id) => api.get(`/groups/${id}`),
  addMember: (id, email) => api.post(`/groups/${id}/members`, { email }),
  removeMember: (id, studentId) => api.delete(`/groups/${id}/members/${studentId}`),
};

// Assignments
export const assignmentsAPI = {
  list: () => api.get('/assignments'),
  get: (id) => api.get(`/assignments/${id}`),
  create: (data) => api.post('/assignments', data),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
};

// Submissions
export const submissionsAPI = {
  confirm: (assignmentId) => api.post(`/submissions/${assignmentId}/confirm`),
  groupStatus: (groupId) => api.get(`/submissions/group/${groupId}`),
};

// Analytics
export const analyticsAPI = {
  overview: () => api.get('/analytics/overview'),
  assignment: (id) => api.get(`/analytics/assignment/${id}`),
};
