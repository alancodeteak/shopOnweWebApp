import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder, clearCreatedOrder } from '@/store/slices/ordersSlice';
import { toast } from 'react-toastify';
import { ArrowLeft, Camera, Search, Plus, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';

export default function CreateOrder() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const shopId = useSelector((state) => state.auth.user?.shopId);
  const loading = useSelector((state) => state.orders.loading);
  const error = useSelector((state) => state.orders.error);

  // Form state
  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [billNo, setBillNo] = useState('');
  const [items, setItems] = useState([
    { item_name: '', quantity: '', price: '', totalamount: '' },
  ]);
  const [totalAmount, setTotalAmount] = useState('');
  const [urgency, setUrgency] = useState('Normal');
  const [billImage, setBillImage] = useState(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [errors, setErrors] = useState({});

  // Calculate total from items
  const calcTotal = () => {
    let sum = 0;
    let hasItem = false;
    items.forEach((item) => {
      if (
        item.item_name &&
        item.quantity &&
        item.price &&
        !isNaN(Number(item.quantity)) &&
        !isNaN(Number(item.price))
      ) {
        hasItem = true;
        sum += Number(item.quantity) * Number(item.price);
      }
    });
    return hasItem ? sum.toFixed(2) : '';
  };

  // Update totalamount for each item
  const updateItemTotal = (idx) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              totalamount:
                item.quantity && item.price && !isNaN(Number(item.quantity)) && !isNaN(Number(item.price))
                  ? (Number(item.quantity) * Number(item.price)).toFixed(2)
                  : '',
            }
          : item
      )
    );
  };

  // Handle item field change
  const handleItemChange = (idx, field, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      )
    );
    if (field === 'quantity' || field === 'price') {
      setTimeout(() => updateItemTotal(idx), 0);
    }
  };

  // Add/remove item
  const addItem = () => {
    setItems((prev) => [...prev, { item_name: '', quantity: '', price: '', totalamount: '' }]);
  };
  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Handle bill image
  const handleBillImage = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBillImage(e.target.files[0]);
    }
  };

  // Validation
  const validate = () => {
    const errs = {};
    if (!phone || phone.length !== 10) errs.phone = 'Valid phone required';
    if (!customerName) errs.customerName = 'Name required';
    if (!address) errs.address = 'Address required';
    if (!billNo) errs.billNo = 'Bill number required';
    // If items exist, require at least one valid item
    const validItems = items.filter(
      (item) =>
        item.item_name &&
        item.quantity &&
        item.price &&
        !isNaN(Number(item.quantity)) &&
        !isNaN(Number(item.price))
    );
    if (items.length > 0 && validItems.length === 0) errs.items = 'Add at least one valid item or remove all items';
    // If no items, require manual total
    if (validItems.length === 0 && !totalAmount) errs.totalAmount = 'Total amount required';
    return errs;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const validItems = items.filter(
      (item) =>
        item.item_name &&
        item.quantity &&
        item.price &&
        !isNaN(Number(item.quantity)) &&
        !isNaN(Number(item.price))
    );
    const payload = {
      shop_id: shopId,
      bill_no: billNo,
      customer_name: customerName,
      address,
      total_amount: validItems.length > 0 ? Number(calcTotal()) : Number(totalAmount),
      customer_phone_number: phone,
      special_instructions: specialInstructions,
      urgency,
      items: validItems.length > 0 ? validItems.map((item) => ({
        item_name: item.item_name,
        quantity: Number(item.quantity),
        price: Number(item.price),
        totalamount: Number(item.totalamount),
      })) : [],
    };
    // If bill image, use FormData
    if (billImage) {
      const formData = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (k === 'items') {
          formData.append('items', JSON.stringify(v));
        } else {
          formData.append(k, v);
        }
      });
      formData.append('bill_image', billImage);
      dispatch(createOrder(formData)).then((res) => {
        if (res.type.endsWith('fulfilled')) {
          toast.success('Order created!');
          dispatch(clearCreatedOrder());
          navigate(-1);
        } else {
          toast.error(res.payload || 'Failed to create order');
        }
      });
    } else {
      dispatch(createOrder(payload)).then((res) => {
        if (res.type.endsWith('fulfilled')) {
          toast.success('Order created!');
          dispatch(clearCreatedOrder());
          navigate(-1);
        } else {
          toast.error(res.payload || 'Failed to create order');
        }
      });
    }
  };

  // UI
  return (
    <div className="min-h-screen bg-white text-black flex flex-col pt-16 pb-24">
      <div className="w-full max-w-screen-md mx-auto px-4">
        <PageHeader title="Add Order" onBack={() => navigate(-1)} />
        <form
          className="flex flex-col gap-3 w-full"
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold mb-1">Customer Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                className="w-full rounded-lg px-3 py-2 shadow-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 pr-10"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
              />
              <Search className="absolute right-3 top-2.5 text-blue-500 w-5 h-5" />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold mb-1">Customer Name</label>
            <input
              type="text"
              className="w-full rounded-lg px-3 py-2 shadow-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Enter name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
          </div>
          {/* Address */}
          <div>
            <label className="block text-sm font-semibold mb-1">Address</label>
            <input
              type="text"
              className="w-full rounded-lg px-3 py-2 shadow-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Enter address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>
          {/* Bill No */}
          <div>
            <label className="block text-sm font-semibold mb-1">Bill Number</label>
            <input
              type="text"
              className="w-full rounded-lg px-3 py-2 shadow-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Enter bill number"
              value={billNo}
              onChange={(e) => setBillNo(e.target.value)}
            />
            {errors.billNo && <p className="text-red-500 text-xs mt-1">{errors.billNo}</p>}
          </div>
          {/* Items List */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold">Order Items</label>
              <button type="button" className="flex items-center gap-1 text-xs bg-blue-500 text-white px-3 py-1 rounded-full" onClick={addItem}>
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-end w-full">
                <input
                  type="text"
                  className="flex-1 rounded-lg px-2 py-1 shadow-sm text-black bg-white w-full"
                  placeholder="Item Name"
                  value={item.item_name}
                  onChange={(e) => handleItemChange(idx, 'item_name', e.target.value)}
                />
                <input
                  type="number"
                  className="w-16 rounded-lg px-2 py-1 shadow-sm text-black bg-white"
                  placeholder="Qty"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => handleItemChange(idx, 'quantity', e.target.value.replace(/\D/g, ''))}
                />
                <input
                  type="number"
                  className="w-20 rounded-lg px-2 py-1 shadow-sm text-black bg-white"
                  placeholder="Price"
                  min={0}
                  step="0.01"
                  value={item.price}
                  onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                />
                <span className="w-20 text-xs text-blue-500 font-bold">{item.totalamount ? `₹${item.totalamount}` : ''}</span>
                {items.length > 1 && (
                  <button type="button" className="p-1 bg-red-500 rounded-full" onClick={() => removeItem(idx)}>
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            ))}
            {errors.items && <p className="text-red-500 text-xs mt-1">{errors.items}</p>}
          </div>
          {/* Total Amount */}
          <div>
            <label className="block text-sm font-semibold mb-1">Total Amount</label>
            <input
              type="number"
              className={`w-full rounded-lg px-3 py-2 shadow-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 ${items.some(item => item.item_name && item.quantity && item.price) ? 'bg-gray-100' : ''}`}
              placeholder="Total amount"
              value={items.some(item => item.item_name && item.quantity && item.price) ? calcTotal() : totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              disabled={items.some(item => item.item_name && item.quantity && item.price)}
              min={0}
              step="0.01"
              readOnly={items.some(item => item.item_name && item.quantity && item.price)}
            />
            {errors.totalAmount && <p className="text-red-500 text-xs mt-1">{errors.totalAmount}</p>}
          </div>
          {/* Urgency Toggle */}
          <div>
            <label className="block text-sm font-semibold mb-1">Urgency:</label>
            <div className="relative w-full max-w-xs h-12 bg-white rounded-full flex items-center select-none overflow-hidden shadow-sm mx-auto">
              {/* Sliding indicator */}
              <span
                className={`absolute top-0 left-0 h-full w-1/2 rounded-full bg-blue-500 transition-transform duration-200 ease-in-out z-0 ${urgency === 'Urgent' ? 'translate-x-full' : 'translate-x-0'}`}
                style={{ width: '50%' }}
              />
              {/* Normal button */}
              <button
                type="button"
                className={`flex-1 h-full z-10 relative font-bold rounded-full transition-colors duration-150 ${urgency === 'Normal' ? 'text-white' : 'text-black'}`}
                onClick={() => setUrgency('Normal')}
                style={{ outline: 'none' }}
              >
                Normal
              </button>
              {/* Urgent button */}
              <button
                type="button"
                className={`flex-1 h-full z-10 relative font-bold rounded-full transition-colors duration-150 ${urgency === 'Urgent' ? 'text-white' : 'text-black'}`}
                onClick={() => setUrgency('Urgent')}
                style={{ outline: 'none' }}
              >
                Urgent
              </button>
            </div>
          </div>
          {/* Bill Image Upload */}
          <div>
            <label className="block text-sm font-semibold mb-1">Bill Image</label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="bill-image-input"
                onChange={handleBillImage}
              />
              <label htmlFor="bill-image-input" className="flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg cursor-pointer text-white">
                <Camera className="w-5 h-5" />
                {billImage ? billImage.name : 'Add Bill Image'}
              </label>
              {billImage && (
                <button type="button" className="text-xs text-red-500" onClick={() => setBillImage(null)}>
                  Remove
                </button>
              )}
            </div>
          </div>
          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-semibold mb-1">Special Instructions</label>
            <textarea
              className="w-full rounded-lg px-3 py-2 shadow-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 min-h-[60px]"
              placeholder="Any special instructions?"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
            />
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-lg bg-blue-500 text-white flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading && <Loader2 className="animate-spin w-5 h-5" />} Create Order
          </button>
          {error && <p className="text-red-500 text-xs mt-3 text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
}
