/**
 * Utility functions to test and debug persistence functionality
 */

import { persistor } from '../store';

/**
 * Test the persistence functionality
 */
export const testPersistence = async () => {
  console.log('🧪 Testing persistence functionality...');
  
  try {
    // Check if persistor is available
    if (!persistor) {
      console.error('❌ Persistor is not available');
      return false;
    }
    
    // Get persistor state
    const state = persistor.getState();
    console.log('📊 Persistor state:', state);
    
    // Check if bootstrapped
    if (state.bootstrapped) {
      console.log('✅ Persistor is bootstrapped');
    } else {
      console.log('⏳ Persistor is not yet bootstrapped');
    }
    
    // Check localStorage for persisted data
    const keys = Object.keys(localStorage);
    const persistKeys = keys.filter(key => key.startsWith('persist:'));
    console.log('💾 Persisted keys in localStorage:', persistKeys);
    
    // Log the actual persisted data
    persistKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        const parsed = JSON.parse(data);
        console.log(`📦 ${key}:`, parsed);
      } catch (error) {
        console.error(`❌ Error parsing ${key}:`, error);
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error testing persistence:', error);
    return false;
  }
};

/**
 * Clear all persisted data for testing
 */
export const clearAllPersistenceForTesting = async () => {
  console.log('🧹 Clearing all persisted data for testing...');
  
  try {
    // Purge persistor
    await persistor.purge();
    
    // Clear localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('persist:')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('✅ All persisted data cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing persisted data:', error);
    return false;
  }
};

/**
 * Check if arrays are properly initialized in the state
 */
export const checkArrayInitialization = (state) => {
  console.log('🔍 Checking array initialization...');
  
  const arrayFields = [
    'list', 'available', 'newOrders', 'ongoingOrders', 'completedOrders',
    'deliveryPartners', 'paymentModes', 'verificationStatus',
    'partners', 'orders', 'tickets'
  ];
  
  const issues = [];
  
  // Check each slice
  Object.keys(state).forEach(sliceKey => {
    const slice = state[sliceKey];
    if (slice && typeof slice === 'object') {
      arrayFields.forEach(field => {
        if (slice[field] !== undefined && !Array.isArray(slice[field])) {
          issues.push(`${sliceKey}.${field} is not an array: ${typeof slice[field]}`);
        }
      });
    }
  });
  
  if (issues.length > 0) {
    console.warn('⚠️ Array initialization issues found:', issues);
    return false;
  } else {
    console.log('✅ All arrays are properly initialized');
    return true;
  }
};

/**
 * Log the current Redux state for debugging
 */
export const logReduxState = (state) => {
  console.log('📊 Current Redux State:');
  console.log('Auth:', {
    isAuthenticated: state.auth?.isAuthenticated,
    hasUser: !!state.auth?.user,
    hasToken: !!state.auth?.token
  });
  console.log('Orders:', {
    listLength: state.orders?.list?.length || 0,
    hasCurrent: !!state.orders?.current,
    hasPagination: !!state.orders?.pagination
  });
  console.log('Delivery Partners:', {
    listLength: state.deliveryPartners?.list?.length || 0,
    hasAvailable: !!state.deliveryPartners?.available,
    hasCurrent: !!state.deliveryPartners?.current
  });
  console.log('Overview:', {
    hasData: !!state.overview?.data
  });
  console.log('Tickets:', {
    listLength: state.tickets?.list?.length || 0
  });
  console.log('Promotions:', {
    hasCurrent: !!state.promotions?.current
  });
};

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  window.testPersistence = testPersistence;
  window.clearAllPersistenceForTesting = clearAllPersistenceForTesting;
  window.checkArrayInitialization = checkArrayInitialization;
  window.logReduxState = logReduxState;
} 