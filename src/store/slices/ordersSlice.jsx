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
      const res = await API.get(endpoint);
      
      if (status === 'completed') {
        // API returns { data: { orders: Array, page: number, totalPages: number } }
        const completedOrders = Array.isArray(res.data.data.orders) ? res.data.data.orders : [];
        
        return {
          data: completedOrders,
          page: res.data.data.current_page || page,
          totalPages: res.data.data.total_pages || 1,
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
        return thunkAPI.rejectWithValue({ 
          message, 
          status,
          isNetworkError: true,
          statusCode: 0
        });
      }
      if (err.response?.status === 401) {
        const message = 'Authentication failed. Please login again.';
        return thunkAPI.rejectWithValue({ 
          message, 
          status,
          statusCode: 401
        });
      }
      if (err.response?.status === 403) {
        const message = 'Access denied. You do not have permission to view these orders.';
        return thunkAPI.rejectWithValue({ 
          message, 
          status,
          statusCode: 403
        });
      }
      const message = err.response?.data?.message || `Failed to fetch ${status} orders`;
      return thunkAPI.rejectWithValue({ 
        message, 
        status,
        isServerError: err.response?.status >= 500,
        statusCode: err.response?.status
      });
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
        page: res.data.data.current_page || page,
        totalPages: res.data.data.total_pages || 1,
      };
    } catch (err) {
      console.error('Error fetching orders:', err);
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
        const message = 'Access denied. You do not have permission to view these orders.';
        return thunkAPI.rejectWithValue({ 
          message, 
          statusCode: 403
        });
      }
      const message = err.response?.data?.message || "Failed to fetch orders";
      return thunkAPI.rejectWithValue({ 
        message, 
        isServerError: err.response?.status >= 500,
        statusCode: err.response?.status
      });
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
      if (filters.dpid) {
        params.append('dpid', filters.dpid);
      }
      
      if (filters.payment_mode) {
        params.append('payment_mode', filters.payment_mode);
      }
      
      if (filters.verificationStatus?.length > 0) {
        filters.verificationStatus.forEach(status => {
          params.append('verification_status[]', status);
        });
      }
      
      if (filters.status) {
        params.append('status', filters.status);
      }
      
      if (filters.start_date) {
        params.append('start_date', filters.start_date);
      }
      
      if (filters.end_date) {
        params.append('end_date', filters.end_date);
      }
      
              const res = await API.get(`/orders/search?${params.toString()}`);
        
        // Calculate totalPages from total count and limit
        const total = res.data.data.total || 0;
        const currentLimit = parseInt(limit);
        const calculatedTotalPages = Math.ceil(total / currentLimit);
        
        return {
          orders: res.data.data.orders || res.data.data || [],
          page: res.data.data.page || page,
          totalPages: calculatedTotalPages,
          total: total,
          query,
          filters,
        };
    } catch (err) {
      console.error('Error searching orders:', err);
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
        const message = 'Access denied. You do not have permission to search these orders.';
        return thunkAPI.rejectWithValue({ 
          message, 
          statusCode: 403
        });
      }
      const message = err.response?.data?.message || "Failed to search orders";
      return thunkAPI.rejectWithValue({ 
        message, 
        isServerError: err.response?.status >= 500,
        statusCode: err.response?.status
      });
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
      const res = await API.post(`/orders/create`, orderPayload);
      
      return res.data.data;
    } catch (err) {
      console.error('🌊 Error creating order:', err);
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
        const message = 'Access denied. You do not have permission to create orders.';
        return thunkAPI.rejectWithValue({ 
          message, 
          statusCode: 403
        });
      }
      const message = err.response?.data?.message || "Failed to create order";
      return thunkAPI.rejectWithValue({ 
        message, 
        isServerError: err.response?.status >= 500,
        statusCode: err.response?.status
      });
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
      if (status.toLowerCase() === 'cancelled' && cancellation_reason) {
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
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  },
  searchQuery: null, // Track current search query
  // Filter state
  activeFilters: {
    deliveryPartners: [],
    paymentModes: [],
    verificationStatus: [],
  },
  // UI Filter state for persistence
  uiFilters: {
    status: '',
    deliveryPartner: '',
    paymentMode: '',
    startDate: '',
    endDate: '',
    paymentVerification: '' // for completed orders
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
  completedOrdersPagination: null,
  // Date filter state
  dateFilter: {
    startDate: null,
    endDate: null,
    isToday: false,
  },
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
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
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
    // UI Filter actions
    setUIFilter: (state, action) => {
      const { filterType, value } = action.payload;
      state.uiFilters[filterType] = value;
    },
    clearUIFilters: (state) => {
      state.uiFilters = {
        status: '',
        deliveryPartner: '',
        paymentMode: '',
        startDate: '',
        endDate: '',
        paymentVerification: ''
      };
    },
    // Pagination actions
    setCurrentPage: (state, action) => {
      if (state.pagination) {
        state.pagination.currentPage = action.payload;
      } else {
        state.pagination = { currentPage: action.payload, totalPages: 1, total: 0 };
      }
    },
    resetPagination: (state) => {
      if (state.pagination) {
        state.pagination.currentPage = 1;
      }
    },
    // Date filter actions
    setDateFilter: (state, action) => {
      const { startDate, endDate, isToday } = action.payload;
      state.dateFilter.startDate = startDate !== undefined ? startDate : state.dateFilter.startDate;
      state.dateFilter.endDate = endDate !== undefined ? endDate : state.dateFilter.endDate;
      state.dateFilter.isToday = isToday !== undefined ? isToday : state.dateFilter.isToday;
    },
    clearDateFilter: (state) => {
      state.dateFilter = {
        startDate: null,
        endDate: null,
        isToday: false,
      };
    },
    setTodayFilter: (state) => {
      const today = new Date().toISOString().split('T')[0];
      console.log('🗓️ Setting today filter:', today);
      state.dateFilter = {
        startDate: today,
        endDate: today,
        isToday: true,
      };
      console.log('📅 Updated dateFilter state:', state.dateFilter);
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
          currentPage: action.payload.page || 1,
          totalPages: action.payload.totalPages || 1,
          total: action.payload.total || 0,
          limit: 10
        };
        state.searchQuery = null; // Clear search query when fetching all orders
        
        // Debug: Log the first order to see what fields are available
        if (state.list.length > 0) {
          // First order from API
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
        state.pagination = { currentPage: 1, totalPages: 1, total: 0, limit: 10 };
      })
      .addCase(searchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Order not found";
        state.list = [];
        state.pagination = { currentPage: 1, totalPages: 1, total: 0, limit: 10 };
      })

      // Search orders with query
      .addCase(searchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchOrders.fulfilled, (state, action) => {
        state.loading = false;
        
        // Replace orders for pagination (not accumulate)
        state.list = action.payload.orders;
        
        state.pagination = {
          currentPage: action.payload.page || 1,
          totalPages: action.payload.totalPages || 1,
          total: action.payload.total || 0,
          limit: 10
        };
        state.searchQuery = action.payload.query;
        state.activeFilters = action.payload.filters || state.activeFilters;
      })
      .addCase(searchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to search orders";
        state.list = [];
        state.pagination = { currentPage: 1, totalPages: 1, total: 0, limit: 10 };
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
        
        // Order details from API
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
        state.error = action.payload?.message || action.payload || "Failed to create order";
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
        const { status, data, page } = action.payload;
        console.log('📊 fetchOrdersByStatus fulfilled:', { status, dataLength: data?.length });
        if (status === 'new') {
          state.newOrdersLoading = false;
          state.newOrders = data;
          console.log('🆕 New orders sample:', data?.[0]);
        } else if (status === 'ongoing') {
          state.ongoingOrdersLoading = false;
          state.ongoingOrders = data;
        } else if (status === 'completed') {
          state.completedOrdersLoading = false;
          // Proper infinite scroll: accumulate orders for pagination
          if (page === 1) {
            // First page: replace all orders
            state.completedOrders = data;
          } else {
            // Subsequent pages: append new orders to existing ones
            // Filter out duplicates based on order_id
            const existingOrderIds = new Set((state.completedOrders || []).map(order => order.order_id));
            const newOrders = data.filter(order => !existingOrderIds.has(order.order_id));
            state.completedOrders = [...(state.completedOrders || []), ...newOrders];
          }
          state.completedOrdersPagination = {
            page: action.payload.page || 1,
            totalPages: action.payload.totalPages || 1,
          };

        }
      })
      .addCase(fetchOrdersByStatus.rejected, (state, action) => {
        const errorPayload = action.payload;
        const status = errorPayload?.status;
        const message = errorPayload?.message || 'An error occurred';
        
        if (status === 'new') {
          state.newOrdersLoading = false;
          state.newOrdersError = errorPayload || message;
        } else if (status === 'ongoing') {
          state.ongoingOrdersLoading = false;
          state.ongoingOrdersError = errorPayload || message;
        } else if (status === 'completed') {
          state.completedOrdersLoading = false;
          state.completedOrdersError = errorPayload || message;
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
  setSearchQuery,
  setFilter,
  removeFilter,
  clearAllFilters,
  clearFilterType,
  setUIFilter,
  clearUIFilters,
  setCurrentPage,
  resetPagination,
  setDateFilter,
  clearDateFilter,
  setTodayFilter
} = ordersSlice.actions;

export default ordersSlice.reducer;
