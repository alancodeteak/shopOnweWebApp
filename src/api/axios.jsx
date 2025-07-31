import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false, // Disable credentials to prevent CORS issues
});

// Add request interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // Don't attach token to login or public endpoints
  const isPublicEndpoint = config.url.includes("/auth/login");

  if (!isPublicEndpoint && token) {
    config.headers.Authorization = `Bearer ${token}`;
    // Only set Content-Type to application/json if it's not already set (for file uploads)
    if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }
    config.headers["x-api-key"] = import.meta.env.VITE_ADMIN_KEY;

    // Only log in development mode
    if (import.meta.env.DEV) {
      console.log("✅ Token sent in header:", config.headers.Authorization);
    }
  } else if (!isPublicEndpoint && !token && import.meta.env.DEV) {
    console.warn("⚠️ No token found in localStorage");
  }

  return config;
});

// Add response interceptor to handle CORS errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error handling with proper error categorization
    let enhancedError = { ...error };
    
    // Network errors (no internet, server unreachable)
    if (!error.response) {
      enhancedError.isNetworkError = true;
      enhancedError.statusCode = 0;
      enhancedError.message = 'Network Error: Unable to connect to the server';
    }
    // Server errors (5xx status codes)
    else if (error.response.status >= 500) {
      enhancedError.isServerError = true;
      enhancedError.statusCode = error.response.status;
      enhancedError.message = 'Server Error: Our servers are currently experiencing issues';
    }
    // CORS errors
    else if (error.response.status === 0) {
      enhancedError.isNetworkError = true;
      enhancedError.statusCode = 0;
      enhancedError.message = 'CORS Error: Cross-origin request blocked';
    }
    // Other HTTP errors
    else {
      enhancedError.statusCode = error.response.status;
      enhancedError.message = error.response.data?.message || error.message;
    }
    
    console.error('API Error:', {
      status: enhancedError.statusCode,
      message: enhancedError.message,
      isNetworkError: enhancedError.isNetworkError,
      isServerError: enhancedError.isServerError,
      url: error.config?.url
    });
    
    return Promise.reject(enhancedError);
  }
);

export default API;
