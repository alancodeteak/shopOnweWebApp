// src/store/slices/overviewSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchOverview = createAsyncThunk(
  'overview/fetch',
  async ({ shopId, period = 'week' }, thunkAPI) => {
    try {
      const res = await API.get(`/shopowner/overview?shop_id=${shopId}&period=${period}`);
      const raw = res.data.data;

      return {
        totalOrders: raw.total_orders ?? 0,
        deliveredOrders: raw.delivered_orders ?? 0,
        cancelledOrders: raw.cancelled_orders ?? 0,
        pendingOrders: raw.pending_orders ?? 0,
        totalRevenue: raw.total_revenue ?? 0,
        onTimeDeliveryRate: raw.on_time_delivery_rate ?? 'N/A',
        averageDeliveryTime: raw.average_delivery_time ?? 'N/A',
        activePartners: raw.active_partners ?? 0,
      };
    } catch (err) {
      console.error('Error fetching overview:', err);
      // Handle different types of errors
      if (err.response?.status === 0 || err.message === 'Network Error') {
        const message = 'Network error. Please check your internet connection.';
        return thunkAPI.rejectWithValue({ 
          message, 
          isNetworkError: true,
          statusCode: 0
        });
      }
      if (err.response?.status === 401) {
        const message = 'Authentication failed. Please login again.';
        return thunkAPI.rejectWithValue({ 
          message, 
          statusCode: 401
        });
      }
      if (err.response?.status === 403) {
        const message = 'Access denied. You do not have permission to view analytics.';
        return thunkAPI.rejectWithValue({ 
          message, 
          statusCode: 403
        });
      }
      const message = err.response?.data?.message || 'Failed to fetch overview';
      return thunkAPI.rejectWithValue({ 
        message, 
        isServerError: err.response?.status >= 500,
        statusCode: err.response?.status
      });
    }
  }
);

const overviewSlice = createSlice({
  name: 'overview',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOverview.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchOverview.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export default overviewSlice.reducer;
