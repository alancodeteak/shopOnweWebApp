import React from 'react';
import { useSelector } from 'react-redux';
import { User, Phone, MapPin } from 'lucide-react';
import AppSpinner from '@/components/AppSpinner';
import Card from '@/components/Card';
import InfoRow from '@/components/InfoRow';

const CustomerInfoCard = React.memo(() => {
    const customerName = useSelector((state) => state.orders.current?.customer_name);
    const customerPhone = useSelector((state) => state.orders.current?.customer_phone_number);
    const address = useSelector((state) => state.orders.current?.address);
    const loading = useSelector((state) => state.orders.loading);

    if (loading) {
        return <AppSpinner label="Loading customer info..." />;
    }

    return (
        <Card>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Customer Information</h3>
            <div className="space-y-3">
                <InfoRow 
                    icon={User} 
                    value={customerName} 
                />
                <InfoRow 
                    icon={Phone} 
                    value={customerPhone} 
                />
                <InfoRow 
                    icon={MapPin} 
                    value={address} 
                />
            </div>
        </Card>
    );
});

export default CustomerInfoCard; 