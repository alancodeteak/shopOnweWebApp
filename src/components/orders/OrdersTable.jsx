import React from 'react';
import { useNavigate } from 'react-router-dom';

function StatusPill({ status }) {
  const lower = String(status || '').toLowerCase();
  let bg = '#E5E7EB';
  if (lower === 'packed' || lower === 'pending') bg = '#F97316';
  else if (lower.includes('verify') || lower === 'delivered' || lower === 'completed') bg = '#16A34A';
  else if (lower === 'assigned' || lower === 'picked up' || lower === 'out for delivery') bg = '#F59E0B';
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-white text-[12px] font-semibold" style={{ background: bg }}>
      {status || '-'}
    </span>
  );
}

function formatDate(value) {
  if (!value) return '-';
  try {
    const d = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString();
  } catch {
    return '-';
  }
}

function getAgentDisplay(order) {
  if (order?.deliveryPartner?.first_name) {
    const first = order.deliveryPartner.first_name || '';
    const last = order.deliveryPartner.last_name || '';
    const full = `${first} ${last}`.trim();
    if (full) return full;
  }
  const dp = order?.delivery_partner;
  if (dp && typeof dp === 'object') {
    const name = dp.name
      || `${dp.first_name || ''} ${dp.last_name || ''}`.trim()
      || dp.phone_number
      || (dp.id ? `#${dp.id}` : '')
      || (dp.delivery_partner_id ? `#${dp.delivery_partner_id}` : '');
    if (name) return String(name);
  }
  if (typeof order?.delivery_partner_name === 'string' && order.delivery_partner_name) return order.delivery_partner_name;
  if (typeof order?.delivery_partner === 'string' && order.delivery_partner) return order.delivery_partner;
  if (order?.delivery_partner_id) return `#${order.delivery_partner_id}`;
  return '-';
}

function buildCondensedPages(currentPage, totalPages) {
  if (!totalPages || totalPages < 1) return [];
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = [];
  const add = (p) => pages.push(p);
  add(1);
  if (currentPage > 3) add('...');
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let p = start; p <= end; p++) add(p);
  if (currentPage < totalPages - 2) add('...');
  add(totalPages);
  return pages;
}

