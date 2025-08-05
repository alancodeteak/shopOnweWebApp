import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    // Security: Obfuscate and minify code (production only)
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log statements
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove console functions
        passes: 2, // Multiple compression passes
      },
      mangle: {
        // Obfuscate variable and function names
        toplevel: true,
        reserved: [
          'React', 'ReactDOM', 'useState', 'useEffect', 'useContext',
          'VITE_API_BASE_URL', 'VITE_ADMIN_KEY', 'import.meta.env'
        ], // Keep React names and env vars for functionality
        safari10: true, // Better Safari compatibility
      },
      format: {
        comments: false, // Remove all comments
        beautify: false, // Don't beautify output
      },
    },
    // Security: Generate random chunk names and split code
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[hash:8].js',
        entryFileNames: 'assets/[hash:8].js',
        assetFileNames: 'assets/[hash:8].[ext]',
        // Split code into smaller chunks for better obfuscation
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['@/utils/secureStorage.js', '@/utils/codeProtection.js', '@/utils/hmac.js'],
          api: ['@/api/axios.jsx'],
          store: ['@/store/index.jsx', '@/store/slices/authSlice.jsx'],
        },
      },
    },
    // Security: Disable source maps in production
    sourcemap: false,
    // Security: Target modern browsers for better optimization
    target: 'es2015',
    // Security: Reduce bundle size
    chunkSizeWarningLimit: 1000,
  },
  // Security: Development server headers
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com; style-src 'self' 'unsafe-inline' https://maps.googleapis.com https://maps.gstatic.com https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://yaadro.com https://*.yaadro.com http://localhost:* https://maps.googleapis.com https://maps.gstatic.com; img-src 'self' data: https: http: blob:;",
    },
  },
  // Security: Environment variables
  define: {
    // Remove development-only code in production
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
});
