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
      const message = err?.response?.data?.message || 'Failed to fetch delivery partners';
      return thunkAPI.rejectWithValue(message);
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
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to fetch partner'
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
      const res = await API.put(`/delivery-partners/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data;
    } catch (err) {
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
      })
      .addCase(updatePartner.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
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
      });
  },
});

export const { clearCurrentPartner, resetUpdateStatus } = deliveryPartnerSlice.actions;
export default deliveryPartnerSlice.reducer;
