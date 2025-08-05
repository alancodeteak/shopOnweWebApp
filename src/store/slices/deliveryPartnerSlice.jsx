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
  async ({ page = 1, limit = 10 } = {}, thunkAPI) => {
    try {
      const res = await API.get(`/delivery-partners/all/?page=${page}&limit=${limit}`, {
        withCredentials: false, // 👈 Explicitly avoid sending cookies
      });
      
      return {
        partners: res.data.data.partners,
        pagination: {
          currentPage: res.data.data.page || page,
          totalPages: res.data.data.total_pages || 1,
          totalCount: res.data.data.total_count || 0,
          limit: res.data.data.limit || limit
        }
      };
    } catch (err) {
      console.error('🔍 Error fetching delivery partners:', err);
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
      
      // Image data being fetched
      
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
      // FormData contents before sending
      
      const res = await API.post('/delivery-partners/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data;
    } catch (err) {
      console.error('❌ createPartner API Error:', err.response?.data || err.message);
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
      const res = await API.put(`/delivery-partners/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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
      const res = await API.put(`/delivery-partners/reset-password/${deliveryPartnerId}`, {
        new_password: newPassword,
      });
      
      return res.data;
    } catch (err) {
      console.error('❌ Redux resetPassword - API Error:', err.response?.data || err.message);
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || 'Failed to reset password'
      );
    }
  }
);

export const fetchPartnerLocation = createAsyncThunk(
  'deliveryPartners/fetchLocation',
  async (partnerId, thunkAPI) => {
    try {
      const res = await API.get(`/tracking/partner/${partnerId}`);
      
      if (!res.data || !res.data.data) {
        return thunkAPI.rejectWithValue('Invalid API response format');
      }
      
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to fetch partner location'
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
  location: null,
  locationLoading: false,
  locationError: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10
  }
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
    // Pagination actions
    setCurrentPage: (state, action) => {
      if (state.pagination) {
        state.pagination.currentPage = action.payload;
      } else {
        state.pagination = { currentPage: action.payload, totalPages: 1, totalCount: 0, limit: 10 };
      }
    },
    resetPagination: (state) => {
      if (state.pagination) {
        state.pagination.currentPage = 1;
      }
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
        state.list = action.payload.partners;
        state.pagination = action.payload.pagination;
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
      })
      .addCase(fetchPartnerLocation.pending, (state) => {
        state.locationLoading = true;
        state.locationError = null;
      })
      .addCase(fetchPartnerLocation.fulfilled, (state, action) => {
        state.locationLoading = false;
        state.location = action.payload;
      })
      .addCase(fetchPartnerLocation.rejected, (state, action) => {
        state.locationLoading = false;
        state.locationError = action.payload;
      });
  },
});

export const { clearCurrentPartner, resetUpdateStatus, setCurrentPage, resetPagination } = deliveryPartnerSlice.actions;
export default deliveryPartnerSlice.reducer;
