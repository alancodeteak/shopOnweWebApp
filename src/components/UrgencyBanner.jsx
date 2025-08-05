import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateOrderUrgency } from '@/store/slices/ordersSlice';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from '@/components';

const UrgencyBanner = ({ orderId }) => {
    const dispatch = useDispatch();
    const urgency = useSelector((state) => state.orders.current?.urgency);
    const urgencyLoading = useSelector((state) => state.orders.urgencyLoading);

    const handleUrgencyToggle = useCallback(() => {
        if (!urgency) return;
        const newUrgency = urgency === 'Urgent' ? 'Normal' : 'Urgent';
        dispatch(updateOrderUrgency({ orderId, urgency: newUrgency }));
    }, [dispatch, orderId, urgency]);

    if (urgencyLoading) return <LoadingSpinner size="small" message="Updating urgency..." />;
    if (!urgency) return null;

    const isUrgent = urgency === 'Urgent';

    return (
        <div
            onClick={handleUrgencyToggle}
            className={`text-white flex flex-wrap items-center justify-between p-3 sm:p-4 rounded-2xl shadow-md cursor-pointer w-full max-w-full ${
                isUrgent ? 'bg-red-500' : 'bg-blue-500'
            }`}
        >
            <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                {isUrgent ? <AlertTriangle size={20} /> : <ArrowLeft size={20} />}
                <span className="font-semibold">{isUrgent ? 'Mark as Normal' : 'Mark as Urgent'}</span>
            </div>
            <button className="text-white text-lg sm:text-xl ml-2 sm:ml-4">
                {isUrgent ? '✕' : ''}
            </button>
        </div>
    );
};

export default UrgencyBanner; 