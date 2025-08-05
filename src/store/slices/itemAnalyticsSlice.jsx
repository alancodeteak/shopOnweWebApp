import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '@/api/axios';

export const fetchItemAnalytics = createAsyncThunk(
  'itemAnalytics/fetchItemAnalytics',
  async ({ shopId, period, itemName }, { rejectWithValue }) => {
    try {
      const response = await API.get(`/items/shop/items/`, {
        params: {
          shop_id: shopId,
          period,
          item_name: itemName
        }
      });
      
      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        return rejectWithValue(response.data.message || 'Failed to fetch item analytics');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Network error');
    }
  }
);

const initialState = {
  data: null,
  loading: false,
  error: null,
  searchHistory: []
};

const itemAnalyticsSlice = createSlice({
  name: 'itemAnalytics',
  initialState,
  reducers: {
    clearItemAnalytics: (state) => {
      state.data = null;
      state.error = null;
    },
    addToSearchHistory: (state, action) => {
      const itemName = action.payload;
      // Ensure searchHistory is always an array
      if (!Array.isArray(state.searchHistory)) {
        state.searchHistory = [];
      }
      if (!state.searchHistory.includes(itemName)) {
        state.searchHistory = [itemName, ...state.searchHistory.slice(0, 4)]; // Keep last 5 searches
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItemAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItemAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchItemAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.data = null;
      });
  }
});

export const { clearItemAnalytics, addToSearchHistory } = itemAnalyticsSlice.actions;
export default itemAnalyticsSlice.reducer; 