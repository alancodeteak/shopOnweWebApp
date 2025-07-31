import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

// THUNKS
export const fetchPromotion = createAsyncThunk(
  'promotions/fetchPromotion',
  async (_, thunkAPI) => {
    try {
      const res = await API.get('/shopowner-promo/promotion');
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || 'Failed to fetch promotion'
      );
    }
  }
);

export const upsertPromotion = createAsyncThunk(
  'promotions/upsertPromotion',
  async (promotionData, thunkAPI) => {
    try {
      const res = await API.post('/shopowner-promo/promotion', promotionData);
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || 'Failed to save promotion'
      );
    }
  }
);

// Initial state
const initialState = {
  current: null,
  loading: false,
  saving: false,
  error: null,
  success: null,
};

// Slice
const promotionsSlice = createSlice({
  name: 'promotions',
  initialState,
  reducers: {
    clearPromotion: (state) => {
      state.current = null;
      state.error = null;
      state.success = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Promotion
      .addCase(fetchPromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromotion.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
        state.error = null;
      })
      .addCase(fetchPromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch promotion';
      })

      // Upsert Promotion
      .addCase(upsertPromotion.pending, (state) => {
        state.saving = true;
        state.error = null;
        state.success = null;
      })
      .addCase(upsertPromotion.fulfilled, (state, action) => {
        state.saving = false;
        state.current = action.payload;
        state.success = 'Promotion saved successfully!';
        state.error = null;
      })
      .addCase(upsertPromotion.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || 'Failed to save promotion';
        state.success = null;
      });
  },
});

export const { clearPromotion, clearError, clearSuccess } = promotionsSlice.actions;
export default promotionsSlice.reducer; 