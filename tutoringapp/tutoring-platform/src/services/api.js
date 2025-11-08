import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Server responded with error
      throw new Error(error.response.data.error || 'An error occurred');
    } else if (error.request) {
      // Request made but no response
      throw new Error('No response from server');
    } else {
      // Something else happened
      throw error;
    }
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Availability API
export const availabilityAPI = {
  getAvailability: () => api.get('/availability'),
  createAvailability: (data) => api.post('/availability', data),
  updateAvailability: (id, data) => api.put(`/availability/${id}`, data),
  deleteAvailability: (id) => api.delete(`/availability/${id}`),
};

// Tutors API
export const tutorsAPI = {
  getTutors: (subject) => api.get('/tutors', { params: { subject } }),
  getTutorById: (id) => api.get(`/tutors/${id}`),
};

// Sessions API
export const sessionsAPI = {
  getSessions: (params) => api.get('/sessions', { params }),
  getSessionById: (id) => api.get(`/sessions/${id}`),
  createSession: (data) => api.post('/sessions', data),
  updateSessionStatus: (id, status) => api.patch(`/sessions/${id}/status`, { status }),
  cancelSession: (id) => api.delete(`/sessions/${id}`),
};

// Reports API
export const reportsAPI = {
  generateReport: (sessionId) => api.post(`/reports/session/${sessionId}`),
  getReport: (sessionId) => api.get(`/reports/session/${sessionId}`),
  getTutorReports: () => api.get('/reports'),
};

// Ratings API
export const ratingsAPI = {
  submitRating: (sessionId, data) => api.post(`/ratings/session/${sessionId}`, data),
  getRating: (sessionId) => api.get(`/ratings/session/${sessionId}`),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getTutors: () => api.get('/admin/tutors'),
  getTutorDetail: (tutorId) => api.get(`/admin/tutors/${tutorId}`),
  generateTutorSummary: (tutorId) => api.post(`/admin/tutors/${tutorId}/ai-summary`),
};

export default api;

