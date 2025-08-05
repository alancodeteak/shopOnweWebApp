import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import authReducer from './slices/authSlice';
import overviewReducer from './slices/overviewSlice';
import ordersReducer from './slices/ordersSlice';
import deliveryPartnerReducer from './slices/deliveryPartnerSlice';
import ticketsReducer from './slices/ticketsSlice';
import promotionsReducer from './slices/promotionsSlice';
import itemAnalyticsReducer from './slices/itemAnalyticsSlice';
import { createPersistConfig, clearAllPersistedData } from './persistConfig';

// Persist configuration for each slice using the utility function
const authPersistConfig = createPersistConfig('auth', ['token', 'isAuthenticated', 'user'], []);

const overviewPersistConfig = createPersistConfig('overview', ['data'], ['loading', 'error']);

const ordersPersistConfig = createPersistConfig('orders', [
  'list',
  'current',
  'created',
  'pagination',
  'searchQuery',
  'activeFilters',
  'uiFilters',
  'availableFilters',
  'newOrders',
  'ongoingOrders',
  'completedOrders',
  'completedOrdersPagination',
  'customerSearch'
], [
  'loading', 
  'error', 
  'newOrdersLoading', 
  'newOrdersError', 
  'ongoingOrdersLoading', 
  'ongoingOrdersError', 
  'completedOrdersLoading', 
  'completedOrdersError',
  'urgencyLoading',
  'updateCustomerAddressLoading',
  'updateCustomerAddressError',
  'updateCustomerAddressSuccess',
  'updateOrderStatusLoading',
  'updateOrderStatusError',
  'updateOrderStatusSuccess',
  'filtersLoading',
  'filtersError'
]);

const deliveryPartnersPersistConfig = createPersistConfig('deliveryPartners', [
  'list', 
  'available', 
  'current', 
  'generatedId', 
  'created', 
  'pagination'
], [
  'loading', 
  'error', 
  'updating', 
  'updateSuccess', 
  'resettingBonusPenalty', 
  'resetBonusPenaltyError',
  'resettingPassword', 
  'resetPasswordError'
]);

const ticketsPersistConfig = createPersistConfig('tickets', ['list'], ['loading', 'error', 'actionLoading', 'actionError']);

const promotionsPersistConfig = createPersistConfig('promotions', ['current'], ['loading', 'saving', 'error', 'success']);

const itemAnalyticsPersistConfig = createPersistConfig('itemAnalytics', ['searchHistory'], ['loading', 'error', 'data']);

// Create persisted reducers
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedOverviewReducer = persistReducer(overviewPersistConfig, overviewReducer);
const persistedOrdersReducer = persistReducer(ordersPersistConfig, ordersReducer);
const persistedDeliveryPartnersReducer = persistReducer(deliveryPartnersPersistConfig, deliveryPartnerReducer);
const persistedTicketsReducer = persistReducer(ticketsPersistConfig, ticketsReducer);
const persistedPromotionsReducer = persistReducer(promotionsPersistConfig, promotionsReducer);
const persistedItemAnalyticsReducer = persistReducer(itemAnalyticsPersistConfig, itemAnalyticsReducer);

// Create a root reducer that can handle clearing all state
const appReducer = {
  auth: persistedAuthReducer,
  overview: persistedOverviewReducer,
  orders: persistedOrdersReducer,
  deliveryPartners: persistedDeliveryPartnersReducer,
  tickets: persistedTicketsReducer,
  promotions: persistedPromotionsReducer,
  itemAnalytics: persistedItemAnalyticsReducer,
};

// Root reducer that can clear all state
const rootReducer = (state, action) => {
  // If the action is clearAllState, reset all reducers to their initial state
  if (action.type === 'auth/clearAllState') {
    // Reset all reducers to their initial state
    const resetState = {};
    Object.keys(appReducer).forEach(key => {
      resetState[key] = appReducer[key](undefined, action);
    });
    return resetState;
  }
  
  // Otherwise, apply the action normally
  const newState = {};
  Object.keys(appReducer).forEach(key => {
    newState[key] = appReducer[key](state?.[key], action);
  });
  return newState;
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create the persistor
export const persistor = persistStore(store);

// Listen for token expiration events
window.addEventListener('tokenExpired', () => {
  // Dispatch clearAllState action to reset all Redux state
  store.dispatch({ type: 'auth/clearAllState' });
  // Also purge the persisted data
  persistor.purge();
  // Clear all persisted data from localStorage
  clearAllPersistedData();
});

export default store;
