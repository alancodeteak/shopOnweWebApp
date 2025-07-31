import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import overviewReducer from './slices/overviewSlice';
import ordersReducer from './slices/ordersSlice';
import deliveryPartnerReducer from './slices/deliveryPartnerSlice';
import ticketsReducer from './slices/ticketsSlice';
import promotionsReducer from './slices/promotionsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    overview: overviewReducer,
    orders: ordersReducer,
    deliveryPartners: deliveryPartnerReducer,
    tickets: ticketsReducer,
    promotions: promotionsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
