import React from 'react';
import { useSelector } from 'react-redux';
import AppSpinner from '@/components/AppSpinner';

const OrderDetailsCard = React.memo(({ orderId }) => {
    const order = useSelector((state) => state.orders.current);
    const urgency = useSelector((state) => state.orders.current?.urgency);
    const loading = useSelector((state) => state.orders.loading);

    if (loading || !order || order.order_id !== Number(orderId)) {
        return <AppSpinner label="Loading order details..." />;
    }

    return (
        <div className="bg-white shadow-md rounded-xl p-4 transition-all duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold">Order #{order.order_id}</h2>
                    <p className="text-sm text-gray-600">Bill #{order.bill_no}</p>
                    <p className="text-xs text-gray-400">Created: {new Date(order.created_at).toLocaleString()}</p>
                </div>
                <span className="bg-red-100 text-red-600 text-xs px-3 py-1 rounded-md font-medium">{order.order_status}</span>
            </div>
            {urgency && (
                <div className="mt-2">
                    {urgency === 'Urgent' ? (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">URGENT</span>
                    ) : (
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">NORMAL</span>
                    )}
                </div>
            )}
        </div>
    );
});

export default OrderDetailsCard; 