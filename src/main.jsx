import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import store from './store';
import router from './routes';

import 'react-toastify/dist/ReactToastify.css';
import './index.css';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div > {/* TEST: Tailwind should make this background pink */}
      <Provider store={store}>
        <RouterProvider router={router} />
        <ToastContainer position="top-right" autoClose={3000} />
      </Provider>
    </div>
  </React.StrictMode>
);
