import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder, clearCreatedOrder, fetchCustomerByPhone, clearCustomerSearch } from '@/store/slices/ordersSlice';
import { toast } from 'react-toastify';
import { Camera, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import PageContainer from '@/components/PageContainer';
import { 
  FormInput, 
  FormTextarea, 
  FormButton, 
  PhoneSearchInput, 
  OrderItemsList, 
  UrgencyToggle, 
  WaterNeedToggle,
  ImageUpload 
} from '@/components/forms';

export default function CreateOrder() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const shopId = useSelector((state) => state.auth.user?.shopId);
  const loading = useSelector((state) => state.orders.loading);
  const error = useSelector((state) => state.orders.error);
  const customerSearch = useSelector((state) => state.orders.customerSearch);

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
  const [waterNeed, setWaterNeed] = useState('No');
  const [billImage, setBillImage] = useState(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [errors, setErrors] = useState({});

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId;
      return (phoneNumber) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (phoneNumber && phoneNumber.length === 10) {
            dispatch(fetchCustomerByPhone(phoneNumber));
          }
        }, 500);
      };
    })(),
    [dispatch]
  );

  // Handle phone number change with debounced search
  const handlePhoneChange = (value) => {
    const cleanPhone = value.replace(/\D/g, '').slice(0, 10);
    setPhone(cleanPhone);
    
    // Clear previous customer data when phone changes
    if (cleanPhone !== phone) {
      dispatch(clearCustomerSearch());
      setCustomerName('');
      setAddress('');
    }
    
    // Trigger debounced search
    debouncedSearch(cleanPhone);
  };

  // Manual search function
  const handleManualSearch = () => {
    if (phone && phone.length === 10) {
      dispatch(fetchCustomerByPhone(phone));
    } else {
      toast.error('Please enter a valid 10-digit phone number');
    }
  };

  // Auto-populate customer data when search is successful
  useEffect(() => {
    if (customerSearch.data && customerSearch.data.customer_name) {
      setCustomerName(customerSearch.data.customer_name || '');
      setAddress(customerSearch.data.address || '');
      toast.success('Customer data found and populated!');
    }
  }, [customerSearch.data]);

  // Show error when customer search fails
  useEffect(() => {
    if (customerSearch.error && phone.length === 10) {
      toast.error(customerSearch.error);
    }
  }, [customerSearch.error, phone]);

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
      water: waterNeed === 'Yes',
      items: validItems.length > 0 ? validItems.map((item) => ({
        item_name: item.item_name,
        quantity: Number(item.quantity),
        price: Number(item.price),
        totalamount: Number(item.totalamount),
      })) : [],
    };
    
    // Debug: Log the water value being sent
    console.log('🌊 Water Need Debug:', {
      waterNeed: waterNeed,
      water: waterNeed === 'Yes',
      payload_water: payload.water
    });
    // If bill image, use FormData
    if (billImage) {
      const formData = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (k === 'items') {
          formData.append('items', JSON.stringify(v));
        } else if (k === 'water') {
          // Ensure water is sent as a string 'true' or 'false' for FormData
          formData.append(k, v.toString());
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
    <PageContainer background="bg-white">
      <PageHeader title="Add Order" onBack={() => navigate(-1)} />
      <form
        className="flex flex-col gap-3 w-full"
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        {/* Phone Search */}
        <PhoneSearchInput
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          onSearch={handleManualSearch}
          loading={customerSearch.loading}
          error={errors.phone || (customerSearch.error && phone.length === 10 ? customerSearch.error : '')}
        />

        {/* Name */}
        <FormInput
          label={
            <>
              Customer Name
              {customerSearch.data && customerSearch.data.customer_name && (
                <span className="ml-2 text-xs text-green-600 font-normal">✓ Auto-filled</span>
              )}
            </>
          }
          placeholder="Enter name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          error={errors.customerName}
          className={customerSearch.data && customerSearch.data.customer_name ? 'ring-2 ring-green-300 bg-green-50' : ''}
        />

        {/* Address */}
        <FormInput
          label={
            <>
              Address
              {customerSearch.data && customerSearch.data.address && (
                <span className="ml-2 text-xs text-green-600 font-normal">✓ Auto-filled</span>
              )}
            </>
          }
          placeholder="Enter address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          error={errors.address}
          className={customerSearch.data && customerSearch.data.address ? 'ring-2 ring-green-300 bg-green-50' : ''}
        />

        {/* Bill No */}
        <FormInput
          label="Bill Number"
          placeholder="Enter bill number"
          value={billNo}
          onChange={(e) => setBillNo(e.target.value)}
          error={errors.billNo}
        />

        {/* Items List */}
        <OrderItemsList
          items={items}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onItemChange={handleItemChange}
          error={errors.items}
        />

        {/* Total Amount */}
        <FormInput
          label="Total Amount"
          type="number"
          placeholder="Total amount"
          value={items.some(item => item.item_name && item.quantity && item.price) ? calcTotal() : totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          disabled={items.some(item => item.item_name && item.quantity && item.price)}
          readOnly={items.some(item => item.item_name && item.quantity && item.price)}
          min={0}
          step="0.01"
          error={errors.totalAmount}
          className={items.some(item => item.item_name && item.quantity && item.price) ? 'bg-gray-100' : ''}
        />

        {/* Urgency and Water Need Toggles */}
        <div className="grid grid-cols-2 gap-4">
          <UrgencyToggle
            value={urgency}
            onChange={setUrgency}
          />
          <WaterNeedToggle
            value={waterNeed}
            onChange={setWaterNeed}
          />
        </div>

        {/* Bill Image Upload */}
        <ImageUpload
          label="Bill Image"
          value={billImage}
          onChange={setBillImage}
          onRemove={() => setBillImage(null)}
          showRemoveButton={false}
          previewHeight="h-20"
        />

        {/* Special Instructions */}
        <FormTextarea
          label="Special Instructions"
          placeholder="Any special instructions?"
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          showCounter={false}
        />

        {/* Submit Button */}
        <FormButton
          type="submit"
          loading={loading}
          fullWidth
          size="lg"
          className="rounded-full font-bold text-lg"
        >
          Create Order
        </FormButton>
        
        {error && <p className="text-red-500 text-xs mt-3 text-center">{error}</p>}
      </form>
    </PageContainer>
  );
}
