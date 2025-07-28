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
    config.headers["Content-Type"] = "application/json";
    config.headers["x-api-key"] = import.meta.env.VITE_API_KEY;
    // Remove any problematic headers that might cause CORS issues
    delete config.headers["Clear-Site-Data"];

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
    if (error.response?.status === 0 || error.message === 'Network Error') {
      console.error('CORS or Network Error:', error);
    }
    return Promise.reject(error);
  }
);

export default API;
