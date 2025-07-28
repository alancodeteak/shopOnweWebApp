import { Phone, Copy, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function OrderCard({ order, fromOngoing, paymentVerifiedLabel, showPaymentStatusBadge }) {
  const navigate = useNavigate();

  const copyBillNo = (e) => {
    e.stopPropagation(); // Prevent navigation when clicking the icon
    navigator.clipboard.writeText(order.bill_no);
    toast.success(`Bill No. ${order.bill_no} copied!`);
  };

  const handleClick = () => {
    // For "Pending" orders, go to the assign page. Otherwise, go to details.
    if (order.order_status === 'Pending') {
      navigate(`/orders/assign/${order.order_id}`);
    } else {
      navigate(`/orders/${order.order_id}`, { state: { fromOngoing } });
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white border shadow-md rounded-xl p-4 mb-4 relative w-full cursor-pointer hover:shadow-lg transition-shadow"
    >
      {/* Top row */}
      <div className="flex justify-between items-center text-sm font-medium">
        <div className="flex items-center gap-2">
          <span className="text-black">Bill No: {order.bill_no}</span>
          <button onClick={copyBillNo} className="p-1 rounded-full hover:bg-gray-100">
            <Copy className="w-4 h-4 text-gray-500 hover:text-blue-600 transition" />
          </button>
        </div>
        <div className="flex flex-col items-end gap-1 min-w-[90px]">
          <span className={
            order.order_status === 'Completed' || order.order_status === 'Delivered'
              ? 'bg-green-100 text-green-600 text-xs px-2 py-1 rounded'
              : 'bg-red-100 text-red-600 text-xs px-2 py-1 rounded'
          }>
            {order.order_status === 'Completed' || order.order_status === 'Delivered' ? 'Completed' : 'Assigned'}
          </span>
          {/* Payment Verified/Not Verified badge for completed orders */}
          {/* {showPaymentStatusBadge && (
            paymentVerifiedLabel ? (
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10 shadow mt-1">
                Verified
              </span>
            ) : (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10 shadow mt-1">
                Not Verified
              </span>
            )
          )} */}
        </div>
      </div>
      {/* Middle */}
      <div className="mt-2">
        <h2 className="text-xl font-bold text-black">{order.customer_name || 'test'}</h2>
        <p className="text-sm text-gray-500">
          {new Date(order.created_at).toLocaleString()}
        </p>
      </div>
      {/* Call icon */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log('Calling...');
            toast.info('Calling feature coming soon!');
          }}
          className="bg-green-100 text-green-600 p-2 rounded-full hover:bg-green-200 transition"
        >
          <Phone size={16} />
        </button>
      </div>
      {/* Bottom */}
      <button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg mt-4 transition"
      >
       Order Details →
      </button>
    </div>
  );
}
