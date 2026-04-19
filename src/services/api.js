// src/services/api.js

/**
 * Custom fetch wrapper to handle JSON responses and errors.
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname)
    ? 'http://localhost:8080'
    : '');

const isAbsoluteUrl = (value) => /^https?:\/\//i.test(value);

const resolveUrl = (url) => {
  if (!url) return url;
  if (isAbsoluteUrl(url)) return url;
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
  return url;
};

async function fetchApi(url, options = {}) {
  const resolvedUrl = resolveUrl(url);
  const token = localStorage.getItem('sentinel_token');
  const isFormData = options.body instanceof FormData;
  const defaultHeaders = {};

  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`; // Hoặc định dạng khác nếu BE yêu cầu
  }

  try {
    const response = await fetch(resolvedUrl, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be invalid or expired, clear it
        localStorage.removeItem('sentinel_token');
        localStorage.removeItem('sentinel_user');
        window.location.href = '/login';
      }
      const errorText = await response.text();
      let errorMessage = response.statusText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorText;
      } catch (e) {
        // Not a JSON error response
      }
      throw new Error(errorMessage || `HTTP ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) return null;

    // Fast check for empty response
    if (options.responseType === 'blob') {
      return await response.blob();
    }
    
    const text = await response.text();
    if (!text) return null;

    return JSON.parse(text);
  } catch (error) {
    console.error(`API Error on ${resolvedUrl}:`, error);
    throw error;
  }
}

/**
 * Clean up query parameters by removing undefined or null values
 */
const cleanParams = (params) => {
  const cleaned = {};
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      cleaned[key] = params[key];
    }
  });
  return cleaned;
};

export const smartLockApi = {
  login: async (email, password) => {
    return fetchApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (fullName, email, password) => {
    return fetchApi('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password }),
    });
  },

  getDevices: async () => {
    return fetchApi('/api/devices');
  },

  sendLockToggle: async (deviceId) => {
    return fetchApi(`/api/devices/${deviceId}/lock/toggle`, {
      method: 'POST',
    });
  },

  getAccessLogs: async (params = {}) => {
    const queryStr = new URLSearchParams(cleanParams(params)).toString();
    const url = `/api/access-logs${queryStr ? `?${queryStr}` : ''}`;
    const data = await fetchApi(url);
    return data && data.content ? data.content : (Array.isArray(data) ? data : []);
  },

  getFingerprints: async (deviceId) => {
    const params = deviceId ? { deviceId } : {};
    const queryStr = new URLSearchParams(cleanParams(params)).toString();
    const url = `/api/fingerprints${queryStr ? `?${queryStr}` : ''}`;
    return fetchApi(url);
  },

  enrollFingerprint: async (payload, verificationToken) => {
    return fetchApi('/api/fingerprints/enroll', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'X-Verification-Token': verificationToken,
      },
    });
  },

  deleteFingerprint: async (fingerprintId, verificationToken) => {
    return fetchApi(`/api/fingerprints/${fingerprintId}`, {
      method: 'DELETE',
      headers: {
        'X-Verification-Token': verificationToken,
      },
    });
  },

  getAlerts: async (params = {}) => {
    const queryStr = new URLSearchParams(cleanParams(params)).toString();
    const url = `/api/alerts${queryStr ? `?${queryStr}` : ''}`;
    const data = await fetchApi(url);
    return data && data.content ? data.content : (Array.isArray(data) ? data : []);
  },

  resolveAlert: async (alertId, verificationToken) => {
    return fetchApi(`/api/alerts/${alertId}/resolve`, {
      method: 'POST',
      headers: verificationToken ? { 'X-Verification-Token': verificationToken } : {},
    });
  },

  getAnalyticsSnapshot: async () => {
    return fetchApi('/api/analytics/snapshot');
  },

  getWeeklyReports: async (deviceId) => {
    return fetchApi(`/api/analytics/reports/weekly?deviceId=${deviceId}`);
  },

  getDeviceSettings: async (deviceId) => {
    return fetchApi(`/api/settings/device/${deviceId}`);
  },

  updateDeviceSettings: async (deviceId, settings, token) => {
    return fetchApi(`/api/settings/device/${deviceId}`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
      headers: { 'X-Verification-Token': token }
    });
  },

  getNotificationSettings: async () => {
    return fetchApi('/api/settings/notifications');
  },

  reAuthenticate: async (password) => {
    return fetchApi('/api/auth/re-auth', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },

  updateNotificationSettings: async (settings, token) => {
    return fetchApi('/api/settings/notifications', {
      method: 'PATCH',
      body: JSON.stringify(settings),
      headers: { 'X-Verification-Token': token }
    });
  },

  getWeeklySnapshot: async () => {
    return fetchApi('/api/analytics/snapshot/weekly');
  },

  getCurrentProfile: async () => {
    return fetchApi('/api/me/profile');
  },

  updateCurrentProfile: async (payload) => {
    return fetchApi('/api/me/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchApi('/api/me/profile/avatar', {
      method: 'POST',
      body: formData,
    });
  },

  getLoginActivity: async () => {
    return fetchApi('/api/me/logins');
  },

  logout: async () => {
    return fetchApi('/api/auth/logout', {
      method: 'POST',
    });
  },

  exportAlerts: async (params = {}) => {
    const queryStr = new URLSearchParams(cleanParams(params)).toString();
    const url = `/api/alerts/export${queryStr ? `?${queryStr}` : ''}`;
    return fetchApi(url, { responseType: 'blob' });
  },

  exportLogs: async (params = {}) => {
    const queryStr = new URLSearchParams(cleanParams(params)).toString();
    const url = `/api/access-logs/export${queryStr ? `?${queryStr}` : ''}`;
    return fetchApi(url, { responseType: 'blob' });
  },

  // Admin Management
  getAdminUsers: async () => {
    return fetchApi('/api/admin/users');
  },

  getAdminSessions: async () => {
    return fetchApi('/api/admin/sessions');
  },

  toggleUserActive: async (userId) => {
    return fetchApi(`/api/admin/users/${userId}/toggle-active`, {
      method: 'PATCH'
    });
  },

  changeUserRole: async (userId, role) => {
    return fetchApi(`/api/admin/users/${userId}/role?role=${role}`, {
      method: 'PATCH'
    });
  }
};
