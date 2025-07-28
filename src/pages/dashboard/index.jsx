// src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import TabBar from '@/components/Topbar';
import OrderCard from '@/components/OrderCard';
import { fetchOrdersByStatus } from '@/store/slices/ordersSlice';
import AppSpinner from '@/components/AppSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import TicketCard from '@/components/TicketCard';
import { fetchOpenTickets, ticketAction } from '@/store/slices/ticketsSlice';
import PageHeader from '@/components/PageHeader';

export default function Dashboard() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('Ongoing');
  const shopId = useSelector((state) => state.auth.user?.shopId);

  // New Orders
  const newOrders = useSelector((state) => state.orders.newOrders);
  const newOrdersLoading = useSelector((state) => state.orders.newOrdersLoading);
  const newOrdersError = useSelector((state) => state.orders.newOrdersError);

  // Ongoing Orders
  const ongoingOrders = useSelector((state) => state.orders.ongoingOrders);
  const ongoingOrdersLoading = useSelector((state) => state.orders.ongoingOrdersLoading);
  const ongoingOrdersError = useSelector((state) => state.orders.ongoingOrdersError);

  // Completed Orders
  const completedOrders = useSelector((state) => state.orders.completedOrders);
  const completedOrdersLoading = useSelector((state) => state.orders.completedOrdersLoading);
  const completedOrdersError = useSelector((state) => state.orders.completedOrdersError);

  // Tickets
  const tickets = useSelector((state) => state.tickets.list);
  const ticketsLoading = useSelector((state) => state.tickets.loading);
  const ticketsError = useSelector((state) => state.tickets.error);

  useEffect(() => {
    if (shopId) {
      dispatch(fetchOrdersByStatus({ shopId, status: 'new' }));
      dispatch(fetchOrdersByStatus({ shopId, status: 'ongoing' }));
      dispatch(fetchOrdersByStatus({ shopId, status: 'completed' }));
    }
  }, [dispatch, shopId]);

  useEffect(() => {
    if (activeTab === 'Tickets') {
      dispatch(fetchOpenTickets());
    }
  }, [activeTab, dispatch]);

  const handleAccept = (ticketId, notes) => {
    dispatch(ticketAction({ ticketId, action: 'accept', resolution_notes: notes || '' }));
  };
  const handleReject = (ticketId, notes) => {
    dispatch(ticketAction({ ticketId, action: 'reject', resolution_notes: notes || '' }));
  };
  const handleCall = (phone) => {
    window.open(`tel:${phone}`);
  };

  return (
    <div className="min-h-screen bg-white w-full max-w-screen-md mx-auto px-4 pt-16 pb-24">
      <PageHeader title="Dashboard" />
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} pillSize="small" />

      {activeTab === 'New Orders' && (
        <>
          {newOrdersLoading && <AppSpinner label="Loading new orders..." />}
          {newOrdersError && <ErrorMessage message={newOrdersError} />}
          {newOrders?.length > 0 ? (
            <div className="space-y-3">
              {newOrders.map((order) => <OrderCard key={order.order_id} order={order} />)}
            </div>
          ) : (
            !newOrdersLoading && !newOrdersError && <div className="text-center text-gray-400 mt-12">No new orders.</div>
          )}
        </>
      )}

      {activeTab === 'Ongoing' && (
        <>
          {ongoingOrdersLoading && <AppSpinner label="Loading ongoing orders..." />}
          {ongoingOrdersError && <ErrorMessage message={ongoingOrdersError} />}
          {ongoingOrders?.length > 0 ? (
            <div className="space-y-3">
              {ongoingOrders.map((order) => <OrderCard key={order.order_id} order={order} fromOngoing />)}
            </div>
          ) : (
            !ongoingOrdersLoading && !ongoingOrdersError && <div className="text-center text-gray-400 mt-12">No ongoing orders.</div>
          )}
        </>
      )}

      {activeTab === 'Tickets' && (
        <>
          {ticketsLoading && <AppSpinner label="Loading tickets..." />}
          {ticketsError && <ErrorMessage message={ticketsError} />}
          {tickets?.length > 0 ? (
            tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onAccept={handleAccept}
                onReject={handleReject}
                onCall={handleCall}
                openIconClass="text-green-500"
              />
            ))
          ) : (
            !ticketsLoading && !ticketsError && <div className="text-center text-gray-400 mt-12">No open tickets.</div>
          )}
        </>
      )}
      
      {/* Powered by Codeteak */}
      <div className="flex flex-col items-center mt-12 mb-4">
        <span className="text-xs text-blue-500 mb-1">Powered by</span>
        <img src="/assets/codeteak-logo.png" alt="Codeteak Logo" className="h-4 object-contain mt-1 md:mt-2" />
      </div>
    </div>
  );
}
