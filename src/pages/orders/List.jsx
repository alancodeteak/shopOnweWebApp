import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import OrderCard from '@/components/OrderCard';
import AppSpinner from '@/components/AppSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import PageHeader from '@/components/PageHeader';
import { OrderSearchInput } from '@/components/forms';
import { fetchOrders } from '@/store/slices/ordersSlice';

export default function OrdersList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const shopId = useSelector((state) => state.auth.user?.shopId);
  const orders = useSelector((state) => state.orders.list) || [];
  const loading = useSelector((state) => state.orders.loading);
  const error = useSelector((state) => state.orders.error);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (shopId) {
      dispatch(fetchOrders({ shopId }));
    }
  }, [dispatch, shopId]);

  const handleRefresh = () => {
    if (shopId) dispatch(fetchOrders({ shopId }));
  };

  // Filter orders based on search query
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    
    if (!searchQuery.trim()) return orders;
    
    const query = searchQuery.toLowerCase().trim();
    return orders.filter(order => 
      order.customer_name?.toLowerCase().includes(query) ||
      order.customer_phone_number?.includes(query) ||
      order.order_id?.toString().includes(query) ||
      order.bill_no?.toLowerCase().includes(query)
    );
  }, [orders, searchQuery]);

  return (
    <div className="max-w-screen-md mx-auto px-4 pt-16 pb-24">
      <PageHeader title="All Orders" onBack={() => navigate(-1)} onRefresh={handleRefresh} isLoading={loading} />
      
      {/* Search Bar */}
      <div className="mb-6">
        <OrderSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search by customer name, phone, or order ID..."
        />
      </div>
      
      {loading && <AppSpinner label="Loading orders..." />}
      {error && <ErrorMessage message={error} />}
      {Array.isArray(filteredOrders) && filteredOrders.length > 0 && (
        <div className="space-y-4 transition-all duration-300">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            All Orders ({filteredOrders.length}{searchQuery && ` of ${orders.length}`})
          </h2>
          {filteredOrders.map((order) => (
            <OrderCard key={order.order_id} order={order} paymentVerifiedLabel={order.payment_verification === true || order.payment_verification === 'true'} />
          ))}
        </div>
      )}
      {!loading && !error && Array.isArray(filteredOrders) && filteredOrders.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchQuery ? 'No orders found matching your search.' : 'No orders at the moment.'}
          </p>
        </div>
      )}
    </div>
  );
}
