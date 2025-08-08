import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import OrdersTopTabs from '@/components/orders/OrdersTopTabs';
import FilterActionBar from '@/components/orders/FilterActionBar';
import { ErrorBoundary, NetworkErrorHandler, LoadingSpinner, ErrorMessage, TicketCard, EmptyState } from '@/components';
import { useTickets } from '@/hooks';
import { AlertTriangle } from 'lucide-react';

export default function TicketsPage() {
  const { tickets, ticketsLoading, ticketsError, acceptTicket, rejectTicket, callPartner, fetchTickets } = useTickets();
  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  return (
    <ErrorBoundary>
      <NetworkErrorHandler>
        <div className="min-h-screen bg-[#F5F7FA] pt-16 pb-24">
          <div className="max-w-[1440px] mx-auto px-6 space-y-4">
            <OrdersTopTabs />
            <FilterActionBar />
            {ticketsLoading && <LoadingSpinner size="large" message="Loading tickets..." />}
            {ticketsError && (
              <ErrorMessage message={ticketsError} onRetry={fetchTickets} />
            )}
            {!ticketsLoading && !ticketsError && (
              Array.isArray(tickets) && tickets.length > 0 ? (
                <div className="space-y-3">
                  {tickets.map((t) => (
                    <TicketCard key={t.id} ticket={t} onAccept={acceptTicket} onReject={rejectTicket} onCall={callPartner} />)
                  )}
                </div>
              ) : (
                <EmptyState icon={AlertTriangle} title="No Tickets" description="No open tickets at the moment." />
              )
            )}
          </div>
        </div>
      </NetworkErrorHandler>
    </ErrorBoundary>
  );
}


