/**
 * CareLink Frontend API Integration Client
 * Connects React UI Contexts to the deployed CareLink backend.
 */

export const API_BASE = 'https://health-a1gj.onrender.com/api';

const fetchJSON = async (endpoint, options = {}) => {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'API Request Failed');
    }
    return await res.json();
  } catch (error) {
    console.warn(`[CareLink API Fallback] ${endpoint}:`, error.message);
    throw error;
  }
};

export const apiService = {
  // Auth API
  login: (email, password) => fetchJSON('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),

  register: (userData) => fetchJSON('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),

  getDemoUsers: () => fetchJSON('/auth/demo-users'),

  // Care Team API
  getCareTeam: (patientId) => fetchJSON(`/careteam/${patientId}`),
  addSmsGuardian: (patientId, name, phone) => fetchJSON('/careteam/add-sms-guardian', {
    method: 'POST',
    body: JSON.stringify({ patientId, name, phone })
  }),

  // Requests API
  getRequests: (userId) => fetchJSON(`/requests/${userId}`),
  sendRequest: (reqData) => fetchJSON('/requests/send', {
    method: 'POST',
    body: JSON.stringify(reqData)
  }),
  respondRequest: (requestId, accept) => fetchJSON('/requests/respond', {
    method: 'PUT',
    body: JSON.stringify({ requestId, accept })
  }),

  // Telemetry & Vitals API
  getVitals: (patientId) => fetchJSON(`/vitals/${patientId}`),
  updateVitals: (patientId, vitals) => fetchJSON('/vitals/update', {
    method: 'POST',
    body: JSON.stringify({ patientId, vitals })
  }),
  getVitalsHistory: (patientId) => fetchJSON(`/vitals/history/${patientId}`),
  getThresholds: (patientId) => fetchJSON(`/vitals/thresholds/${patientId}`),
  updateThresholds: (patientId, thresholds) => fetchJSON(`/vitals/thresholds/${patientId}`, {
    method: 'POST',
    body: JSON.stringify(thresholds)
  }),

  // Notifications API
  getNotifications: () => fetchJSON('/notifications'),
  markNotificationsRead: () => fetchJSON('/notifications/mark-read', { method: 'PUT' }),
  getSmsLogs: () => fetchJSON('/notifications/sms-logs'),
  // SMS API
  sendSms: (toPhone, message) => fetchJSON('/notifications/sms', {
    method: 'POST',
    body: JSON.stringify({ toPhone, message })
  }),
};
