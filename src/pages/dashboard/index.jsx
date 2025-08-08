// src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import TabBar from '@/components/Topbar';
import OrderCard from '@/components/OrderCard';
import { LoadingSpinner, ErrorBoundary, NetworkErrorHandler } from '@/components';
import ErrorMessage from '@/components/ErrorMessage';
import TicketCard from '@/components/TicketCard';
import PageHeader from '@/components/PageHeader';
import PageContainer from '@/components/PageContainer';
import EmptyState from '@/components/EmptyState';
import DateFilterSection from '@/components/DateFilterSection';
import { Package, Clock, AlertTriangle } from 'lucide-react';
import { useOrders, useTickets } from '@/hooks';
import { isNetworkError, isServerError } from '@/utils/errorHandler';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('New Orders');
  const shopId = useSelector((state) => state.auth.user?.shopId);
  const dateFilter = useSelector((state) => state.orders.dateFilter);

  // Use specialized hooks
  const {
    newOrders,
    newOrdersLoading,
    newOrdersError,
    ongoingOrders,
    ongoingOrdersLoading,
    ongoingOrdersError,
    fetchOrders,
  } = useOrders(shopId);

  const {
    tickets,
    ticketsLoading,
    ticketsError,
    acceptTicket,
    rejectTicket,
    callPartner,
    fetchTickets,
  } = useTickets();

  // Fetch orders when tab changes
  useEffect(() => {
    if (shopId) {
      if (activeTab === 'New Orders') {
        fetchOrders('new');
      } else if (activeTab === 'Ongoing') {
        fetchOrders('ongoing');
      }
    }
  }, [activeTab, shopId, fetchOrders]);

  // Filter new orders based on date filter using useMemo
  const filteredNewOrders = useMemo(() => {
    console.log('🔍 FILTER DEBUG - Starting filteredNewOrders calculation');
    console.log('📊 newOrders:', newOrders);
    console.log('📅 dateFilter:', dateFilter);
    
    if (!Array.isArray(newOrders)) {
      console.log('❌ newOrders is not an array:', newOrders);
      return [];
    }
    
    let filtered = newOrders.filter(order => order.order_status === 'Pending');
    console.log('📋 Orders after status filter (Pending):', filtered.length);
    
    if (dateFilter.isToday) {
      console.log('🗓️ Today filter is active');
      const today = new Date();
      const todayDateString = today.toISOString().split('T')[0]; // Get YYYY-MM-DD format
      
      console.log('📅 Today date string:', todayDateString);
      
      filtered = filtered.filter(order => {
        console.log('🔍 Checking order:', order.order_id);
        console.log('📅 Order created_at:', order.created_at);
        
        if (!order.created_at) {
          console.log('❌ No created_at field for order:', order.order_id);
          return false;
        }
        
        const orderDate = new Date(order.created_at);
        const orderDateString = orderDate.toISOString().split('T')[0]; // Get YYYY-MM-DD format
        console.log('📅 Order date string:', orderDateString);
        
        const isToday = orderDateString === todayDateString;
        console.log('✅ Is today:', isToday);
        
        return isToday;
      });
      
      console.log('📋 Orders after today filter:', filtered.length);
    }
    
    console.log('🎯 Final filtered orders count:', filtered.length);
    return filtered;
  }, [newOrders, dateFilter]);

  // Load tickets when tab is active
  useEffect(() => {
    if (activeTab === 'Tickets') {
      fetchTickets();
    }
  }, [activeTab, fetchTickets]);

  const handleRetry = (orderType) => {
    if (shopId) {
      fetchOrders(orderType.toLowerCase().replace(' ', ''));
    }
  };

  const renderOrdersList = (orders, loading, error, emptyMessage, icon, orderType) => {
    if (loading) return <LoadingSpinner size="large" message={`Loading ${activeTab.toLowerCase()}...`} />;
    if (error) return (
      <ErrorMessage 
        message={error} 
        isNetworkError={isNetworkError(error)}
        isServerError={isServerError(error)}
        onRetry={() => handleRetry(orderType)}
      />
    );
    
    // Filter orders based on active tab
    let filteredOrders = Array.isArray(orders) ? orders : [];
    if (activeTab === 'Ongoing' && Array.isArray(orders)) {
      // Show all orders except pending and completed/delivered in Ongoing tab
      filteredOrders = orders.filter(order => 
        order.order_status !== 'Pending' && 
        order.order_status !== 'Completed' && 
        order.order_status !== 'Delivered'
      );
    }
    
    if (!filteredOrders.length) {
      return (
        <EmptyState
          icon={icon}
          title={emptyMessage}
          description={`No ${activeTab.toLowerCase()} at the moment.`}
        />
      );
    }
    return (
      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <OrderCard 
            key={order.order_id} 
            order={order} 
            fromOngoing={activeTab === 'Ongoing'}
          />
        ))}
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <NetworkErrorHandler>
        <PageContainer>
      <PageHeader title="Dashboard" />
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} pillSize="small" />

      {activeTab === 'New Orders' && (
        <>
          <DateFilterSection />
          {renderOrdersList(
            filteredNewOrders, 
            newOrdersLoading, 
            newOrdersError, 
            'No New Orders', 
            Package,
            'New Orders'
          )}
        </>
      )}

      {activeTab === 'Ongoing' && 
        renderOrdersList(
          ongoingOrders, 
          ongoingOrdersLoading, 
          ongoingOrdersError, 
          'No Ongoing Orders', 
          Clock,
          'Ongoing'
        )
      }

      {activeTab === 'Tickets' && (
        <>
          {ticketsLoading && <LoadingSpinner size="large" message="Loading tickets..." />}
          {ticketsError && (
            <ErrorMessage 
              message={ticketsError} 
              isNetworkError={isNetworkError(ticketsError)}
              isServerError={isServerError(ticketsError)}
              onRetry={fetchTickets}
            />
          )}
          {Array.isArray(tickets) && tickets.length > 0 ? (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onAccept={acceptTicket}
                  onReject={rejectTicket}
                  onCall={callPartner}
                />
              ))}
            </div>
          ) : (
            !ticketsLoading && !ticketsError && (
              <EmptyState
                icon={AlertTriangle}
                title="No Tickets"
                description="No open tickets at the moment."
              />
            )
          )}
        </>
      )}
        </PageContainer>
      </NetworkErrorHandler>
    </ErrorBoundary>
  );
}
