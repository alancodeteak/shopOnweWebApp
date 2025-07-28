import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';
import { toast } from 'react-toastify';

// Fetch open tickets
export const fetchOpenTickets = createAsyncThunk(
  'tickets/fetchOpen',
  async (_, thunkAPI) => {
    try {
      const res = await API.get('/tickets/open');
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch tickets');
    }
  }
);

// Ticket action (accept/reject)
export const ticketAction = createAsyncThunk(
  'tickets/action',
  async ({ ticketId, action, resolution_notes }, thunkAPI) => {
    try {
      const url = `/tickets/${ticketId}/action`;
      const body = { action, resolution_notes };
      console.log('ticketId:', ticketId, 'url:', url, 'body:', body, 'baseURL:', API.defaults.baseURL);
      const response = await API.put(url, body);
      console.log('response:', response);
      toast.success(`Ticket ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`);
      return { ticketId, action };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update ticket');
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to update ticket');
    }
  }
);

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState: {
    list: [],
    loading: false,
    error: null,
    actionLoading: false,
    actionError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOpenTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOpenTickets.fulfilled, (state, action) => {
        state.loading = false;
        // Map ticket_id to id if needed
        state.list = action.payload.map(ticket => ({
          ...ticket,
          id: ticket.id || ticket.ticket_id, // fallback to ticket_id if id is missing
        }));
      })
      .addCase(fetchOpenTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(ticketAction.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(ticketAction.fulfilled, (state, action) => {
        state.actionLoading = false;
        // Remove the ticket from the list after action
        state.list = state.list.filter(t => t.id !== action.payload.ticketId);
      })
      .addCase(ticketAction.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });
  },
});

export default ticketsSlice.reducer; 