export default function OrdersTable({ orders, onAssign, onVerify, onEdit, mode = 'all', currentPage, totalPages, onPageChange, isLoading }) {
  const navigate = useNavigate();
  const showPaymentMode = !(mode === 'new' || mode === 'ongoing');
  const showPagination = typeof totalPages === 'number' && totalPages > 1 && typeof onPageChange === 'function';
  const pages = showPagination ? buildCondensedPages(currentPage || 1, totalPages) : [];
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-[#F9FAFB]">
            <tr className="text-[14px] text-[#374151] h-12">
              <th className="px-3 md:px-4 text-left w-8">#</th>
              <th className="px-3 md:px-4 text-left w-32">Name</th>
              <th className="px-3 md:px-4 text-left w-44 hidden md:table-cell">Address</th>
              <th className="px-3 md:px-4 text-left w-40 hidden md:table-cell">Order Time</th>
              {mode !== 'new' && (<th className="px-3 md:px-4 text-left w-40 hidden md:table-cell">Pack Time</th>)}
              {mode !== 'new' && (<th className="px-3 md:px-4 text-left w-40 hidden md:table-cell">Assign Time</th>)}
              {mode !== 'new' && (<th className="px-3 md:px-4 text-left w-28 hidden md:table-cell">Agent</th>)}
              {mode !== 'new' && (<th className="px-3 md:px-4 text-left w-40 hidden md:table-cell">Delivery Time</th>)}
              <th className="px-3 md:px-4 text-left w-28">Items</th>
              {showPaymentMode && (<th className="px-3 md:px-4 text-left w-36 hidden md:table-cell">Payment Mode</th>)}
              <th className="px-3 md:px-4 text-right w-24">Amount</th>
              <th className="px-3 md:px-4 text-left w-28">Status</th>
              <th className="px-3 md:px-4 text-left w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(orders) && orders.length > 0 ? (
              orders.map((order, index) => {
                const orderTime =  order.created_at;
                const packTime = order.picked_up_at ;
                const assignTime = order.assigned_at;
                const deliveryTime = order.delivered_at ;
                const addressText = order.address
                const itemsArray = Array.isArray(order.items)
                  ? order.items
                  : (Array.isArray(order.order_items) ? order.order_items : null);
                const agentName = getAgentDisplay(order);

                const statusLower = String(order.order_status).toLowerCase();
                const canVerify = ['assigned', 'picked up', 'out for delivery', 'delivered'].includes(statusLower);

                return (
                  <tr key={order.order_id || index} className="h-14 text-[14px] text-[#1A1A1A] border-t">
                    <td className="px-3 md:px-4">{index + 1}</td>
                    <td className="px-3 md:px-4 whitespace-nowrap max-w-[8rem] truncate">{order.customer_name || '-'}</td>
                    <td className="px-3 md:px-4 max-w-xs truncate hidden md:table-cell">{addressText || '-'}</td>
                    <td className="px-3 md:px-4 hidden md:table-cell">{formatDate(orderTime)}</td>
                    {mode !== 'new' && (<td className="px-3 md:px-4 hidden md:table-cell">{formatDate(packTime)}</td>)}
                    {mode !== 'new' && (<td className="px-3 md:px-4 hidden md:table-cell">{formatDate(assignTime)}</td>)}
                    {mode !== 'new' && (<td className="px-3 md:px-4 hidden md:table-cell">{agentName}</td>)}
                    {mode !== 'new' && (<td className="px-3 md:px-4 hidden md:table-cell">{formatDate(deliveryTime)}</td>)}
                    <td className="px-3 md:px-4">
                      {Array.isArray(itemsArray) ? (
                        <button
                          onClick={() => window.dispatchEvent(new CustomEvent('orders:showItems', { detail: itemsArray }))}
                          className="px-2 py-1 text-[12px] rounded-md border text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          {itemsArray.length} item{itemsArray.length === 1 ? '' : 's'}
                        </button>
                      ) : '-'}
                    </td>
                    {showPaymentMode && (<td className="px-3 md:px-4 hidden md:table-cell">{order.payment_mode || '-'}</td>)}
                    <td className="px-3 md:px-4 text-right">{order.total_amount != null ? `₹${order.total_amount}` : '-'}</td>
                    <td className="px-3 md:px-4"><StatusPill status={order.order_status} /></td>
                    <td className="px-3 md:px-4">
                      <div className="flex items-center gap-2">
                        {String(order.order_status).toLowerCase() === 'pending' && (
                          <button
                            onClick={() => (onAssign ? onAssign(order) : navigate(`/orders/assign/${order.order_id}`))}
                            className="px-3 py-1.5 rounded-md text-white text-[14px] font-medium"
                            style={{ background: '#DC2626' }}
                          >
                            Assign
                          </button>
                        )}
                        {canVerify && (
                          <button
                            onClick={() => onVerify && onVerify(order)}
                            className="px-3 py-1.5 rounded-md text-white text-[14px] font-medium"
                            style={{ background: '#16A34A' }}
                          >
                            Verify
                          </button>
                        )}
                        {mode !== 'ongoing' && (
                          <button
                            onClick={() => (onEdit ? onEdit(order) : navigate(`/orders/${order.order_id}`))}
                            className="px-3 py-1.5 rounded-md text-white text-[14px] font-bold hover:brightness-95"
                            style={{ background: '#2C7BFE' }}
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/orders/${order.order_id}`)}
                          className="px-3 py-1.5 rounded-md text-blue-600 text-[14px] font-medium border border-blue-200 hover:bg-blue-50"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={12} className="h-24 text-center text-gray-500">
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showPagination && (
        <div className="flex justify-center gap-2 p-3 border-t bg-white">
          {pages.map((p, idx) =>
            p === '...'
              ? (
                  <span key={`dots-${idx}`} className="px-2 py-1.5 text-gray-400 select-none">…</span>
                )
              : (
                  <button
                    key={p}
                    onClick={() => (p !== currentPage ? onPageChange(p) : undefined)}
                    disabled={isLoading}
                    className={`px-3 py-1.5 rounded-md text-sm min-w-[36px] ${
                      currentPage === p ? 'bg-blue-600 text-white' : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {p}
                  </button>
                )
          )}
        </div>
      )}
    </div>
  );
}


