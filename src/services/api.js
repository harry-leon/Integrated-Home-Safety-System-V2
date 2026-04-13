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
    const text = await response.text();
    if (!text) return null;

    return JSON.parse(text);
  } catch (error) {
    console.error(`API Error on ${url}:`, error);
    throw error;
  }
}

export const smartLockApi = {
  /**
   * Fetches the list of access logs.
   * @param {Object} params - Query parameters like deviceId, date
   */
  getAccessLogs: async (params = {}) => {
    const queryStr = new URLSearchParams(params).toString();
    const url = `/api/access-logs${queryStr ? `?${queryStr}` : ''}`;
    return fetchApi(url);
  },

  /**
   * Fetches the list of fingerprints.
   * Note: This might return empty until the backend is fully implemented.
   */
  getFingerprints: async (deviceId) => {
    const params = deviceId ? { deviceId } : {};
    const queryStr = new URLSearchParams(params).toString();
    const url = `/api/fingerprints${queryStr ? `?${queryStr}` : ''}`;
    return fetchApi(url);
  },

  /**
   * Fetches external security alerts.
   * Note: This might return empty until the backend is fully implemented.
   */
  getAlerts: async (deviceId) => {
    const params = deviceId ? { deviceId } : {};
    const queryStr = new URLSearchParams(params).toString();
    const url = `/api/alerts${queryStr ? `?${queryStr}` : ''}`;
    return fetchApi(url);
  }
};
