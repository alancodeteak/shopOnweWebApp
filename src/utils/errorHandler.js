/**
 * Utility function to extract error information for ErrorMessage component
 * @param {Error|Object} error - The error object
 * @returns {Object} Error information for ErrorMessage component
 */
export const getErrorMessage = (error) => {
  if (!error) return { message: "An unknown error occurred." };

  // Handle string errors
  if (typeof error === 'string') {
    return { message: error };
  }

  // Handle error objects with message property
  if (error.message) {
    return { message: error.message };
  }

  // Handle API error responses
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || `HTTP ${status} error`;
    
    return {
      message,
      statusCode: status,
      isNetworkError: status === 0,
      isServerError: status >= 500
    };
  }

  // Handle network errors
  if (error.message === 'Network Error' || error.code === 'NETWORK_ERROR') {
    return {
      message: 'Network error. Please check your internet connection.',
      isNetworkError: true
    };
  }

  // Handle timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return {
      message: 'Request timed out. Please check your connection and try again.',
      isNetworkError: true
    };
  }

  // Default fallback
  return { message: "An unknown error occurred." };
};

/**
 * Detect if an error is a network error
 * @param {Error|Object|string} error - The error object or message
 * @returns {boolean} True if it's a network error
 */
export const isNetworkError = (error) => {
  if (!error) return false;
  
  // Handle string errors - check for network-related messages
  if (typeof error === 'string') {
    const networkErrorMessages = [
      'Network error',
      'Network Error',
      'Failed to fetch',
      'connection',
      'internet',
      'offline',
      'timeout',
      'ECONNABORTED'
    ];
    return networkErrorMessages.some(msg => 
      error.toLowerCase().includes(msg.toLowerCase())
    );
  }
  
  // Check for network error message
  if (error.message === 'Network Error') return true;
  
  // Check for status 0 (network error)
  if (error.response?.status === 0) return true;
  
  // Check for connection timeout
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) return true;
  
  // Check for fetch network errors
  if (error.name === 'TypeError' && error.message?.includes('fetch')) return true;
  
  // Check for custom network error objects from Redux
  if (error.isNetworkError) return true;
  
  return false;
};

/**
 * Detect if an error is a server error (5xx status codes)
 * @param {Error|Object|string} error - The error object or message
 * @returns {boolean} True if it's a server error
 */
export const isServerError = (error) => {
  if (!error) return false;
  
  // Handle string errors - check for server-related messages
  if (typeof error === 'string') {
    const serverErrorMessages = [
      'server error',
      'internal server',
      '500',
      '502',
      '503',
      '504',
      'maintenance'
    ];
    return serverErrorMessages.some(msg => 
      error.toLowerCase().includes(msg.toLowerCase())
    );
  }
  
  const status = error.response?.status;
  return status && status >= 500;
}; 