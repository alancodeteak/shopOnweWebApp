import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchOrderById, verifyPayment, updateCustomerAddress, updateOrderStatusByShopOwner } from '@/store/slices/ordersSlice';
import { fetchPartnerById } from '@/store/slices/deliveryPartnerSlice';
import {
  ArrowLeft,
  RefreshCw,
  Clock,
  FileText,
  CreditCard,
  CheckCircle,
  User,
  Phone,
  MapPin,
  Truck,
  AlertTriangle,
} from 'lucide-react';
import AppSpinner from '@/components/AppSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import toast from 'react-hot-toast';
import PageHeader from '@/components/PageHeader';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { isWaterNeeded, getWaterNeedText } from '@/utils/orderUtils';

const DetailRow = ({ icon: Icon, label, value, badge }) => (
  <div className="flex items-start gap-4 py-2">
    <Icon className="w-5 h-5 text-purple-400 mt-1" />
    <div className="flex-1">
      <p className="text-xs text-gray-500">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-gray-800">{value}</p>
        {badge}
      </div>
    </div>
  </div>
);

const OrderTimeline = ({ order }) => (
  <div className="bg-white rounded-xl shadow p-4 my-3">
    <div className="relative flex flex-col gap-6 pl-2">
      {/* Order Created */}
      <div className="flex items-center gap-3 relative">
        <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-white z-10">
          <Clock size={20} className="text-yellow-700" />
        </div>
        <div>
          <div className="font-semibold text-sm text-black">Order Created</div>
          <div className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</div>
        </div>
        {/* Vertical line from Created to Delivered */}
        {order.delivered_at && (
          <div className="absolute left-4 top-8 w-0.5 h-8 bg-purple-300 z-0"></div>
        )}
      </div>
      {/* Order Delivered */}
      {order.delivered_at && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
            <CheckCircle size={20} />
          </div>
          <div>
            <div className="font-semibold text-sm text-black">Order Delivered</div>
            <div className="text-xs text-gray-500">{new Date(order.delivered_at).toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const fromOngoing = location.state?.fromOngoing;

  // All hooks must be at the top level, before any conditionals or returns
  const order = useSelector((state) => state.orders.current);
  const loading = useSelector((state) => state.orders.loading);
  const error = useSelector((state) => state.orders.error);
  const partner = useSelector((state) => state.deliveryPartners.current);
  const partnerLoading = useSelector((state) => state.deliveryPartners.loading);
  const partnerList = useSelector((state) => state.deliveryPartners.list);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ customer_name: '', customer_phone_number: '', address: '' });
  const updateLoading = useSelector((state) => state.orders.updateCustomerAddressLoading);
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const updateOrderStatusLoading = useSelector((state) => state.orders.updateOrderStatusLoading);
  const [mapExpanded, setMapExpanded] = useState(false);

  // Google Maps setup
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
  });

  // Example: fallback coordinates if not available
  const defaultCoords = { lat: 12.8916, lng: 77.6051 };
  // Try to get coordinates from order, else fallback
  const deliveryCoords = order?.delivery_lat && order?.delivery_lng
    ? { lat: Number(order.delivery_lat), lng: Number(order.delivery_lng) }
    : defaultCoords;

  // Only show status update card for new/ongoing orders
  const canUpdateStatus = ['pending', 'assigned', 'picked up', 'out for delivery'].includes(String(order?.order_status).toLowerCase());

  // Prefer order.deliveryPartner, fallback to fetched partner
  const partnerData = order?.deliveryPartner || partner;
  // Fallback: find partner in deliveryPartners.list if only id is present
  let fallbackPartner = null;
  if (order && order.delivery_partner_id && (!partnerData?.name || !partnerData?.phone)) {
    fallbackPartner = partnerList.find(
      (p) => p.delivery_partner_id === order.delivery_partner_id || p.id === order.delivery_partner_id
    );
  }

  // Robust check for payment verification, paid status, and completed/delivered order
  const isPaymentVerified = order?.payment_verification === true || order?.payment_verification === 'true';
  const isPaid = String(order?.payment_status).toLowerCase() === 'paid';
  const isOrderCompletedOrDelivered = ['completed', 'delivered'].includes(String(order?.order_status).toLowerCase());

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(id));
    }
  }, [dispatch, id]);

  // Debug: log the order object and delivery_partner_id
  useEffect(() => {
    if (order) {
      // eslint-disable-next-line no-console
      console.log('Order details loaded:', order);
      // eslint-disable-next-line no-console
      console.log('delivery_partner_id:', order.delivery_partner_id);
      // eslint-disable-next-line no-console
      console.log('payment_status:', order.payment_status, 'payment_verification:', order.payment_verification, 'isPaid:', isPaid, 'isPaymentVerified:', isPaymentVerified);
    }
  }, [order]);

  // Debug: log the fetched partner object
  useEffect(() => {
    if (partner) {
      // eslint-disable-next-line no-console
      console.log('Fetched partner:', partner);
    }
  }, [partner]);

  // Fetch delivery partner details if needed
  useEffect(() => {
    if (order && order.delivery_partner_id && !order.deliveryPartner) {
      dispatch(fetchPartnerById(order.delivery_partner_id));
    }
  }, [dispatch, order]);

  const handleVerifyPayment = async () => {
    await dispatch(verifyPayment(id));
    // Refetch order to get updated payment_verification status
    dispatch(fetchOrderById(id));
  };

  const handleCallPartner = () => {
    const partnerData = order?.deliveryPartner || partner;
    if (partnerData?.phone) {
      window.open(`tel:${partnerData.phone}`);
    }
  };

  const handleOpenModal = () => {
    setForm({
      customer_name: order.customer_name,
      customer_phone_number: order.customer_phone_number,
      address: order.address,
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);
  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Log the full body section before dispatch
    console.log('Updating customer address with body:', form);
    console.log('Address being sent:', form.address);
    try {
      await dispatch(updateCustomerAddress(form)).unwrap();
      toast.success('Customer address updated!');
      handleCloseModal();
      dispatch(fetchOrderById(id));
    } catch (err) {
      toast.error(err || 'Failed to update address');
    }
  };

  const handleMarkDelivered = async () => {
    try {
      await dispatch(updateOrderStatusByShopOwner({ order_id: order.order_id, status: 'Delivered' })).unwrap();
      toast.success('Order marked as Delivered!');
      dispatch(fetchOrderById(id));
    } catch (err) {
      toast.error(err || 'Failed to update order status');
    }
  };

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      toast.error('Please provide a cancellation reason.');
      return;
    }
    try {
      await dispatch(updateOrderStatusByShopOwner({ order_id: order.order_id, status: 'Cancelled', cancellation_reason: cancelReason })).unwrap();
      toast.success('Order cancelled!');
      setShowCancelReason(false);
      setCancelReason('');
      dispatch(fetchOrderById(id));
    } catch (err) {
      toast.error(err || 'Failed to cancel order');
    }
  };

  if (loading && !order) return <AppSpinner label="Loading Order Details..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!order) return <div>No order details found.</div>;

  return (
    <div className="bg-pink-50 min-h-screen pt-16 pb-24 w-full">
      <div className="max-w-screen-md mx-auto px-4">
        <PageHeader
          title="Order Details"
          onBack={() => navigate(-1)}
          onRefresh={() => dispatch(fetchOrderById(id))}
          isLoading={loading}
        />
      </div>
      <main className="w-full max-w-xs sm:max-w-screen-md mx-auto p-2 sm:p-4 space-y-6 sm:space-y-8 pb-32">
        {/* Map Section */}
        {fromOngoing && (
          <div className="mb-2 sm:mb-4">
            <div className="flex justify-end mb-2">
              <button
                className="z-20 bg-white shadow rounded-full px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 transition"
                onClick={() => setMapExpanded((v) => !v)}
                style={{ minWidth: 120 }}
              >
                {mapExpanded ? 'Hide Map' : 'Show Map'}
              </button>
            </div>
            <div
              className={`rounded-3xl shadow-lg bg-white overflow-hidden w-full transition-all duration-500 ${mapExpanded ? 'h-80' : 'h-40'}`}
              style={{ minHeight: mapExpanded ? 320 : 160, padding: 0, margin: 0 }}
            >
              {isLoaded && (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={deliveryCoords}
                  zoom={16}
                  options={{
                    fullscreenControl: false,
                    mapTypeControl: false,
                    streetViewControl: false,
                  }}
                >
                  <Marker position={deliveryCoords} />
                </GoogleMap>
              )}
              {!isLoaded && (
                <div className="flex items-center justify-center h-full">Loading map...</div>
              )}
            </div>
          </div>
        )}
        {/* Delivery Partner Details Section */}
        {fromOngoing && (
          <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm sm:text-base w-full max-w-xl mx-auto border border-blue-100 mb-2 sm:mb-4">
            <div className="bg-purple-100 rounded-full p-2 sm:p-3 flex items-center justify-center mb-2 sm:mb-0">
              <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-purple-500" />
            </div>
            <div className="flex-1 w-full">
              <div className="font-semibold text-base sm:text-lg text-gray-800">{partnerData?.first_name} {partnerData?.last_name}</div>
              <div className="text-xs sm:text-sm text-gray-500">ID: {partnerData?.delivery_partner_id}</div>
              <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                <Phone className="w-4 h-4 inline-block mr-1 text-purple-400" />
                {partnerData?.phone1}
              </div>
            </div>
            <div className="w-full sm:w-auto flex justify-end sm:justify-center">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-xs sm:text-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Active
              </span>
            </div>
          </div>
        )}
        
        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow p-4 sm:p-5">
          <h2 className="text-base sm:text-lg font-bold text-black mb-4 flex items-center gap-3">
            <FileText className="text-blue-500" /> Order Summary
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">Order ID</span>
              <span className="font-semibold">#{order.order_id}</span>
            </div>
            {/* Cancelled label */}
            {String(order.order_status).toLowerCase() === 'cancelled' && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold">CANCELLED</span>
              </div>
            )}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">Bill Number</span>
              <span className="font-semibold">{order.bill_no}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">Urgency:</span>
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${order.urgency === 'Urgent' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{order.urgency?.toUpperCase()}</span>
            </div>
            {/* Debug: Log water value */}
            {console.log('🌊 OrderDetails water:', order.water, typeof order.water, 'isWaterNeeded:', isWaterNeeded(order.water), 'Order ID:', order.order_id)}
            {console.log('🌊 Full order object:', order)}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">Water Need:</span>
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                isWaterNeeded(order.water) 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {getWaterNeedText(order.water)}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2 mb-2 w-full">
              <span className="text-xs text-gray-500">Order Status</span>
              <span className={`text-xs sm:text-xs px-2 py-1 rounded-full font-semibold mt-1 sm:mt-0 ${order.order_status === 'Delivered' ? 'bg-green-100 text-green-700' : order.order_status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'} w-full sm:w-auto max-w-full sm:max-w-xs break-words whitespace-normal text-center`}>{order.order_status}</span>
            </div>
            <div className="mb-2">
              <span className="text-xs text-gray-500">Order Timeline</span>
              <OrderTimeline order={order} />
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold text-gray-700">Total Amount</span>
              <span className="font-bold text-xl text-black">₹{order.total_amount}</span>
            </div>
            <a href={order.bill_image} className="text-blue-600 font-semibold underline mt-2 block">View Bill Image</a>
          </div>
        </div>

        {/* Order Items Card */}
        {Array.isArray(order.items) && order.items.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="text-lg font-bold text-black mb-4 flex items-center gap-3">
              <span className="bg-blue-500 rounded-full p-1 flex items-center justify-center"><FileText className="text-white" /></span> Order Items
            </h2>
            <div className="divide-y divide-blue-50">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-semibold text-black">{item.item_name}</div>
                    <div className="text-xs text-black">Qty: {item.quantity} × ₹{item.price}</div>
                  </div>
                  <div className="font-bold text-blue-600 text-base">₹{item.totalamount}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Instructions Card */}
        {order.special_instructions && (
          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="text-lg font-bold text-black mb-4 flex items-center gap-3">
              <span className="bg-orange-500 rounded-full p-1 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span> Special Instructions
            </h2>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-gray-800 leading-relaxed">{order.special_instructions}</p>
            </div>
          </div>
        )}

        {/* Payment Information */}
        <div className="bg-white rounded-2xl shadow p-4 sm:p-5">
          <h2 className="text-base sm:text-lg font-bold text-black mb-4 flex items-center gap-3"><CreditCard className="text-blue-500" /> Payment Information</h2>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-black">Payment Mode</span>
            <span className="font-semibold text-black">{order.payment_mode}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-black">Payment Status</span>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.payment_status}</span>
          </div>
          {order.payment_proof && (
            <div>
              <p className="text-xs text-black mt-4 mb-2">Payment Proof</p>
              <img src={order.payment_proof} alt="Payment Proof" className="rounded-lg w-full object-cover max-h-48" />
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-black">Payment Verified</span>
            <span className="font-semibold text-black">{order.payment_verification ? 'Yes' : 'No'}</span>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white rounded-2xl shadow p-4 sm:p-5">
          <h2 className="text-base sm:text-lg font-bold text-black mb-4 flex items-center gap-3"><span className="bg-blue-500 rounded-full p-1 flex items-center justify-center"><User className="text-white" /></span> Customer Details</h2>
          <div className="space-y-2">
            <div className="flex flex-row items-center gap-2 w-full">
              <User className="w-5 h-5 text-blue-500 bg-blue-500 rounded-full p-1 text-white flex-shrink-0" />
              <span className="text-xs text-black flex-shrink-0">Name</span>
              <span className="font-semibold text-black text-xs sm:text-sm ml-auto truncate max-w-[60%] sm:max-w-xs text-right">{order.customer_name}</span>
            </div>
            <div className="flex flex-row items-center gap-2 w-full">
              <Phone className="w-5 h-5 text-blue-500 bg-blue-500 rounded-full p-1 text-white flex-shrink-0" />
              <span className="text-xs text-black flex-shrink-0">Phone</span>
              <span className="font-semibold text-black text-xs sm:text-sm ml-auto truncate max-w-[60%] sm:max-w-xs text-right">{order.customer_phone_number}</span>
            </div>
            <div className="flex flex-row items-center gap-2 w-full">
              <MapPin className="w-5 h-5 text-blue-500 bg-blue-500 rounded-full p-1 text-white flex-shrink-0" />
              <span className="text-xs text-black flex-shrink-0">Address</span>
              <span className="font-semibold text-black text-xs sm:text-sm ml-auto truncate max-w-[60%] sm:max-w-xs text-right">{order.address}</span>
            </div>
          </div>
          <button
            className="mt-4 w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition"
            onClick={handleOpenModal}
          >
            Update Customer Address
          </button>
        </div>
        {/* Modal for updating address */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-md mx-auto relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={handleCloseModal}>&times;</button>
              <h2 className="text-lg font-bold text-blue-700 mb-4">Update Customer Address</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Customer Name</label>
                  <input type="text" name="customer_name" value={form.customer_name} onChange={handleFormChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Phone Number</label>
                  <input type="text" name="customer_phone_number" value={form.customer_phone_number} onChange={handleFormChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Address</label>
                  <textarea name="address" value={form.address} onChange={handleFormChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400" required />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg mt-2 hover:bg-blue-700 transition" disabled={updateLoading}>
                  {updateLoading ? 'Updating...' : 'Update Address'}
                </button>
              </form>
            </div>
          </div>
        )}
   
        {/* Delivery Partner Details */}
        <div className="bg-white rounded-2xl shadow p-4 sm:p-5">
          <h2 className="text-base sm:text-lg font-bold text-black mb-4 flex items-center gap-3"><span className="bg-blue-500 rounded-full p-1 flex items-center justify-center"><Truck className="text-white" /></span> Delivery Partner Details</h2>
          {partnerLoading ? (
            <AppSpinner label="Loading partner..." />
          ) : partnerData ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-blue-500 bg-blue-500 rounded-full p-1 text-white" />
                <span className="text-xs text-black">Name</span>
                <span className="font-semibold text-black">{partnerData.first_name }  {partnerData.last_name }</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-5 h-5 text-blue-500 bg-blue-500 rounded-full p-1 text-white" />
                <span className="text-xs text-black">Phone</span>
                <span className="font-semibold text-black">{partnerData.phone1 }</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-blue-500 bg-blue-500 rounded-full p-1 text-white" />
                <span className="text-xs text-black">Delivery Partner ID</span>
                <span className="font-semibold text-black">{partnerData.delivery_partner_id}</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 bg-red-50 rounded-xl border border-red-200 animate-fade-in">
              <AlertTriangle className="w-10 h-10 text-red-400 mb-2 animate-pulse" />
              <div className="font-semibold text-red-700 text-base mb-1">No Delivery Partner Available</div>
              <div className="text-xs text-red-500 mb-2">There are currently no delivery partners assigned or available for this order. Please assign a partner to continue.</div>
            </div>
          )}
        </div>
           {/* Order Status Update Card (only for new/ongoing orders) */}
    {canUpdateStatus && (
          <div className="bg-white rounded-2xl shadow p-3 sm:p-5 mb-4 mt-2 sm:mt-4">
            <h2 className="text-lg font-bold text-black mb-4 flex items-center gap-3">
              <CheckCircle className="text-blue-500" /> Update Order Status
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
              <button
                className="w-full sm:w-auto flex-1 bg-green-500 text-white font-bold py-2 rounded-full hover:bg-green-600 transition"
                onClick={handleMarkDelivered}
                disabled={updateOrderStatusLoading}
              >
                {updateOrderStatusLoading ? 'Updating...' : 'Mark as Delivered'}
              </button>
              <button
                className="w-full sm:w-auto flex-1 bg-red-500 text-white font-bold py-2 rounded-full hover:bg-red-600 transition"
                onClick={() => setShowCancelReason((v) => !v)}
                disabled={updateOrderStatusLoading}
              >
                Cancel Order
              </button>
            </div>
            {showCancelReason && (
              <form onSubmit={handleCancelOrder} className="mt-4 space-y-2">
                <label className="block text-xs font-semibold mb-1 text-black">Cancellation Reason</label>
                <textarea
                  className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  rows={2}
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder="Enter reason for cancellation..."
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-red-600 text-white font-bold py-2 rounded-full mt-2 hover:bg-red-700 transition"
                  disabled={updateOrderStatusLoading}
                >
                  {updateOrderStatusLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </form>
            )}
          </div>
        )}
        {/* Payment Verification card at the end of the page (not fixed) */}
        {String(order?.order_status).toLowerCase() === 'delivered' && (
          <div className="w-full">
            <div className="bg-white shadow rounded-2xl p-4 sm:p-6 pb-6 mx-auto mt-6">
              <h2 className="text-base sm:text-lg font-bold text-black mb-2 flex items-center gap-3"><CheckCircle className="text-blue-500" /> Payment Verification</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-700 mb-4">Verify that you've checked the payment proof and confirmed payment reception.</p>
                {order.payment_verification ? (
                  <div className="text-green-600 font-bold text-lg flex items-center justify-center gap-2">
                    <CheckCircle className="text-green-600" /> Payment Verified
                  </div>
                ) : (
                <button onClick={handleVerifyPayment} className="bg-blue-500 text-white font-bold py-3 px-6 rounded-full w-full flex items-center justify-center gap-2 hover:bg-blue-600 transition">
                  <CheckCircle />
                   Verify Payment
                </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Call Button */}
      {partnerData?.phone && (
        <button
          onClick={handleCallPartner}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-purple-100 text-purple-700 shadow-lg rounded-full p-4 sm:p-5 flex items-center justify-center hover:bg-purple-200 transition"
        >
          <Phone size={24} className="sm:w-7 sm:h-7" />
        </button>
      )}
    </div>
  );
}
