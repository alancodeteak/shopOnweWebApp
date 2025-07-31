import React from 'react';
import { useSelector } from 'react-redux';
import AppSpinner from '@/components/AppSpinner';
import Card from '@/components/Card';
import StatusBadge from '@/components/StatusBadge';

const OrderDetailsCard = React.memo(({ orderId }) => {
    const order = useSelector((state) => state.orders.current);
    const urgency = useSelector((state) => state.orders.current?.urgency);
    const loading = useSelector((state) => state.orders.loading);

    if (loading || !order || order.order_id !== Number(orderId)) {
        return <AppSpinner label="Loading order details..." />;
    }

    return (
        <Card>
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold">Order #{order.order_id}</h2>
                    <p className="text-sm text-gray-600">Bill #{order.bill_no}</p>
                    <p className="text-xs text-gray-400">Created: {new Date(order.created_at).toLocaleString()}</p>
                </div>
                <StatusBadge status={order.order_status} />
            </div>
            {urgency && (
                <div className="mt-2">
                    <StatusBadge status={urgency} variant="pill" />
                </div>
            )}
        </Card>
    );
});

export default OrderDetailsCard; 