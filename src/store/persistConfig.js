import storage from 'redux-persist/lib/storage';
import { createSecureStorage } from '../utils/secureStorageAdapter.js';

// Migration function to handle data structure changes
const migrations = {
  1: (state) => {
    // Example migration: if you need to change data structure in the future
    return state;
  },
  2: (state) => {
    // Example migration: if you need to change data structure in the future
    return state;
  },
};

// Current version of the persisted data
const CURRENT_VERSION = 1;

// Transform function to add version to persisted data
const transformInbound = (state) => {
  return {
    ...state,
    _persistVersion: CURRENT_VERSION,
  };
};

// Transform function to handle migrations and ensure proper array initialization
const transformOutbound = (state) => {
  if (!state) return state;
  
  const version = state._persistVersion || 0;
  
  // Apply migrations if needed
  let migratedState = state;
  for (let i = version + 1; i <= CURRENT_VERSION; i++) {
    if (migrations[i]) {
      migratedState = migrations[i](migratedState);
    }
  }
  
  // Ensure arrays are properly initialized
  const ensureArrays = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    const result = { ...obj };
    
    // Common array fields that should be initialized
    const arrayFields = [
      'list', 'available', 'newOrders', 'ongoingOrders', 'completedOrders',
      'deliveryPartners', 'paymentModes', 'verificationStatus',
      'partners', 'orders', 'tickets'
    ];
    
    arrayFields.forEach(field => {
      if (result[field] && !Array.isArray(result[field])) {
        result[field] = [];
      }
    });
    
    // Recursively check nested objects
    Object.keys(result).forEach(key => {
      if (result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
        result[key] = ensureArrays(result[key]);
      }
    });
    
    return result;
  };
  
  // Apply array initialization
  migratedState = ensureArrays(migratedState);
  
  // Remove version from state before returning
  const { _persistVersion, ...cleanState } = migratedState;
  return cleanState;
};

// Common persist configuration
export const createPersistConfig = (key, whitelist = [], blacklist = [], useSecureStorage = false) => ({
  key,
  storage: useSecureStorage ? createSecureStorage() : storage,
  whitelist,
  blacklist,
  transforms: [
    {
      in: transformInbound,
      out: transformOutbound,
    },
  ],
  // Add timeout to prevent blocking the UI
  timeout: 10000,
  // Add debug mode for development
  debug: process.env.NODE_ENV === 'development',
});

// Utility function to clear specific persisted data
export const clearPersistedData = (key) => {
  try {
    localStorage.removeItem(`persist:${key}`);
  } catch (error) {
    console.error(`Error clearing persisted data for key ${key}:`, error);
  }
};

// Utility function to clear all persisted data
export const clearAllPersistedData = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('persist:')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing all persisted data:', error);
  }
}; 