// src/services/api.js

/**
 * Custom fetch wrapper to handle JSON responses and errors.
 */
async function fetchApi(url, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = response.statusText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorText;
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
    console.error(`API Error on ${url}:`, error);
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
  getDevices: async () => {
    return fetchApi('/api/devices');
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

  getAlerts: async (params = {}) => {
    const queryStr = new URLSearchParams(cleanParams(params)).toString();
    const url = `/api/alerts${queryStr ? `?${queryStr}` : ''}`;
    const data = await fetchApi(url);
    return data && data.content ? data.content : (Array.isArray(data) ? data : []);
  },

  resolveAlert: async (alertId) => {
    return fetchApi(`/api/alerts/${alertId}/resolve`, { method: 'POST' });
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

  updateNotificationSettings: async (settings, token) => {
    return fetchApi('/api/settings/notifications', {
      method: 'PATCH',
      body: JSON.stringify(settings),
      headers: { 'X-Verification-Token': token }
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
  }
};
