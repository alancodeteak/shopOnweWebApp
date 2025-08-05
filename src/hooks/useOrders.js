import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrdersByStatus, fetchCustomerByPhone, clearCustomerSearch } from '@/store/slices/ordersSlice';

export const useOrders = (shopId) => {
  const dispatch = useDispatch();
  
  // Orders state
  const newOrders = useSelector((state) => state.orders.newOrders);
  const newOrdersLoading = useSelector((state) => state.orders.newOrdersLoading);
  const newOrdersError = useSelector((state) => state.orders.newOrdersError);

  const ongoingOrders = useSelector((state) => state.orders.ongoingOrders);
  const ongoingOrdersLoading = useSelector((state) => state.orders.ongoingOrdersLoading);
  const ongoingOrdersError = useSelector((state) => state.orders.ongoingOrdersError);

  // Customer search state
  const customerSearch = useSelector((state) => state.orders.customerSearch);

  // Fetch orders by status
  const fetchOrders = useCallback((status) => {
    if (shopId) {
      dispatch(fetchOrdersByStatus({ shopId, status }));
    }
  }, [dispatch, shopId]);

  // Fetch customer by phone
  const searchCustomer = useCallback((phoneNumber) => {
    if (phoneNumber && phoneNumber.length === 10) {
      dispatch(fetchCustomerByPhone(phoneNumber));
    }
  }, [dispatch]);

  // Clear customer search
  const clearSearch = useCallback(() => {
    dispatch(clearCustomerSearch());
  }, [dispatch]);

  // Removed initial useEffect - orders will be fetched when tabs are selected

  return {
    // Orders data
    newOrders,
    newOrdersLoading,
    newOrdersError,
    ongoingOrders,
    ongoingOrdersLoading,
    ongoingOrdersError,
    
    // Customer search
    customerSearch,
    
    // Actions
    fetchOrders,
    searchCustomer,
    clearSearch,
  };
}; 