import { Phone, Copy, CheckCircle, XCircle, Droplets } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Card from '@/components/Card';
import StatusBadge from '@/components/StatusBadge';
import { isWaterNeeded } from '@/utils/orderUtils';

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

  const getStatusText = () => {
    // Return the actual order status instead of hardcoding "Assigned"
    return order.order_status;
  };

  return (
    <Card
      onClick={handleClick}
      className="p-3 sm:p-4 mb-3 sm:mb-4 relative w-full"
    >
      {/* Top row */}
      <div className="flex justify-between items-center text-xs sm:text-sm font-medium">
        <div className="flex items-center gap-2">
          <span className="text-black">Bill No: {order.bill_no}</span>
          <button onClick={copyBillNo} className="p-1 rounded-full hover:bg-gray-100">
            <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 hover:text-blue-600 transition" />
          </button>
        </div>
        <div className="flex flex-col items-end gap-1 min-w-[80px] sm:min-w-[90px]">
          <StatusBadge status={getStatusText()} size="sm" />
         
         
          {isWaterNeeded(order.water) && (
            <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
              <Droplets className="w-3 h-3" />
              <span>Water</span>
            </div>
          )}
        </div>
      </div>
      {/* Middle */}
      <div className="mt-2 sm:mt-2">
        <h2 className="text-lg sm:text-xl font-bold text-black">{order.customer_name || 'test'}</h2>
        <p className="text-xs sm:text-sm text-gray-500">
          {new Date(order.created_at).toLocaleString()}
        </p>
      </div>
      {/* Call icon */}
      <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toast.info('Calling feature coming soon!');
          }}
          className="bg-green-100 text-green-600 p-1.5 sm:p-2 rounded-full hover:bg-green-200 transition"
        >
          <Phone size={14} className="sm:w-4 sm:h-4" />
        </button>
      </div>
      {/* Bottom */}
      <button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold py-2 px-3 sm:px-4 rounded-lg mt-3 sm:mt-4 transition"
      >
       Order Details →
      </button>
    </Card>
  );
}
