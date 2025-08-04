import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/axios";
// THUNKS
export const fetchOrdersByStatus = createAsyncThunk(
  'orders/fetchByStatus',
  async ({ shopId, status, page = 1, limit = 20 }, thunkAPI) => {
    const getEndpointForStatus = (status, shopId, page, limit) => {
      switch (status) {
        case 'new': return `/orders/new-orders?shop_id=${shopId}`;
        case 'ongoing': return `/orders/ongoing?shop_id=${shopId}`;
        case 'completed': return `/orders/shop/completed?shop_id=${shopId}&page=${page}&limit=${limit}`;
        default: throw new Error(`Invalid order status: ${status}`);
      }
    };
    try {
      const endpoint = getEndpointForStatus(status, shopId, page, limit);
      console.log(`Fetching ${status} orders from: ${endpoint}`);
      const res = await API.get(endpoint);
      
      // Debug: Log the response data to see if water field is present
      console.log(`🌊 ${status} orders API response:`, res.data);
      if (res.data.data && Array.isArray(res.data.data)) {
        console.log(`🌊 First ${status} order:`, res.data.data[0]);
        console.log(`🌊 ${status} orders water field check:`, res.data.data.map(order => ({ 
          order_id: order.order_id, 
          water: order.water, 
          has_water: 'water' in order 
        })));
      }
      if (status === 'completed') {
        // API returns { data: { orders: Array, page: number, totalPages: number } }
        const completedOrders = Array.isArray(res.data.data.orders) ? res.data.data.orders : [];
        
        // Debug: Log completed orders data
        console.log(`🌊 Completed orders API response:`, res.data);
        console.log(`🌊 First completed order:`, completedOrders[0]);
        console.log(`🌊 Completed orders water field check:`, completedOrders.map(order => ({ 
          order_id: order.order_id, 
          water: order.water, 
          has_water: 'water' in order 
        })));
        
        return {
          data: completedOrders,
          page: res.data.data.page || page,
          totalPages: res.data.data.totalPages || 1,
          status,
        };
      } else {
        return { data: res.data.data, status };
      }
    } catch (err) {
      console.error(`Error fetching ${status} orders:`, err);
      // Handle different types of errors
      if (err.response?.status === 0 || err.message === 'Network Error') {
        const message = 'Network error. Please check your internet connection.';
        return thunkAPI.rejectWithValue({ message, status });
      }
      if (err.response?.status === 401) {
        const message = 'Authentication failed. Please login again.';
        return thunkAPI.rejectWithValue({ message, status });
      }
      if (err.response?.status === 403) {
        const message = 'Access denied. You do not have permission to view these orders.';
        return thunkAPI.rejectWithValue({ message, status });
      }
      const message = err.response?.data?.message || `Failed to fetch ${status} orders`;
      return thunkAPI.rejectWithValue({ message, status });
    }
  }
);

