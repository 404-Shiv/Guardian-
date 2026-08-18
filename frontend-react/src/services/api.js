import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const getHealth = async () => {
  try {
    const response = await api.get('/api/health');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const loadSampleLogs = async () => {
  const response = await api.post('/api/logs/upload-sample');
  return response.data;
};

export const runAnalysis = async () => {
  const response = await api.post('/api/analyze');
  return response.data;
};

export const getIncidents = async () => {
  const response = await api.get('/api/incidents');
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get('/api/dashboard/stats');
  return response.data;
};

export const getAlerts = async () => {
  const response = await api.get('/api/alerts');
  return response.data;
};

export const executeMitigation = async (incidentId, planId = 'plan_c') => {
  const response = await api.post(`/api/incidents/${incidentId}/respond?plan_id=${planId}`);
  return response.data;
};

// Vault REST Endpoints
export const authorizeContainer = async (containerId) => {
  const response = await api.post(`/api/vault/containers/${containerId}/authorize`);
  return response.data;
};

export const rotateContainer = async (containerId) => {
  const response = await api.post(`/api/vault/containers/${containerId}/rotate`);
  return response.data;
};

export const revokeContainer = async (containerId) => {
  const response = await api.post(`/api/vault/containers/${containerId}/revoke`);
  return response.data;
};

// Config REST Endpoints
export const updateConfig = async (payload) => {
  const response = await api.post('/api/config/update', payload);
  return response.data;
};

export const restartDaemon = async () => {
  const response = await api.post('/api/system/restart-daemon');
  return response.data;
};

export default api;
