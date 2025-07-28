import React from 'react';
import { useSelector } from 'react-redux';
import AppSpinner from '@/components/AppSpinner';

const OrderItemsCard = React.memo(() => {
    const items = useSelector((state) => state.orders.current?.items);
    const totalAmount = useSelector((state) => state.orders.current?.total_amount);
    const billImage = useSelector((state) => state.orders.current?.bill_image);
    const loading = useSelector((state) => state.orders.loading);

    if (loading) {
        return <AppSpinner label="Loading items..." />;
    }

    return (
        <div className="bg-white shadow-md rounded-xl p-4 transition-all duration-300">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Order Items</h3>
            {items && items.length > 0 ? (
                <ul className="space-y-2">
                    {items.map((item, idx) => (
                        <li key={item.id || idx} className="flex justify-between text-sm">
                            <span>{item.item_name} x {item.quantity}</span>
                            <span>₹{item.totalamount}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-500">No items in this order</p>
            )}
            <div className="border-t my-3"></div>
            <div className="flex justify-between items-center">
                <span className="font-semibold">Total Amount:</span>
                <span className="text-lg font-bold text-black">₹{totalAmount}</span>
            </div>
            {billImage && (
                 <a href={billImage} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium mt-2 inline-block">View Bill Image</a>
            )}
        </div>
    );
});

export default OrderItemsCard; 