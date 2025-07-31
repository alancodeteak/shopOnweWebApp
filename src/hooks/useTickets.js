import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOpenTickets, ticketAction } from '@/store/slices/ticketsSlice';

export const useTickets = () => {
  const dispatch = useDispatch();
  
  // Tickets state
  const tickets = useSelector((state) => state.tickets.list);
  const loading = useSelector((state) => state.tickets.loading);
  const error = useSelector((state) => state.tickets.error);

  // Fetch open tickets
  const fetchTickets = useCallback(() => {
    dispatch(fetchOpenTickets());
  }, [dispatch]);

  // Handle ticket actions (accept/reject)
  const handleTicketAction = useCallback((ticketId, action, resolutionNotes = '') => {
    dispatch(ticketAction({ 
      ticketId, 
      action, 
      resolution_notes: resolutionNotes 
    }));
  }, [dispatch]);

  // Accept ticket
  const acceptTicket = useCallback((ticketId, notes) => {
    handleTicketAction(ticketId, 'accept', notes);
  }, [handleTicketAction]);

  // Reject ticket
  const rejectTicket = useCallback((ticketId, notes) => {
    handleTicketAction(ticketId, 'reject', notes);
  }, [handleTicketAction]);

  // Call partner
  const callPartner = useCallback((phone) => {
    window.open(`tel:${phone}`);
  }, []);

  return {
    // Data
    tickets,
    loading,
    error,
    
    // Actions
    fetchTickets,
    acceptTicket,
    rejectTicket,
    callPartner,
  };
}; 