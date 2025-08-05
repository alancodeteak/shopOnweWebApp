// Environment variable debugging utility
export const checkEnvironmentVariables = () => {
  const envVars = {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    // VITE_ADMIN_KEY: import.meta.env.VITE_ADMIN_KEY, // Do not use secrets in frontend. Use backend/serverless.
    NODE_ENV: import.meta.env.NODE_ENV,
  };

  // Removed environment variable debug log

  return envVars;
};

// Check if Google Maps API key is properly configured
export const isGoogleMapsConfigured = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isConfigured = apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY' && apiKey.length > 10;
  
  if (!isConfigured) {
    console.warn('⚠️ Google Maps API key not properly configured. Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables.');
  }
  
  return isConfigured;
};

// Get Google Maps API key with fallback
export const getGoogleMapsApiKey = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    console.warn('⚠️ Using fallback Google Maps API key. Please configure VITE_GOOGLE_MAPS_API_KEY.');
    return 'YOUR_GOOGLE_MAPS_API_KEY';
  }
  return apiKey;
}; 