export const assignOrder = createAsyncThunk(
  'orders/assign',
  async ({ orderId, partnerId, shopId }, thunkAPI) => {
    try {
      const res = await API.post(
        `/orders/${orderId}/assign-partner`,
        {
          delivery_partner_id: partnerId,
          shop_id: shopId,
        }
      );
      return { orderId, partnerId, message: res.data.message };
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to assign order.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// I am ensuring this thunk is defined here as it's critical for the fix.
export const fetchOrderById = createAsyncThunk(
  "orders/fetchById",
  async (id, thunkAPI) => {
    try {
      const res = await API.get(`/orders/${id}`);
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || "Failed to fetch order"
      );
    }
  }
);

export const updateOrderUrgency = createAsyncThunk(
  'orders/updateUrgency',
  async ({ orderId, urgency }, thunkAPI) => {
    try {
      // 1. Tell the server to update the urgency
      await API.put(`/orders/${orderId}/urgency`, { urgency });

      // 2. THE REAL FIX: Immediately fetch the updated order from the server.
      // This ensures the UI is in sync with the database.
      thunkAPI.dispatch(fetchOrderById(orderId));
      
      return { orderId, urgency };
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to update urgency.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const verifyPayment = createAsyncThunk(
  "orders/verifyPayment",
  async (orderId, thunkAPI) => {
    try {
      const res = await API.put(`/orders/${orderId}/verify-payment`, { verified: true });
      return { ...res.data.data, orderId };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Payment verification failed"
      );
    }
  }
);

// Fetch all orders
export const fetchOrders = createAsyncThunk(
  "orders/fetchAll",
  async ({ shopId, page = 1, limit = 10 }, thunkAPI) => {
    try {
      const res = await API.get(
        `/orders/list?shop_id=${shopId}&page=${page}&limit=${limit}`
      );
      return {
        orders: res.data.data.orders,
        page: res.data.data.page || page,
        totalPages: res.data.data.totalPages || 1,
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

// Search by order ID
export const searchOrderById = createAsyncThunk(
  "orders/searchById",
  async (orderId, thunkAPI) => {
    try {
      const res = await API.get(`/orders/${orderId}/search`);
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || "Order not found"
      );
    }
  }
);

// Search orders with query
export const searchOrders = createAsyncThunk(
  "orders/search",
  async ({ query, shopId, page = 1, limit = 20, filters = {} }, thunkAPI) => {
    try {
      const params = new URLSearchParams({
        shop_id: shopId,
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (query) {
        params.append('query', query);
      }
      
      // Add filter parameters
      if (filters.deliveryPartners?.length > 0) {
        filters.deliveryPartners.forEach(partner => {
          params.append('delivery_partners[]', partner);
        });
      }
      
      if (filters.paymentModes?.length > 0) {
        filters.paymentModes.forEach(mode => {
          params.append('payment_modes[]', mode);
        });
      }
      
      if (filters.verificationStatus?.length > 0) {
        filters.verificationStatus.forEach(status => {
          params.append('verification_status[]', status);
        });
      }
      
      const res = await API.get(`/orders/search?${params.toString()}`);
      return {
        orders: res.data.data.orders || res.data.data || [],
        page: res.data.data.page || page,
        totalPages: res.data.data.totalPages || 1,
        query,
        filters,
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || "Failed to search orders"
      );
    }
  }
);

// Fetch delivery partners for filter options
export const fetchDeliveryPartners = createAsyncThunk(
  "orders/fetchDeliveryPartners",
  async (shopId, thunkAPI) => {
    try {
      const res = await API.get(`/delivery-partners?shop_id=${shopId}`);
      return res.data.data || [];
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || "Failed to fetch delivery partners"
      );
    }
  }
);

// Fetch payment modes for filter options
export const fetchPaymentModes = createAsyncThunk(
  "orders/fetchPaymentModes",
  async (shopId, thunkAPI) => {
    try {
      const res = await API.get(`/orders/payment-modes?shop_id=${shopId}`);
      return res.data.data || [];
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || "Failed to fetch payment modes"
      );
    }
  }
);

// Create order
export const createOrder = createAsyncThunk(
  "orders/create",
  async (orderPayload, thunkAPI) => {
    try {
      // Debug: Log what's being sent to the API
      console.log('🌊 Creating order with payload:', orderPayload);
      if (orderPayload instanceof FormData) {
        console.log('🌊 FormData entries:');
        for (let [key, value] of orderPayload.entries()) {
          console.log(`  ${key}:`, value);
        }
      }
      
      const res = await API.post(`/orders/create`, orderPayload);
      
      // Debug: Log what's returned from the API
      console.log('🌊 Order created successfully:', res.data.data);
      
      return res.data.data;
    } catch (err) {
      console.error('🌊 Error creating order:', err);
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || "Failed to create order"
      );
    }
  }
);

// --- Update Customer Address Thunk ---
export const updateCustomerAddress = createAsyncThunk(
  'orders/updateCustomerAddress',
  async ({ customer_name, customer_phone_number, address }, { rejectWithValue }) => {
    try {
      const response = await API.put(
        `/customer-order-address/`,
        { customer_name, customer_phone_number, address }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update address');
    }
  }
);

// --- Fetch Customer By Phone Thunk ---
export const fetchCustomerByPhone = createAsyncThunk(
  'orders/fetchCustomerByPhone',
  async (phone, { rejectWithValue }) => {
    try {
      const response = await API.get(`/customer-order-address/${phone}`);
      // Extract customer data from the nested response structure
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Customer not found');
    }
  }
);

export const updateOrderStatusByShopOwner = createAsyncThunk(
  'orders/updateOrderStatusByShopOwner',
  async ({ order_id, status, cancellation_reason }, { rejectWithValue }) => {
    try {
      const body = { status };
      if (status === 'Cancelled' && cancellation_reason) {
        body.cancellation_reason = cancellation_reason;
      }
      const response = await API.put(
        `/orders/shop-owner/status/${order_id}`,
        body
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update order status');
    }
  }
);

// Initial state
const initialState = {
  list: [],
  current: null,
  created: null,
  loading: false, // General loading for non-status-specific actions
  error: null,
  pagination: null,
  searchQuery: null, // Track current search query
  // Filter state
  activeFilters: {
    deliveryPartners: [],
    paymentModes: [],
    verificationStatus: [],
  },
  availableFilters: {
    deliveryPartners: [],
    paymentModes: [],
  },
  filtersLoading: false,
  filtersError: null,
  // State for different order categories
  newOrders: [],
  newOrdersLoading: false,
  newOrdersError: null,
  ongoingOrders: [],
  ongoingOrdersLoading: false,
  ongoingOrdersError: null,
  completedOrders: [],
  completedOrdersLoading: false,
  completedOrdersError: null,
  // Dedicated loading flag for urgency
  urgencyLoading: false,
  updateCustomerAddressLoading: false,
  updateCustomerAddressError: null,
  updateCustomerAddressSuccess: false,
  updateOrderStatusLoading: false,
  updateOrderStatusError: null,
  updateOrderStatusSuccess: false,
  // Customer search state
  customerSearch: {
    data: null,
    loading: false,
    error: null,
  },
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.current = null;
    },
    clearCreatedOrder: (state) => {
      state.created = null;
    },
    updateUrgencyLocal: (state, action) => {
      const { is_urgent } = action.payload;
      if (state.current) {
        state.current.is_urgent = is_urgent;
      }
    },
    clearCustomerSearch: (state) => {
      state.customerSearch = {
        data: null,
        loading: false,
        error: null,
      };
    },
    clearSearchQuery: (state) => {
      state.searchQuery = null;
    },
    // Filter actions
    setFilter: (state, action) => {
      const { type, value } = action.payload;
      if (state.activeFilters[type]) {
        if (!state.activeFilters[type].includes(value)) {
          state.activeFilters[type].push(value);
        }
      }
    },
    removeFilter: (state, action) => {
      const { type, value } = action.payload;
      if (state.activeFilters[type]) {
        state.activeFilters[type] = state.activeFilters[type].filter(item => item !== value);
      }
    },
    clearAllFilters: (state) => {
      state.activeFilters = {
        deliveryPartners: [],
        paymentModes: [],
        verificationStatus: [],
      };
    },
    clearFilterType: (state, action) => {
      const { type } = action.payload;
      if (state.activeFilters[type]) {
        state.activeFilters[type] = [];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload.orders)
          ? action.payload.orders
          : [];
        state.pagination = {
          page: action.payload.page || 1,
          totalPages: action.payload.totalPages || 1,
        };
        state.searchQuery = null; // Clear search query when fetching all orders
        
        // Debug: Log the first order to see what fields are available
        if (state.list.length > 0) {
          console.log('🌊 First order from API:', state.list[0]);
          console.log('🌊 Available fields:', Object.keys(state.list[0]));
          console.log('🌊 Water field value:', state.list[0].water);
        }
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch orders";
      })

      // Search by Order ID
      .addCase(searchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload ? [action.payload] : [];
        state.pagination = { page: 1, totalPages: 1 };
      })
      .addCase(searchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Order not found";
        state.list = [];
        state.pagination = { page: 1, totalPages: 1 };
      })

      // Search orders with query
      .addCase(searchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.orders;
        state.pagination = {
          page: action.payload.page || 1,
          totalPages: action.payload.totalPages || 1,
        };
        state.searchQuery = action.payload.query;
        state.activeFilters = action.payload.filters || state.activeFilters;
      })
      .addCase(searchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to search orders";
        state.list = [];
        state.pagination = { page: 1, totalPages: 1 };
        state.searchQuery = null;
      })

      // Fetch delivery partners for filters
      .addCase(fetchDeliveryPartners.pending, (state) => {
        state.filtersLoading = true;
        state.filtersError = null;
      })
      .addCase(fetchDeliveryPartners.fulfilled, (state, action) => {
        state.filtersLoading = false;
        state.availableFilters.deliveryPartners = action.payload;
      })
      .addCase(fetchDeliveryPartners.rejected, (state, action) => {
        state.filtersLoading = false;
        state.filtersError = action.payload || "Failed to fetch delivery partners";
      })

      // Fetch payment modes for filters
      .addCase(fetchPaymentModes.pending, (state) => {
        state.filtersLoading = true;
        state.filtersError = null;
      })
      .addCase(fetchPaymentModes.fulfilled, (state, action) => {
        state.filtersLoading = false;
        state.availableFilters.paymentModes = action.payload;
      })
      .addCase(fetchPaymentModes.rejected, (state, action) => {
        state.filtersLoading = false;
        state.filtersError = action.payload || "Failed to fetch payment modes";
      })

      // Fetch Single Order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        // **THE FIX**: DO NOT set the current order to null here.
        // Leaving the old data in place while the new data is loading
        // prevents the entire component from crashing.
        // state.current = null; <-- THIS WAS THE BUG
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
        
        // Debug: Log the order details to see what fields are available
        console.log('🌊 Order details from API:', action.payload);
        console.log('🌊 Available fields:', Object.keys(action.payload));
        console.log('🌊 Water field value:', action.payload.water);
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch order";
      })

      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.created = null;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.created = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create order";
      })

      // Assign Order
      .addCase(assignOrder.pending, (state) => {
        state.loading = true; // or a specific loading flag for assignment
      })
      .addCase(assignOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Find the order in newOrders and remove it, as it's now ongoing
        state.newOrders = state.newOrders.filter(
          (order) => order.order_id !== action.payload.orderId
        );
        // Optionally, you can add it to ongoingOrders if you want to update the UI immediately
        if (state.current && state.current.order_id === action.payload.orderId) {
          state.current.delivery_partner_id = action.payload.partnerId;
          state.current.order_status = 'Assigned'; 
        }
      })
      .addCase(assignOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Order Urgency
      .addCase(updateOrderUrgency.pending, (state) => {
        state.urgencyLoading = true;
        state.error = null;
      })
      // This reducer no longer needs to optimistically update the state,
      // as the fetchOrderById action handles it.
      .addCase(updateOrderUrgency.fulfilled, (state, action) => {
        // We can just turn off any specific loading indicators here if we had them.
        // The main 'current' state will be updated by the fetchOrderById.fulfilled action.
        state.urgencyLoading = false; 
      })
      .addCase(updateOrderUrgency.rejected, (state, action) => {
        state.urgencyLoading = false;
        state.error = action.payload || "Failed to update urgency";
      })
      
      // Dynamic reducer for fetchOrdersByStatus
      .addCase(fetchOrdersByStatus.pending, (state, action) => {
        const { status } = action.meta.arg;
        if (status === 'new') {
          state.newOrdersLoading = true;
          state.newOrdersError = null;
        } else if (status === 'ongoing') {
          state.ongoingOrdersLoading = true;
          state.ongoingOrdersError = null;
        } else if (status === 'completed') {
          state.completedOrdersLoading = true;
          state.completedOrdersError = null;
        }
      })
      .addCase(fetchOrdersByStatus.fulfilled, (state, action) => {
        const { status, data } = action.payload;
        if (status === 'new') {
          state.newOrdersLoading = false;
          state.newOrders = data;
        } else if (status === 'ongoing') {
          state.ongoingOrdersLoading = false;
          state.ongoingOrders = data;
        } else if (status === 'completed') {
          state.completedOrdersLoading = false;
          state.completedOrders = data;
          state.completedOrdersPagination = {
            page: action.payload.page || 1,
            totalPages: action.payload.totalPages || 1,
          };
        }
      })
      .addCase(fetchOrdersByStatus.rejected, (state, action) => {
        const { status, message } = action.payload;
        if (status === 'new') {
          state.newOrdersLoading = false;
          state.newOrdersError = message;
        } else if (status === 'ongoing') {
          state.ongoingOrdersLoading = false;
          state.ongoingOrdersError = message;
        } else if (status === 'completed') {
          state.completedOrdersLoading = false;
          state.completedOrdersError = message;
        }
      })
      
      // verify payment
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.loading = false;
        if (state.current) {
          state.current.payment_status = action.payload.paymentStatus || "paid";
        }
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to verify payment.";
      })

      // Update Customer Address
      .addCase(updateCustomerAddress.pending, (state) => {
        state.updateCustomerAddressLoading = true;
        state.updateCustomerAddressError = null;
        state.updateCustomerAddressSuccess = false;
      })
      .addCase(updateCustomerAddress.fulfilled, (state, action) => {
        state.updateCustomerAddressLoading = false;
        state.updateCustomerAddressSuccess = true;
        state.updateCustomerAddressError = null;
      })
      .addCase(updateCustomerAddress.rejected, (state, action) => {
        state.updateCustomerAddressLoading = false;
        state.updateCustomerAddressError = action.payload || 'Failed to update address';
        state.updateCustomerAddressSuccess = false;
      })

      // Update Order Status by Shop Owner
      .addCase(updateOrderStatusByShopOwner.pending, (state) => {
        state.updateOrderStatusLoading = true;
        state.updateOrderStatusError = null;
        state.updateOrderStatusSuccess = false;
      })
      .addCase(updateOrderStatusByShopOwner.fulfilled, (state, action) => {
        state.updateOrderStatusLoading = false;
        state.updateOrderStatusSuccess = true;
        state.updateOrderStatusError = null;
      })
      .addCase(updateOrderStatusByShopOwner.rejected, (state, action) => {
        state.updateOrderStatusLoading = false;
        state.updateOrderStatusError = action.payload || 'Failed to update order status';
        state.updateOrderStatusSuccess = false;
      })

      // Fetch Customer By Phone
      .addCase(fetchCustomerByPhone.pending, (state) => {
        state.customerSearch.loading = true;
        state.customerSearch.error = null;
        state.customerSearch.data = null;
      })
      .addCase(fetchCustomerByPhone.fulfilled, (state, action) => {
        state.customerSearch.loading = false;
        state.customerSearch.data = action.payload;
        state.customerSearch.error = null;
      })
      .addCase(fetchCustomerByPhone.rejected, (state, action) => {
        state.customerSearch.loading = false;
        state.customerSearch.error = action.payload || 'Customer not found';
        state.customerSearch.data = null;
      });
  },
});

export const { 
  clearCurrentOrder, 
  clearCreatedOrder, 
  updateUrgencyLocal, 
  clearCustomerSearch, 
  clearSearchQuery,
  setFilter,
  removeFilter,
  clearAllFilters,
  clearFilterType
} = ordersSlice.actions;

export default ordersSlice.reducer;
