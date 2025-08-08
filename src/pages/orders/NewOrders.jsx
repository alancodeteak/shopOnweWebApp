import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import OrdersTopTabs from '@/components/orders/OrdersTopTabs';
import FilterActionBar from '@/components/orders/FilterActionBar';
import OrdersTable from '@/components/orders/OrdersTable';
import { createPortal } from 'react-dom';
import { ErrorBoundary, NetworkErrorHandler, LoadingSpinner, ErrorMessage } from '@/components';
import { fetchOrdersByStatus } from '@/store/slices/ordersSlice';
import { isNetworkError, isServerError } from '@/utils/errorHandler';

export default function NewOrders() {
  const [itemsModal, setItemsModal] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const shopId = useSelector((s) => s.auth.user?.shopId);
  const orders = useSelector((s) => s.orders.newOrders) || [];
  const loading = useSelector((s) => s.orders.newOrdersLoading);
  const error = useSelector((s) => s.orders.newOrdersError);

  useEffect(() => {
    if (shopId) {
      dispatch(fetchOrdersByStatus({ shopId, status: 'new' }));
    }
  }, [dispatch, shopId]);

  // Reset local page if data length shrinks
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil((orders?.length || 0) / pageSize));
    if (page > totalPages) setPage(1);
  }, [orders, page, pageSize]);

  const visibleOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    const start = (page - 1) * pageSize;
    return orders.slice(start, start + pageSize);
  }, [orders, page]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((orders?.length || 0) / pageSize)), [orders]);

  // Debug fetch check for critical fields on first row
  useEffect(() => {
    if (Array.isArray(orders) && orders.length > 0) {
      const o = orders[0];
      // eslint-disable-next-line no-console
      console.debug('[NewOrders] sample row:', {
        address: o?.address,
        order_at: o?.order_at || o?.created_at,
        assigned_at: o?.assigned_at,
        picked_up_at: o?.picked_up_at || o?.pack_time,
        delivered_at: o?.delivered_at || o?.delivery_time,
      });
    }
  }, [orders]);

  useEffect(() => {
    const handler = (e) => setItemsModal(Array.isArray(e.detail) ? e.detail : []);
    window.addEventListener('orders:showItems', handler);
    return () => window.removeEventListener('orders:showItems', handler);
  }, []);

  return (
    <ErrorBoundary>
      <NetworkErrorHandler>
        <div className="min-h-screen bg-[#F5F7FA] pt-16 pb-24">
          <div className="max-w-[1440px] mx-auto px-6 space-y-4">
            <OrdersTopTabs />
            <FilterActionBar />
            {loading && <LoadingSpinner size="large" message="Loading new orders..." />}
            {error && (
              <ErrorMessage
                message={error}
                isNetworkError={isNetworkError(error)}
                isServerError={isServerError(error)}
                onRetry={() => dispatch(fetchOrdersByStatus({ shopId, status: 'new' }))}
              />
            )}
            {!loading && !error && (
              <OrdersTable 
                orders={visibleOrders} 
                mode="new" 
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                isLoading={loading}
              />
            )}
            {itemsModal && createPortal(
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setItemsModal(null)}>
                <div className="bg-white rounded-lg shadow-lg max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                  <div className="px-4 py-3 border-b flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Order Items</h3>
                    <button className="text-gray-500 hover:text-gray-700" onClick={() => setItemsModal(null)}>✕</button>
                  </div>
                  <div className="p-4 max-h-80 overflow-auto">
                    {Array.isArray(itemsModal) && itemsModal.length > 0 ? (
                      <ul className="divide-y">
                        {itemsModal.map((it, idx) => (
                          <li key={idx} className="py-2 flex justify-between text-sm">
                            <span className="font-medium text-gray-800">{it.item_name || 'Item'}</span>
                            <span className="text-gray-600">{it.quantity} × ₹{it.price} = ₹{it.totalamount}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-gray-500">No items</div>
                    )}
                  </div>
                </div>
              </div>, document.body)
            }
          </div>
        </div>
      </NetworkErrorHandler>
    </ErrorBoundary>
  );
}


