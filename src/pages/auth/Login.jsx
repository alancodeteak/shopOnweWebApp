// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { loginSuccess, setUser } from '@/store/slices/authSlice';
import API from '@/api/axios';
import { setHmacSecret } from '@/utils/hmac.js';
import { Eye, EyeOff } from 'lucide-react';
import { X, Copy } from 'lucide-react';
import { ErrorBoundary, NetworkErrorHandler } from '@/components';
import SupportModal from '@/components/SupportModal';

export default function Login() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [copied, setCopied] = useState('');

  const handleCopy = (value, key) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(''), 1200);
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user was redirected due to token expiration
  useEffect(() => {
    // Check if there's a token expiration indicator in the URL or localStorage
    const wasTokenExpired = sessionStorage.getItem('tokenExpired');
    if (wasTokenExpired) {
      toast.info('Your session has expired. Please log in again.');
      sessionStorage.removeItem('tokenExpired');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!userId || !password) {
      toast.error('Please enter both user ID and password.');
      return;
    }
    try {
      setLoading(true);
      const response = await API.post('/shopowner/auth/login', {
        userId,
        password,
      });
      const token = response?.data?.data?.token;
      const user = response?.data?.data?.userDetails;
      // Try multiple possible locations for HMAC secret
      const hmacSecret = response?.data?.data?.userDetails?.hmac_secret || 
                        response?.data?.data?.hmac_secret ||
                        response?.data?.data?.userDetails?.hmacSecret ||
                        response?.data?.data?.hmacSecret;
      
      if (!token || !user) {
        toast.error('Invalid login response.');
        return;
      }
      
      // Store HMAC secret if provided
      if (hmacSecret) {
        setHmacSecret(hmacSecret);
        if (import.meta.env.DEV) {
          // Store in localStorage for debugging
          localStorage.setItem('debug_hmac_secret', hmacSecret);
          localStorage.setItem('debug_hmac_secret_length', hmacSecret.length.toString());
          localStorage.setItem('debug_login_response', JSON.stringify(response?.data?.data));
        }
      } else if (import.meta.env.DEV) {
        // Store debug info even when no secret
        localStorage.setItem('debug_no_hmac_secret', 'true');
        localStorage.setItem('debug_user_fields', JSON.stringify(Object.keys(user || {})));
        localStorage.setItem('debug_login_response', JSON.stringify(response?.data?.data));
      }
      
      // Normalize to camelCase for frontend consistency
      const normalizedUser = {
        id: user.id,
        name: user.name,
        role: user.role,
        shopId: user.shop_id, // ✅ normalize shop_id to shopId
        isAutomated: user.is_automated,
        autoAssigned: user.auto_assigned,
      };
      dispatch(loginSuccess({ token }));
      dispatch(setUser(normalizedUser));
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <NetworkErrorHandler>
        <div className="min-h-screen flex flex-col justify-between bg-blue-500">
      {/* Top Section: Logo and Illustration */}
      <div className="flex flex-col items-center pt-12 pb-4">
        {/* Yaadro Logo */}
        <img src="assets/Yadro-logo.png" alt="Yaadro Logo" className="w-32 h-32 object-contain mb-2" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.08))' }} />
      </div>
      {/* Login Card */}
      <div className="w-full flex-1 flex flex-col justify-end">
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-t-3xl shadow-lg px-6 pt-6 pb-6 w-full max-w-md mx-auto flex flex-col gap-3"
        >
          <h2 className="text-xl font-bold text-center mb-1 text-black">Log in</h2>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-500">Shop Owner ID</label>
            <input
              type="text"
              placeholder="Your Id"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full rounded-lg px-3 py-2 shadow-sm text-black bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-500">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="**********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg px-3 py-2 shadow-sm text-black bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-400 hover:text-blue-500"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex justify-end mt-1">
              <button
                type="button"
                className="text-xs text-blue-500 hover:underline focus:outline-none"
                onClick={() => setShowForgotModal(true)}
              >
                Forgot Password?
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-bold py-2 rounded-lg mt-2 hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
          {/* Powered by Codeteak inside card */}
          <div className="flex flex-col items-center mt-4 mb-1">
            <span className="text-xs text-blue-500 mb-1">Powered by</span>
            <img src="/assets/codeteak-logo.png" alt="Codeteak Logo" className="h-4 object-contain" />
          </div>
        </form>
      </div>
      {/* Forgot Password Modal */}
      <SupportModal open={showForgotModal} onClose={() => setShowForgotModal(false)} />
        </div>
      </NetworkErrorHandler>
    </ErrorBoundary>
  );
}
