// Secure Storage Adapter for Redux Persist
// Provides encrypted storage for Redux state while maintaining compatibility

import { secureStorage, secureSetItem, secureGetItem, secureRemoveItem } from './secureStorage.js';

/**
 * Secure storage adapter for Redux Persist
 * Encrypts sensitive data while maintaining compatibility
 */
class SecureStorageAdapter {
  constructor() {
    this.isSecure = false;
  }

  /**
   * Initialize secure storage with user data
   */
  async initialize(userData) {
    try {
      await secureStorage.initialize(userData);
      this.isSecure = true;
      
      if (import.meta.env.DEV) {
        // Secure storage adapter initialized
      }
    } catch (error) {
      console.error('Failed to initialize secure storage adapter:', error);
      this.isSecure = false;
    }
  }

  /**
   * Clear secure storage
   */
  clear() {
    secureStorage.clear();
    this.isSecure = false;
  }

  /**
   * Get item from storage
   */
  async getItem(key) {
    try {
      if (this.isSecure) {
        return await secureGetItem(key);
      } else {
        // Fallback to regular localStorage
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      }
    } catch (error) {
      console.error(`Failed to get item ${key}:`, error);
      return null;
    }
  }

  /**
   * Set item in storage
   */
  async setItem(key, value) {
    try {
      if (this.isSecure) {
        await secureSetItem(key, value);
      } else {
        // Fallback to regular localStorage
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Failed to set item ${key}:`, error);
      // Fallback to regular localStorage on error
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  /**
   * Remove item from storage
   */
  async removeItem(key) {
    try {
      if (this.isSecure) {
        secureRemoveItem(key);
      } else {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Failed to remove item ${key}:`, error);
      localStorage.removeItem(key);
    }
  }
}

// Create singleton instance
export const secureStorageAdapter = new SecureStorageAdapter();

/**
 * Create secure storage for Redux Persist
 * This function returns a storage object compatible with Redux Persist
 */
export const createSecureStorage = () => {
  return {
    getItem: async (key) => {
      const value = await secureStorageAdapter.getItem(key);
      return value;
    },
    
    setItem: async (key, value) => {
      await secureStorageAdapter.setItem(key, value);
    },
    
    removeItem: async (key) => {
      await secureStorageAdapter.removeItem(key);
    }
  };
};

/**
 * Initialize secure storage with user data
 */
export const initializeSecureStorageAdapter = async (userData) => {
  await secureStorageAdapter.initialize(userData);
};

/**
 * Clear secure storage adapter
 */
export const clearSecureStorageAdapter = () => {
  secureStorageAdapter.clear();
};

/**
 * Check if secure storage is available
 */
export const isSecureStorageAvailable = () => {
  return secureStorageAdapter.isSecure;
}; 