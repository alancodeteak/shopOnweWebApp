// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import TabBar from '@/components/Topbar';
import OrderCard from '@/components/OrderCard';
import AppSpinner from '@/components/AppSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import TicketCard from '@/components/TicketCard';
import PageHeader from '@/components/PageHeader';
import PageContainer from '@/components/PageContainer';
import EmptyState from '@/components/EmptyState';
import { Package, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useOrders, useTickets } from '@/hooks';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Ongoing');
  const shopId = useSelector((state) => state.auth.user?.shopId);

  // Use specialized hooks
  const {
    newOrders,
    newOrdersLoading,
    newOrdersError,
    ongoingOrders,
    ongoingOrdersLoading,
    ongoingOrdersError,
    completedOrders,
    completedOrdersLoading,
    completedOrdersError,
  } = useOrders(shopId);

  const {
    tickets,
    ticketsLoading,
    ticketsError,
    acceptTicket,
    rejectTicket,
    callPartner,
  } = useTickets();

  // Load tickets when tab is active
  useEffect(() => {
    if (activeTab === 'Tickets') {
      // Tickets are loaded automatically by the hook
    }
  }, [activeTab]);

  const renderOrdersList = (orders, loading, error, emptyMessage, icon) => {
    if (loading) return <AppSpinner label={`Loading ${activeTab.toLowerCase()}...`} />;
    if (error) return <ErrorMessage message={error} />;
    if (!orders?.length) {
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
        {orders.map((order) => (
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
    <PageContainer>
      <PageHeader title="Dashboard" />
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} pillSize="small" />

      {activeTab === 'New Orders' && 
        renderOrdersList(
          newOrders, 
          newOrdersLoading, 
          newOrdersError, 
          'No New Orders', 
          Package
        )
      }

      {activeTab === 'Ongoing' && 
        renderOrdersList(
          ongoingOrders, 
          ongoingOrdersLoading, 
          ongoingOrdersError, 
          'No Ongoing Orders', 
          Clock
        )
      }

      {activeTab === 'Completed' && 
        renderOrdersList(
          completedOrders, 
          completedOrdersLoading, 
          completedOrdersError, 
          'No Completed Orders', 
          CheckCircle
        )
      }

      {activeTab === 'Tickets' && (
        <>
          {ticketsLoading && <AppSpinner label="Loading tickets..." />}
          {ticketsError && <ErrorMessage message={ticketsError} />}
          {tickets?.length > 0 ? (
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
  );
}
