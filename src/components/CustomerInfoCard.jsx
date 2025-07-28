import React from 'react';
import { useSelector } from 'react-redux';
import { User, Phone, MapPin } from 'lucide-react';
import AppSpinner from '@/components/AppSpinner';

const CustomerInfoCard = React.memo(() => {
    const customerName = useSelector((state) => state.orders.current?.customer_name);
    const customerPhone = useSelector((state) => state.orders.current?.customer_phone_number);
    const address = useSelector((state) => state.orders.current?.address);
    const loading = useSelector((state) => state.orders.loading);

    if (loading) {
        return <AppSpinner label="Loading customer info..." />;
    }

    return (
        <div className="bg-white shadow-md rounded-xl p-4 transition-all duration-300">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Customer Information</h3>
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <User size={16} className="text-blue-500" />
                    <span className="text-sm text-gray-700">{customerName}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Phone size={16} className="text-blue-500" />
                    <span className="text-sm text-gray-700">{customerPhone}</span>
                </div>
                <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-blue-500" />
                    <span className="text-sm text-gray-700">{address}</span>
                </div>
            </div>
        </div>
    );
});

export default CustomerInfoCard; 