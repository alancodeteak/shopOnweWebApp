import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/axios";
import axios from '@/api/axios';
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
      if (status === 'completed') {
        // API returns { data: Array, ... }
        return {
          data: Array.isArray(res.data.data) ? res.data.data : [],
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

// Create order
export const createOrder = createAsyncThunk(
  "orders/create",
  async (orderPayload, thunkAPI) => {
    try {
      const res = await API.post(`/orders/create`, orderPayload);
      return res.data.data;
    } catch (err) {
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
      const response = await axios.put(
        `/customer-order-address/`,
        { customer_name, customer_phone_number, address }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update address');
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
      const response = await axios.put(
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
      });
  },
});

export const { clearCurrentOrder, clearCreatedOrder, updateUrgencyLocal } =
  ordersSlice.actions;

export default ordersSlice.reducer;
