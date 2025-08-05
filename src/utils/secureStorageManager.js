// Secure Storage Manager
// Provides easy-to-use functions for managing secure storage throughout the app

import { 
  initializeSecureStorage, 
  clearSecureStorage, 
  secureStorage,
  secureSetItem,
  secureGetItem,
  secureRemoveItem 
} from './secureStorage.js';

import { 
  initializeSecureStorageAdapter, 
  clearSecureStorageAdapter 
} from './secureStorageAdapter.js';

/**
 * Initialize secure storage for the entire application
 * @param {Object} userData - User data object containing id, email, etc.
 */
export const initializeAppSecureStorage = async (userData) => {
  try {
    // Initialize both secure storage systems
    await initializeSecureStorage(userData);
    await initializeSecureStorageAdapter(userData);
    
    if (import.meta.env.DEV) {
      // App secure storage initialized successfully
    }
    
    return true;
  } catch (error) {
    console.error('Failed to initialize app secure storage:', error);
    return false;
  }
};

/**
 * Clear secure storage for the entire application
 */
export const clearAppSecureStorage = () => {
  try {
    clearSecureStorage();
    clearSecureStorageAdapter();
    
    if (import.meta.env.DEV) {
      // App secure storage cleared successfully
    }
    
    return true;
  } catch (error) {
    console.error('Failed to clear app secure storage:', error);
    return false;
  }
};

/**
 * Store sensitive data securely
 * @param {string} key - Storage key
 * @param {any} value - Data to store
 */
export const storeSecureData = async (key, value) => {
  try {
    await secureSetItem(key, value);
    return true;
  } catch (error) {
    console.error(`Failed to store secure data for key ${key}:`, error);
    return false;
  }
};

/**
 * Retrieve sensitive data securely
 * @param {string} key - Storage key
 * @returns {any} Stored data or null
 */
export const getSecureData = async (key) => {
  try {
    return await secureGetItem(key);
  } catch (error) {
    console.error(`Failed to retrieve secure data for key ${key}:`, error);
    return null;
  }
};

/**
 * Remove sensitive data securely
 * @param {string} key - Storage key
 */
export const removeSecureData = (key) => {
  try {
    secureRemoveItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove secure data for key ${key}:`, error);
    return false;
  }
};

/**
 * Check if secure storage is available and initialized
 * @returns {boolean} Whether secure storage is ready
 */
export const isSecureStorageReady = () => {
  return secureStorage.isInitialized();
};

/**
 * Migrate existing localStorage data to secure storage
 * @param {Array} sensitiveKeys - Array of keys to migrate
 * @param {Object} userData - User data for initialization
 */
export const migrateToSecureStorage = async (sensitiveKeys, userData) => {
  try {
    // Initialize secure storage first
    await initializeAppSecureStorage(userData);
    
    const migrationResults = [];
    
    for (const key of sensitiveKeys) {
      try {
        const existingData = localStorage.getItem(key);
        if (existingData) {
          const parsedData = JSON.parse(existingData);
          await secureSetItem(key, parsedData);
          migrationResults.push({ key, success: true });
          
          if (import.meta.env.DEV) {
            // Migrated to secure storage
          }
        }
      } catch (error) {
        console.error(`Failed to migrate ${key}:`, error);
        migrationResults.push({ key, success: false, error: error.message });
      }
    }
    
    return migrationResults;
  } catch (error) {
    console.error('Migration to secure storage failed:', error);
    return [];
  }
};

/**
 * Get secure storage status and statistics
 * @returns {Object} Status information
 */
export const getSecureStorageStatus = () => {
  const isReady = isSecureStorageReady();
  const secureKeys = Object.keys(localStorage).filter(key => key.startsWith('secure_'));
  
  return {
    isInitialized: isReady,
    secureKeysCount: secureKeys.length,
    secureKeys: secureKeys,
    totalLocalStorageKeys: Object.keys(localStorage).length,
    timestamp: Date.now()
  };
};

/**
 * Clean up expired secure data
 * @returns {number} Number of items cleaned up
 */
export const cleanupExpiredSecureData = () => {
  if (!isSecureStorageReady()) {
    return 0;
  }
  
  let cleanedCount = 0;
  const secureKeys = Object.keys(localStorage).filter(key => key.startsWith('secure_'));
  
  secureKeys.forEach(key => {
    try {
      const storedData = localStorage.getItem(key);
      if (storedData) {
        const secureData = JSON.parse(storedData);
        
        // Check if data has expired (24-hour TTL)
        const TTL = 24 * 60 * 60 * 1000; // 24 hours
        if (Date.now() - secureData.timestamp > TTL) {
          localStorage.removeItem(key);
          cleanedCount++;
          
          if (import.meta.env.DEV) {
            // Cleaned up expired secure data
          }
        }
      }
    } catch (error) {
      console.error(`Error checking expiration for ${key}:`, error);
    }
  });
  
  if (import.meta.env.DEV && cleanedCount > 0) {
    // Cleaned up expired secure data items
  }
  
  return cleanedCount;
};

/**
 * Set up automatic cleanup interval
 * @param {number} intervalMinutes - Cleanup interval in minutes (default: 60)
 */
export const setupAutomaticCleanup = (intervalMinutes = 60) => {
  const intervalMs = intervalMinutes * 60 * 1000;
  
  // Clean up immediately
  cleanupExpiredSecureData();
  
  // Set up periodic cleanup
  setInterval(() => {
    cleanupExpiredSecureData();
  }, intervalMs);
  
  if (import.meta.env.DEV) {
    // Automatic cleanup set up
  }
}; 