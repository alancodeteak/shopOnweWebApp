import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

// THUNKS
export const fetchAvailablePartners = createAsyncThunk(
  'deliveryPartners/fetchAvailable',
  async (_, thunkAPI) => {
    try {
      const res = await API.get('/delivery-partners/available');
      return res.data.data;
    } catch (err) {
      // Handle specific 404 error for no available partners
      if (err.response?.status === 404) {
        return thunkAPI.rejectWithValue({
          message: 'No delivery partners are currently available for assignment.',
          type: 'no_partners_available',
          status: 404
        });
      }
      
      // Handle other errors
      const message = err?.response?.data?.message || 'Failed to fetch delivery partners';
      return thunkAPI.rejectWithValue({
        message,
        type: 'fetch_error',
        status: err.response?.status || 500
      });
    }
  }
);

export const fetchAllPartners = createAsyncThunk(
  'deliveryPartners/fetchAll',
  async (_, thunkAPI) => {
    try {
      const res = await API.get('/delivery-partners/all', {
        withCredentials: false, // 👈 Explicitly avoid sending cookies
      });
      return res.data.data.partners;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to fetch delivery partners'
      );
    }
  }
);

export const fetchPartnerById = createAsyncThunk(
  'deliveryPartners/fetchById',
  async (id, thunkAPI) => {
    try {
      const res = await API.get(`/delivery-partners/${id}`);
      
      if (!res.data || !res.data.data) {
        return thunkAPI.rejectWithValue('Invalid API response format');
      }
      
      // Remove address and email from the response
      const { address, email, ...partnerDataWithoutAddressEmail } = res.data.data;
      
      // Debug: Log image data being fetched
      console.log('📸 FetchPartnerById - Image data:', {
        license_images: partnerDataWithoutAddressEmail.license_images,
        govt_id_images: partnerDataWithoutAddressEmail.govt_id_images,
        photo_url: partnerDataWithoutAddressEmail.photo_url
      });
      
      return partnerDataWithoutAddressEmail;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to fetch partner'
      );
    }
  }
);

export const createPartner = createAsyncThunk(
  'deliveryPartners/create',
  async (formData, thunkAPI) => {
    try {
      const res = await API.post('/delivery-partners/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to create partner'
      );
    }
  }
);

export const updatePartner = createAsyncThunk(
  'deliveryPartners/update',
  async ({ id, formData }, thunkAPI) => {
    try {
      console.log('🔄 Redux updatePartner - FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
      }
      
      const res = await API.put(`/delivery-partners/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log('✅ API Response:', res.data);
      console.log('📸 Image data in response:', {
        license_images: res.data.data?.license_images,
        govt_id_images: res.data.data?.govt_id_images,
        photo_url: res.data.data?.photo_url
      });
      return res.data.data;
    } catch (err) {
      console.error('❌ API Error:', err.response?.data || err.message);
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to update partner'
      );
    }
  }
);

export const generatePartnerId = createAsyncThunk(
  'deliveryPartners/generateId',
  async (shopId, thunkAPI) => {
    try {
      const res = await API.post('/delivery-partners/generate-id', {
        shop_id: shopId,
      });
      // The backend returns { deliveryPartnerId: "DP1366", ... }
      return res.data.deliveryPartnerId;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || 'Failed to generate ID'
      );
    }
  }
);

export const resetBonusPenalty = createAsyncThunk(
  'deliveryPartners/resetBonusPenalty',
  async (id, thunkAPI) => {
    try {
      const res = await API.put(`/delivery-partners/reset_bonus_penalty/${id}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || 'Failed to reset bonus/penalty'
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  'deliveryPartners/resetPassword',
  async ({ deliveryPartnerId, newPassword }, thunkAPI) => {
    try {
      const res = await API.post('/delivery-partner/auth/reset-password', {
        deliveryPartnerId,
        newPassword
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || 'Failed to reset password'
      );
    }
  }
);


// SLICE
const initialState = {
  list: [],
  available: [],
  current: null,
  loading: false,
  error: null,
  updating: false,
  updateSuccess: false,
  generatedId: null,
  created: null,
  resettingBonusPenalty: false,
  resetBonusPenaltyError: null,
  resettingPassword: false,
  resetPasswordError: null,
};

const deliveryPartnerSlice = createSlice({
  name: 'deliveryPartners',
  initialState,
  reducers: {
    clearCurrentPartner: (state) => {
      state.current = null;
    },
    resetUpdateStatus: (state) => {
      state.updating = false;
      state.updateSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailablePartners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailablePartners.fulfilled, (state, action) => {
        state.loading = false;
        state.available = action.payload;
      })
      .addCase(fetchAvailablePartners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllPartners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPartners.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAllPartners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPartnerById.pending, (state) => {
        state.loading = true;
        state.current = null;
        state.error = null;
      })
      .addCase(fetchPartnerById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchPartnerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updatePartner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePartner.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
        // Also update the partner in the list if it exists
        const partnerIndex = state.list.findIndex(p => p.delivery_partner_id === action.payload?.delivery_partner_id);
        if (partnerIndex !== -1) {
          state.list[partnerIndex] = action.payload;
        }
      })
      .addCase(updatePartner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPartner.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPartner.fulfilled, (state, action) => {
        state.loading = false;
        state.created = action.payload;
      })
      .addCase(createPartner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(generatePartnerId.pending, (state) => {
        state.loading = true;
      })
      .addCase(generatePartnerId.fulfilled, (state, action) => {
        state.loading = false;
        state.generatedId = action.payload;
      })
      .addCase(generatePartnerId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resetBonusPenalty.pending, (state) => {
        state.resettingBonusPenalty = true;
        state.resetBonusPenaltyError = null;
      })
      .addCase(resetBonusPenalty.fulfilled, (state, action) => {
        state.resettingBonusPenalty = false;
        // Update the current partner's bonus/penalty data
        if (state.current) {
          state.current.total_bonus = 0;
          state.current.total_penalty = 0;
        }
        // Also update the partner in the list if it exists
        const partnerIndex = state.list.findIndex(p => p.delivery_partner_id === state.current?.delivery_partner_id);
        if (partnerIndex !== -1) {
          state.list[partnerIndex].total_bonus = 0;
          state.list[partnerIndex].total_penalty = 0;
        }
      })
      .addCase(resetBonusPenalty.rejected, (state, action) => {
        state.resettingBonusPenalty = false;
        state.resetBonusPenaltyError = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.resettingPassword = true;
        state.resetPasswordError = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.resettingPassword = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resettingPassword = false;
        state.resetPasswordError = action.payload;
      });
  },
});

export const { clearCurrentPartner, resetUpdateStatus } = deliveryPartnerSlice.actions;
export default deliveryPartnerSlice.reducer;
