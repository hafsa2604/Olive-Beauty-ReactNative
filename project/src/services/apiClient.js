import { API_BASE_URL } from './apiConfig';

const DEFAULT_TIMEOUT = 10000; // 10 seconds

/**
 * Custom Error Class for API Client
 */
export class APIError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Standard fetch with timeout wrapper
 */
async function fetchWithTimeout(url, options = {}) {
  const { timeout = DEFAULT_TIMEOUT } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Core Request Sender with Retry Logic
 */
async function request(endpoint, options = {}, retries = 2) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const fetchOptions = {
    ...options,
    headers
  };

  if (fetchOptions.body && typeof fetchOptions.body === 'object') {
    fetchOptions.body = JSON.stringify(fetchOptions.body);
  }

  if (__DEV__) {
    console.log(`[API Client Request] ${fetchOptions.method || 'GET'} ${url}`, fetchOptions.body || '');
  }

  try {
    const response = await fetchWithTimeout(url, fetchOptions);
    
    let responseData = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (__DEV__) {
      console.log(`[API Client Response] ${response.status} ${url}`, responseData);
    }

    if (!response.ok) {
      const errorMessage = (responseData && responseData.error) || `HTTP error! status: ${response.status}`;
      const errorCode = responseData && responseData.code;
      throw new APIError(errorMessage, response.status, errorCode);
    }

    return responseData;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout. The server took too long to respond.`);
    }

    // If it's a network/intermittent issue and we have retries left, try again
    if (!(error instanceof APIError) && retries > 0) {
      if (__DEV__) {
        console.warn(`[API Client Retry] Intermittent issue, retrying... (${retries} attempts left)`);
      }
      return request(endpoint, options, retries - 1);
    }

    throw error;
  }
}

/**
 * Expose clean, reusable REST verb methods
 */
export const apiClient = {
  get: (endpoint, options = {}) => {
    return request(endpoint, { method: 'GET', ...options });
  },
  
  post: (endpoint, body, options = {}) => {
    return request(endpoint, { method: 'POST', body, ...options });
  },
  
  put: (endpoint, body, options = {}) => {
    return request(endpoint, { method: 'PUT', body, ...options });
  },
  
  delete: (endpoint, options = {}) => {
    return request(endpoint, { method: 'DELETE', ...options });
  }
};
