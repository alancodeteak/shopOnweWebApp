/**
 * Utility function to extract error information for ErrorMessage component
 * @param {Error} error - The error object from API calls
 * @returns {Object} Error information for ErrorMessage component
 */
export const getErrorInfo = (error) => {
  if (!error) {
    return {
      message: "An unknown error occurred.",
      statusCode: null,
      isNetworkError: false,
      isServerError: false
    };
  }

  // Check if it's an enhanced error from our axios interceptor
  if (error.isNetworkError || error.isServerError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      isNetworkError: error.isNetworkError,
      isServerError: error.isServerError
    };
  }

  // Handle regular axios errors
  if (error.response) {
    return {
      message: error.response.data?.message || error.message,
      statusCode: error.response.status,
      isNetworkError: false,
      isServerError: error.response.status >= 500
    };
  }

  // Handle network errors (no response)
  if (error.request) {
    return {
      message: "Unable to connect to the server. Please check your internet connection.",
      statusCode: 0,
      isNetworkError: true,
      isServerError: false
    };
  }

  // Handle other errors
  return {
    message: error.message || "An unknown error occurred.",
    statusCode: null,
    isNetworkError: false,
    isServerError: false
  };
};

/**
 * Get user-friendly error message based on error type
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  const errorInfo = getErrorInfo(error);
  
  if (errorInfo.isNetworkError) {
    return "Please check your internet connection and try again.";
  }
  
  if (errorInfo.isServerError) {
    return "Our servers are currently under maintenance. Please try again later.";
  }
  
  if (errorInfo.statusCode === 404) {
    return "The requested resource was not found.";
  }
  
  if (errorInfo.statusCode === 401) {
    return "Please log in again to continue.";
  }
  
  if (errorInfo.statusCode === 403) {
    return "You don't have permission to access this resource.";
  }
  
  if (errorInfo.statusCode === 422 || errorInfo.statusCode === 400) {
    return "Please check your input and try again.";
  }
  
  return errorInfo.message;
};

/**
 * Check if error is retryable
 * @param {Error} error - The error object
 * @returns {boolean} Whether the error can be retried
 */
export const isRetryableError = (error) => {
  const errorInfo = getErrorInfo(error);
  
  // Network errors are retryable
  if (errorInfo.isNetworkError) {
    return true;
  }
  
  // Server errors (5xx) are retryable
  if (errorInfo.isServerError) {
    return true;
  }
  
  // 408 Request Timeout is retryable
  if (errorInfo.statusCode === 408) {
    return true;
  }
  
  // 429 Too Many Requests is retryable (after delay)
  if (errorInfo.statusCode === 429) {
    return true;
  }
  
  return false;
}; 