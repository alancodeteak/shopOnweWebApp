import axios from "axios";
import { 
  generateHmacHeaders, 
  clearHmacSecret, 
  isLoginEndpoint,
  testHmacSignature
} from "../utils/hmac.js";
import { HMAC_CONFIG } from "../config/hmac.config.js";
import { debug, obfuscate, protectFunction } from "../utils/codeProtection.js";

// Create a function to handle logout and redirect
const handleTokenExpiration = protectFunction(() => {
  // Prevent multiple redirects if already on login page
  if (window.location.pathname === '/login') {
    return;
  }
  
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  clearHmacSecret(); // Clear HMAC secret on logout
  
  // Set flag in sessionStorage to indicate token expiration
  sessionStorage.setItem('tokenExpired', 'true');
  
  // Dispatch logout action if store is available
  // We'll use a custom event to communicate with the app
  window.dispatchEvent(new CustomEvent('tokenExpired'));
  
  // Redirect to login page
  window.location.href = '/login';
}, 'handleTokenExpiration');

// Use main domain with /api prefix
const getBaseURL = () => {
  if (import.meta.env.DEV) {
    // In development, use the main domain with /api prefix
    return 'https://yaadro.com/api';
  }
  return import.meta.env.VITE_API_BASE_URL || 'https://yaadro.com/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: false, // Disable credentials to prevent CORS issues
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
API.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("token");

  // Don't attach token to login or public endpoints
  const isPublicEndpoint = isLoginEndpoint(config.url);
  
  // Only set custom headers for authenticated requests (not public endpoints)
  if (!isPublicEndpoint) {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Only set Content-Type to application/json if it's not already set (for file uploads)
      if (!config.headers["Content-Type"]) {
        config.headers["Content-Type"] = "application/json";
      }
      config.headers["x-api-key"] = import.meta.env.VITE_ADMIN_KEY || 'default_admin_key'; 
      
      // Add device token if available
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.deviceToken) {
        config.headers["device-token"] = user.deviceToken;
      }
      
      // Note: User-Agent header cannot be set manually in browsers due to security restrictions
      // The browser will automatically send the User-Agent header
      // TODO: Recommend backend team remove User-Agent from HMAC for better security
      
      // Generate HMAC headers for authenticated requests
      let hmacHeaders = null;
      const hmacSecret = localStorage.getItem('hmac_secret');
      
      if (HMAC_CONFIG.HMAC_ENABLED && hmacSecret) {
        try {
          // Generate fresh HMAC headers for each request
          hmacHeaders = await generateHmacHeaders({
            method: config.method,
            path: config.url,
            secret: hmacSecret,
            clientId: user.id || user.user_id,
            body: config.data,
            headers: config.headers
          });
          Object.assign(config.headers, hmacHeaders);
          
          // Test HMAC generation with the same string to sign
          const testString = `GET\n/new-orders\n1754355248\n123534\ne3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\nMozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36`;
          const testSignature = await testHmacSignature(hmacSecret, testString);
        } catch (error) {
          debug.error('Failed to generate HMAC headers:', error);
          // Continue without HMAC headers if generation fails
        }
      } else if (HMAC_CONFIG.HMAC_ENABLED && !hmacSecret) {
        debug.warn('⚠️ HMAC enabled but no secret found. HMAC headers will not be sent.');
      } else if (HMAC_CONFIG.HMAC_ENABLED && hmacSecret) {
        // HMAC secret found, will generate headers
      }

      // Only log in development mode
    } else {
      debug.warn("⚠️ No token found in localStorage");
    }
  }
  // For public endpoints (like login), don't add any custom headers
  // This prevents CORS preflight issues

  return config;
});

// Add response interceptor to handle CORS errors and token expiration
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration (401 Unauthorized or 403 Forbidden)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Don't auto-redirect for order creation - let the component handle it
      const isOrderCreation = error.config?.url?.includes('/orders/create');
      
      if (!isOrderCreation) {
        debug.warn('🔐 Token expired or invalid, logging out user');
        
        // Don't show error message to user, just handle logout
        handleTokenExpiration();
        
        // Return a resolved promise to prevent error from bubbling up
        return Promise.resolve({ data: { message: 'Token expired, redirecting to login...' } });
      }
    }
    
    // Handle other authentication-related errors
    if (error.response && error.response.status === 419) {
      debug.warn('🔐 CSRF token mismatch, logging out user');
      handleTokenExpiration();
      return Promise.resolve({ data: { message: 'Session expired, redirecting to login...' } });
    }
    
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
    
    debug.error('API Error:', {
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
