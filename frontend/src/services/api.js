const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('carebridge_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // Auth
  register: (userData) =>
    fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }).then(handleResponse),

  login: (credentials) =>
    fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    }).then(handleResponse),

  loginWithPasscode: (credentials) =>
    fetch(`${API_BASE_URL}/auth/login-passcode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    }).then(handleResponse),

  getMe: () =>
    fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  updatePreferences: (preferences) =>
    fetch(`${API_BASE_URL}/auth/preferences`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(preferences)
    }).then(handleResponse),

  linkProfile: (linkCode) =>
    fetch(`${API_BASE_URL}/auth/link-profile`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ linkCode })
    }).then(handleResponse),

  unlinkProfile: (elderlyId) =>
    fetch(`${API_BASE_URL}/auth/unlink-profile`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ elderlyId })
    }).then(handleResponse),

  regenerateLinkCode: () =>
    fetch(`${API_BASE_URL}/auth/regenerate-code`, {
      method: 'POST',
      headers: getAuthHeaders()
    }).then(handleResponse),

  // Profile
  getProfile: (elderlyId) =>
    fetch(`${API_BASE_URL}/profile/${elderlyId}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  updateProfile: (elderlyId, profileData) =>
    fetch(`${API_BASE_URL}/profile/${elderlyId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    }).then(handleResponse),

  addCaregiverNote: (elderlyId, note) =>
    fetch(`${API_BASE_URL}/profile/${elderlyId}/caregiver-notes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ note })
    }).then(handleResponse),

  // Medications
  getMedications: (elderlyId) =>
    fetch(`${API_BASE_URL}/medications/${elderlyId}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  addMedication: (elderlyId, medicationData) =>
    fetch(`${API_BASE_URL}/medications/${elderlyId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(medicationData)
    }).then(handleResponse),

  updateMedication: (id, medicationData) =>
    fetch(`${API_BASE_URL}/medications/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(medicationData)
    }).then(handleResponse),

  deleteMedication: (id) =>
    fetch(`${API_BASE_URL}/medications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }).then(handleResponse),

  getDailySchedule: (elderlyId, date) =>
    fetch(`${API_BASE_URL}/medications/${elderlyId}/schedule${date ? `?date=${date}` : ''}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  updateDoseStatus: (logId, status, notes) =>
    fetch(`${API_BASE_URL}/medications/log/${logId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes })
    }).then(handleResponse),

  getMedicationHistory: (elderlyId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE_URL}/medications/${elderlyId}/history?${query}`, {
      headers: getAuthHeaders()
    }).then(handleResponse);
  },

  // Appointments
  getAppointments: (elderlyId, status) =>
    fetch(`${API_BASE_URL}/appointments/${elderlyId}${status ? `?status=${status}` : ''}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  createAppointment: (elderlyId, appointmentData) =>
    fetch(`${API_BASE_URL}/appointments/${elderlyId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(appointmentData)
    }).then(handleResponse),

  updateAppointment: (id, appointmentData) =>
    fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(appointmentData)
    }).then(handleResponse),

  setAppointmentStatus: (id, status) =>
    fetch(`${API_BASE_URL}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    }).then(handleResponse),

  sendAppointmentReminder: (id) =>
    fetch(`${API_BASE_URL}/appointments/${id}/send-reminder`, {
      method: 'POST',
      headers: getAuthHeaders()
    }).then(handleResponse),

  // Adherence Stats
  getAdherenceStats: (elderlyId) =>
    fetch(`${API_BASE_URL}/adherence/${elderlyId}/stats`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  // Notifications
  getNotifications: (unreadOnly = false) =>
    fetch(`${API_BASE_URL}/notifications${unreadOnly ? '?unreadOnly=true' : ''}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  markNotificationRead: (id) =>
    fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    }).then(handleResponse),

  markAllNotificationsRead: () =>
    fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: 'POST',
      headers: getAuthHeaders()
    }).then(handleResponse),

  getSentEmails: () =>
    fetch(`${API_BASE_URL}/notifications/emails`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  clearEmails: () =>
    fetch(`${API_BASE_URL}/notifications/emails`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }).then(handleResponse),

  runSchedulerCheck: () =>
    fetch(`${API_BASE_URL}/notifications/run-check`, {
      method: 'POST',
      headers: getAuthHeaders()
    }).then(handleResponse),

  // Emergency SOS
  triggerEmergencySOS: (elderlyId, payload = {}) =>
    fetch(`${API_BASE_URL}/emergency/${elderlyId}/trigger`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),

  getEmergencyCard: (elderlyId) =>
    fetch(`${API_BASE_URL}/emergency/${elderlyId}/card`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  // Vitals
  logVitals: (elderlyId, vitalsData) =>
    fetch(`${API_BASE_URL}/vitals/${elderlyId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(vitalsData)
    }).then(handleResponse),

  getVitalsHistory: (elderlyId) =>
    fetch(`${API_BASE_URL}/vitals/${elderlyId}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  // Care Activities
  getActivities: (elderlyId) =>
    fetch(`${API_BASE_URL}/activity/${elderlyId}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  addCheckIn: (elderlyId, note) =>
    fetch(`${API_BASE_URL}/activity/${elderlyId}/check-in`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ note })
    }).then(handleResponse),

  // AI Assistant
  askAI: (question, elderlyId) =>
    fetch(`${API_BASE_URL}/ai/ask`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ question, elderlyId })
    }).then(handleResponse)
};
