import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import OrderCard from '@/components/OrderCard';
import AppSpinner from '@/components/AppSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import PageHeader from '@/components/PageHeader';
import { OrderSearchInput } from '@/components/forms';
import { fetchOrders, searchOrders } from '@/store/slices/ordersSlice';

export default function OrdersList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const shopId = useSelector((state) => state.auth.user?.shopId);
  const orders = useSelector((state) => state.orders.list) || [];
  const loading = useSelector((state) => state.orders.loading);
  const error = useSelector((state) => state.orders.error);
  const searchQuery = useSelector((state) => state.orders.searchQuery);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(localSearchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchQuery]);

  // Handle search
  useEffect(() => {
    if (shopId) {
      if (debouncedQuery.trim()) {
        dispatch(searchOrders({ query: debouncedQuery.trim(), shopId }));
      } else {
        dispatch(fetchOrders({ shopId }));
      }
    }
  }, [dispatch, shopId, debouncedQuery]);

  // Initial load
  useEffect(() => {
    if (shopId && !debouncedQuery.trim()) {
      dispatch(fetchOrders({ shopId }));
    }
  }, [dispatch, shopId]);

  const handleRefresh = () => {
    if (shopId) {
      if (debouncedQuery.trim()) {
        dispatch(searchOrders({ query: debouncedQuery.trim(), shopId }));
      } else {
        dispatch(fetchOrders({ shopId }));
      }
    }
  };

  const handleSearchChange = (value) => {
    setLocalSearchQuery(value);
  };

  const handleSearchClear = () => {
    setLocalSearchQuery('');
    setDebouncedQuery('');
  };

  return (
    <div className="max-w-screen-md mx-auto px-4 pt-16 pb-24">
      <PageHeader title="All Orders" onBack={() => navigate(-1)} onRefresh={handleRefresh} isLoading={loading} />
      
      {/* Search Bar */}
      <div className="mb-6">
        <OrderSearchInput
          value={localSearchQuery}
          onChange={handleSearchChange}
          onClear={handleSearchClear}
          placeholder="Search by customer name, phone, or order ID..."
        />
      </div>
      
      {loading && <AppSpinner label={debouncedQuery.trim() ? "Searching orders..." : "Loading orders..."} />}
      {error && <ErrorMessage message={error} />}
      {Array.isArray(orders) && orders.length > 0 && (
        <div className="space-y-4 transition-all duration-300">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            {debouncedQuery.trim() ? `Search Results (${orders.length})` : `All Orders (${orders.length})`}
          </h2>
          {orders.map((order) => (
            <OrderCard key={order.order_id} order={order} paymentVerifiedLabel={order.payment_verification === true || order.payment_verification === 'true'} />
          ))}
        </div>
      )}
      {!loading && !error && Array.isArray(orders) && orders.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {debouncedQuery.trim() ? 'No orders found matching your search.' : 'No orders at the moment.'}
          </p>
        </div>
      )}
    </div>
  );
}
