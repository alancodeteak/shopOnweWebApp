import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import store, { persistor } from './store';
import router from './routes';
import PersistenceLoader from './components/PersistenceLoader';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Import security utilities
import './utils/security';

// Import environment utilities for debugging
import { checkEnvironmentVariables } from './utils/envUtils';

import 'react-toastify/dist/ReactToastify.css';
import './index.css';

// Check environment variables on app startup
if (import.meta.env.DEV) {
  checkEnvironmentVariables();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div > {/* TEST: Tailwind should make this background pink */}
        <Provider store={store}>
          <PersistGate loading={<PersistenceLoader />} persistor={persistor}>
            <RouterProvider router={router} />
            <ToastContainer position="top-right" autoClose={3000} />
          </PersistGate>
        </Provider>
      </div>
    </LocalizationProvider>
  </React.StrictMode>
);
