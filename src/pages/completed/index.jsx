import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchOrdersByStatus } from '@/store/slices/ordersSlice';
import OrderCard from '@/components/OrderCard';
import AppSpinner from '@/components/AppSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import PageHeader from '@/components/PageHeader';
import { RefreshCw } from 'lucide-react';
import { updateCustomerAddress } from '@/store/slices/ordersSlice';
import toast from 'react-hot-toast';

// TabBar component for completed orders filtering
function CompletedTabBar({ activeTab, setActiveTab, pillSize }) {
  const completedOrders = useSelector((state) => state.orders.completedOrders);
  const verifiedCount = completedOrders?.filter(order => 
    order.payment_verification !== true && order.payment_verification !== 'true'
  ).length || 0;
  const nonVerifiedCount = completedOrders?.filter(order => 
    order.payment_verification === true || order.payment_verification === 'true'
  ).length || 0;
  
  const pillClass = pillSize === 'small'
    ? 'px-3 py-2 rounded-full text-xs sm:px-4 sm:py-2.5 sm:text-sm'
    : 'px-5 py-3 rounded-full text-base';

  return (
    <div className="flex justify-between gap-2 mb-4 w-full max-w-xs mx-auto">
      {[
        { name: 'All', count: completedOrders?.length || 0 },
        { name: 'Verified', count: verifiedCount },
        { name: 'Non-verified', count: nonVerifiedCount }
      ].map((tab) => (
        <button
          key={tab.name}
          onClick={() => setActiveTab(tab.name)}
          className={`relative transition font-medium ${pillClass}
            ${
              activeTab === tab.name
                ? 'bg-blue-600 text-white font-semibold shadow'
                : 'text-black hover:text-blue-600 bg-gray-100'
            }
          `}
        >
          <span className="relative inline-block">
            {tab.name}
            {tab.count > 0 && (
              <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow">
                {tab.count > 99 ? '99+' : tab.count}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function CompletedOrders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const shopId = useSelector((state) => state.auth.user?.shopId);
  const completedOrders = useSelector((state) => state.orders.completedOrders);
  const loading = useSelector((state) => state.orders.completedOrdersLoading);
  const error = useSelector((state) => state.orders.completedOrdersError);
  const pagination = useSelector((state) => state.orders.completedOrdersPagination) || { page: 1, totalPages: 1 };
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOrder, setModalOrder] = useState(null);
  const [form, setForm] = useState({ customer_name: '', customer_phone_number: '', address: '' });
  const updateLoading = useSelector((state) => state.orders.updateCustomerAddressLoading);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('All');
  const limit = 20;

  // Filter orders based on active tab
  const getFilteredOrders = () => {
    if (!completedOrders) return [];
    
    switch (activeTab) {
      case 'Verified':
        return completedOrders.filter(order => 
          order.payment_verification !== true && order.payment_verification !== 'true'
        );
      case 'Non-verified':
        return completedOrders.filter(order => 
          order.payment_verification === true || order.payment_verification === 'true'
        );
      default:
        return completedOrders;
    }
  };

  const filteredOrders = getFilteredOrders();

  const handleRefresh = () => {
    if (shopId) dispatch(fetchOrdersByStatus({ shopId, status: 'completed', page: currentPage, limit }));
  };

  const handleOpenModal = (order) => {
    setForm({
      customer_name: order.customer_name,
      customer_phone_number: order.customer_phone_number,
      address: order.address,
    });
    setModalOrder(order);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalOrder(null);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateCustomerAddress(form)).unwrap();
      toast.success('Customer address updated!');
      handleCloseModal();
      handleRefresh();
    } catch (err) {
      toast.error(err || 'Failed to update address');
    }
  };

  useEffect(() => {
    if (shopId) {
      dispatch(fetchOrdersByStatus({ shopId, status: 'completed', page: currentPage, limit }));
    }
  }, [dispatch, shopId, currentPage]);

  return (
    <div className="max-w-screen-md mx-auto px-4 pt-16 pb-24">
      <PageHeader
        title="Completed Orders"
        onBack={() => navigate(-1)}
        onRefresh={handleRefresh}
        isLoading={loading}
      >
        {completedOrders && completedOrders.length > 0 && (
          <span className="inline-flex items-center justify-center bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 align-middle" style={{ marginTop: '2px' }}>
            {completedOrders.length > 99 ? '99+' : completedOrders.length}
          </span>
        )}
      </PageHeader>
      
      <CompletedTabBar activeTab={activeTab} setActiveTab={setActiveTab} pillSize="small" />
      
      {loading && <AppSpinner label="Loading completed orders..." />}
      {error && <ErrorMessage message={error} />}
      
      <div className="space-y-4 transition-all duration-300">
        {filteredOrders?.map((order) => (
          <OrderCard
            key={order.order_id}
            order={order}
            paymentVerifiedLabel={order.payment_verification === true || order.payment_verification === 'true'}
            showPaymentStatusBadge={true}
          />
        ))}
      </div>
      
      {!loading && !error && (!filteredOrders || filteredOrders.length === 0) && (
        <div className="text-center text-gray-400 mt-12">
          {activeTab === 'All' ? 'No completed orders found.' : `No ${activeTab.toLowerCase()} orders found.`}
        </div>
      )}
      
      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            className="px-3 py-1 rounded bg-gray-100 text-gray-600 font-semibold disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`px-3 py-1 rounded font-semibold ${page === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => setCurrentPage(page)}
              disabled={page === currentPage}
            >
              {page}
            </button>
          ))}
          <button
            className="px-3 py-1 rounded bg-gray-100 text-gray-600 font-semibold disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={currentPage === pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}
      
      {/* Powered by Codeteak */}
      <div className="flex flex-col items-center mt-12 mb-4">
        <span className="text-xs text-blue-500 mb-1">Powered by</span>
        <img src="/assets/codeteak-logo.png" alt="Codeteak Logo" className="h-4 object-contain mt-1 md:mt-2" />
      </div>
    </div>
  );
}
