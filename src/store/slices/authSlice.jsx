import { createSlice } from '@reduxjs/toolkit';

// Read from localStorage
const initialToken = localStorage.getItem('token');
const initialUser = localStorage.getItem('user');

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

      // Persist to localStorage
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

      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { loginSuccess, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
