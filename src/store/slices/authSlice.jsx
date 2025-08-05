import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { secureGetItem, secureSetItem, secureRemoveItem, initializeSecureStorage, clearSecureStorage } from '../../utils/secureStorage.js';

// Read from localStorage for initial state (fallback for Redux Persist)
// Note: Secure storage will be initialized after login
const initialToken = localStorage.getItem('token');
const initialUser = localStorage.getItem('user');

// Async thunk for secure login
export const loginSuccessSecure = createAsyncThunk(
  'auth/loginSuccessSecure',
  async ({ token, userDetails }, { dispatch }) => {
    try {
      // Initialize secure storage with user data
      await initializeSecureStorage(userDetails);
      
      // Store sensitive data securely
      await secureSetItem('token', token);
      await secureSetItem('user', userDetails);
      
      // Keep legacy storage for backward compatibility
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userDetails));
      
      return { token, userDetails };
    } catch (error) {
      console.error('Failed to initialize secure storage:', error);
      // Fallback to regular localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userDetails));
      return { token, userDetails };
    }
  }
);

// Async thunk for secure user update
export const setUserSecure = createAsyncThunk(
  'auth/setUserSecure',
  async (userDetails, { dispatch }) => {
    try {
      // Update user data in secure storage
      await secureSetItem('user', userDetails);
      // Keep legacy storage for backward compatibility
      localStorage.setItem('user', JSON.stringify(userDetails));
      return userDetails;
    } catch (error) {
      console.error('Failed to update user in secure storage:', error);
      localStorage.setItem('user', JSON.stringify(userDetails));
      return userDetails;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: initialToken || null,
    isAuthenticated: !!initialToken,
    user: initialUser ? JSON.parse(initialUser) : null, // userDetails
  },
  reducers: {
    loginSuccess: (state, action) => {
      const { token, userDetails } = action.payload;
      state.token = token;
      state.user = userDetails;
      state.isAuthenticated = true;
      
      // Legacy storage for backward compatibility
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userDetails));
    },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;

      try {
        // Clear secure storage
        clearSecureStorage();
        // Keep legacy storage for backward compatibility
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (error) {
        console.error('Failed to clear secure storage:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
    clearAllState: (state) => {
      // This action will be used to clear all state when token expires
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;

      try {
        // Clear secure storage
        clearSecureStorage();
        // Keep legacy storage for backward compatibility
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (error) {
        console.error('Failed to clear secure storage:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginSuccessSecure.fulfilled, (state, action) => {
        const { token, userDetails } = action.payload;
        state.token = token;
        state.user = userDetails;
        state.isAuthenticated = true;
      })
      .addCase(setUserSecure.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { loginSuccess, logout, setUser, clearAllState } = authSlice.actions;
export default authSlice.reducer;
