// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { loginSuccess, setUser } from '@/store/slices/authSlice';
import API from '@/api/axios';
import { Eye, EyeOff } from 'lucide-react';
import { X, Copy } from 'lucide-react';

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
      if (!token || !user) {
        toast.error('Invalid login response.');
        return;
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
    <div className="min-h-screen flex flex-col justify-between bg-blue-500">
      {/* Top Section: Logo and Illustration */}
      <div className="flex flex-col items-center pt-12 pb-4">
        {/* Yaadro Logo */}
        <img src="/assets/Yadro-logo.png" alt="Yaadro Logo" className="w-32 h-32 object-contain mb-2" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.08))' }} />
      </div>
      {/* Login Card */}
      <div className="w-full flex-1 flex flex-col justify-end">
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-t-3xl shadow-lg px-6 pt-8 pb-8 w-full max-w-md mx-auto flex flex-col gap-4"
          style={{ minHeight: '55vh' }}
        >
          <h2 className="text-xl font-bold text-center mb-2 text-black">Log in</h2>
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
          <div className="flex flex-col items-center mt-8 mb-2">
            <span className="text-xs text-blue-500 mb-1">Powered by</span>
            <img src="/assets/codeteak-logo.png" alt="Codeteak Logo" className="h-4 object-contain mt-1 md:mt-2" />
          </div>
        </form>
      </div>
      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-xs mx-auto relative animate-fade-in">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
              onClick={() => setShowForgotModal(false)}
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold text-blue-700 mb-2 text-center">Forgot Password?</h2>
            <p className="text-gray-700 text-sm mb-4 text-center">Please contact the admin section.</p>
            <div className="bg-blue-50 rounded-lg p-3 mb-2">
              <div className="text-xs text-blue-700 font-semibold mb-1">Email</div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-blue-700">info@codeteak.com</span>
                <button
                  className="p-1 rounded hover:bg-blue-100 transition"
                  onClick={() => handleCopy('info@codeteak.com', 'info')}
                  title="Copy Email"
                >
                  <Copy className="w-4 h-4 text-blue-500" />
                </button>
                {copied === 'info' && <span className="text-green-600 text-xs ml-1">Copied!</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-700">yadro@codeteak.com</span>
                <button
                  className="p-1 rounded hover:bg-blue-100 transition"
                  onClick={() => handleCopy('yadro@codeteak.com', 'yaadro')}
                  title="Copy Email"
                >
                  <Copy className="w-4 h-4 text-blue-500" />
                </button>
                {copied === 'yaadro' && <span className="text-green-600 text-xs ml-1">Copied!</span>}
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-xs text-blue-700 font-semibold mb-1">Phone</div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-700">9995203149</span>
                <button
                  className="p-1 rounded hover:bg-blue-100 transition"
                  onClick={() => handleCopy('9995203149', 'phone')}
                  title="Copy Phone"
                >
                  <Copy className="w-4 h-4 text-blue-500" />
                </button>
                {copied === 'phone' && <span className="text-green-600 text-xs ml-1">Copied!</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
