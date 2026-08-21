import axios from 'axios';

// Create Axios client instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('clp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: centralized error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message,
    });
    return Promise.reject(error);
  }
);

// -------------------------------------------------------------
// Health Check Service
// -------------------------------------------------------------
export const getHealthStatus = async () => {
  const response = await api.get('/health');
  return response.data;
};

// -------------------------------------------------------------
// Authentication Services
// -------------------------------------------------------------
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// -------------------------------------------------------------
// Student Profile Services & Profile Picture Upload
// -------------------------------------------------------------
export const getStudentProfile = async () => {
  const response = await api.get('/profile');
  return response.data;
};

export const updateStudentProfile = async (profileData) => {
  const response = await api.put('/profile', profileData);
  return response.data;
};

export const uploadProfilePictureApi = async (formData) => {
  const response = await api.post('/profile/picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const removeProfilePictureApi = async () => {
  const response = await api.delete('/profile/picture');
  return response.data;
};

export const fetchStudentsApi = async (params = {}) => {
  const response = await api.get('/profile/students', { params });
  return response.data;
};

export const fetchStudentByIdApi = async (id) => {
  const response = await api.get(`/profile/students/${id}`);
  return response.data;
};

// -------------------------------------------------------------
// Opportunities Services
// -------------------------------------------------------------
export const fetchOpportunities = async (params = {}) => {
  const response = await api.get('/opportunities', { params });
  return response.data;
};

export const fetchOpportunityById = async (id) => {
  const response = await api.get(`/opportunities/${id}`);
  return response.data;
};

export const createOpportunityApi = async (opportunityData) => {
  const response = await api.post('/opportunities', opportunityData);
  return response.data;
};

export const updateOpportunityApi = async (id, opportunityData) => {
  const response = await api.put(`/opportunities/${id}`, opportunityData);
  return response.data;
};

export const deleteOpportunityApi = async (id) => {
  const response = await api.delete(`/opportunities/${id}`);
  return response.data;
};

// -------------------------------------------------------------
// Saved Opportunities Services
// -------------------------------------------------------------
export const fetchSavedOpportunities = async () => {
  const response = await api.get('/saved');
  return response.data;
};

export const saveOpportunityApi = async (opportunityId) => {
  const response = await api.post(`/saved/${opportunityId}`);
  return response.data;
};

export const unsaveOpportunityApi = async (opportunityId) => {
  const response = await api.delete(`/saved/${opportunityId}`);
  return response.data;
};

// -------------------------------------------------------------
// Application Tracking Services
// -------------------------------------------------------------
export const fetchApplications = async () => {
  const response = await api.get('/applications');
  return response.data;
};

export const trackApplicationApi = async (opportunityId, status = 'Applied') => {
  const response = await api.post(`/applications/${opportunityId}`, { status });
  return response.data;
};

export const updateApplicationStatusApi = async (opportunityId, status) => {
  const response = await api.patch(`/applications/${opportunityId}`, { status });
  return response.data;
};

// -------------------------------------------------------------
// Recommendation Engine Service
// -------------------------------------------------------------
export const fetchRecommendations = async () => {
  const response = await api.get('/recommendations');
  return response.data;
};

export const fetchProjectRecommendationsApi = async (projectId) => {
  const response = await api.get(`/recommendations/project/${projectId}`);
  return response.data;
};

// -------------------------------------------------------------
// Project Ideas & Team Formation Services
// -------------------------------------------------------------
export const createProjectApi = async (projectData) => {
  const response = await api.post('/projects', projectData);
  return response.data;
};

export const fetchProjectsApi = async (params = {}) => {
  const response = await api.get('/projects', { params });
  return response.data;
};

export const fetchProjectByIdApi = async (id) => {
  const response = await api.get(`/projects/${id}`);
  return response.data;
};

export const fetchMyProjectsApi = async () => {
  const response = await api.get('/projects/me/all');
  return response.data;
};

export const fetchProjectCandidatesApi = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/candidates`);
  return response.data;
};

export const deleteProjectApi = async (id) => {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
};

// -------------------------------------------------------------
// Team Invitations Services
// -------------------------------------------------------------
export const sendTeamInvitationApi = async (invitationData) => {
  const response = await api.post('/invitations', invitationData);
  return response.data;
};

export const fetchMyInvitationsApi = async () => {
  const response = await api.get('/invitations/me');
  return response.data;
};

export const respondToInvitationApi = async (invitationId, status) => {
  const response = await api.put(`/invitations/${invitationId}/respond`, { status });
  return response.data;
};

// -------------------------------------------------------------
// Admin Services
// -------------------------------------------------------------
export const fetchAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const fetchRegisteredStudents = async () => {
  const response = await api.get('/admin/students');
  return response.data;
};

export default api;
