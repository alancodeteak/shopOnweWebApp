import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchOrderById, assignOrder } from '@/store/slices/ordersSlice';
import { fetchAvailablePartners } from '@/store/slices/deliveryPartnerSlice';
import { RefreshCw, ArrowLeft } from 'lucide-react';

import OrderDetailsCard from '@/components/OrderDetailsCard';
import CustomerInfoCard from '@/components/CustomerInfoCard';
import OrderItemsCard from '@/components/OrderItemsCard';
import DeliveryPartnerCard from '@/components/DeliveryPartnerCard';
import UrgencyBanner from '@/components/UrgencyBanner';
import ErrorMessage from '@/components/ErrorMessage';
import PageHeader from '@/components/PageHeader';

const AssignOrder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const orderError = useSelector((state) => state.orders.error);
    const partners = useSelector((state) => state.deliveryPartners.available);
    const partnersLoading = useSelector((state) => state.deliveryPartners.loading);
    const partnersError = useSelector((state) => state.deliveryPartners.error);
    const shopId = useSelector((state) => state.auth.user?.shopId);

    useEffect(() => {
        dispatch(fetchOrderById(id));
        dispatch(fetchAvailablePartners());
    }, [dispatch, id]);

    const handleAssign = useCallback((partnerId) => {
        dispatch(assignOrder({ orderId: id, partnerId, shopId })).then((result) => {
            if (result.type.endsWith('fulfilled')) {
                navigate(`/orders/assign/success`);
            }
        });
    }, [dispatch, id, navigate, shopId]);
    
    const handleRefreshPartners = useCallback(() => {
        dispatch(fetchAvailablePartners());
    }, [dispatch]);

    if (orderError) {
      const errorInfo = typeof orderError === 'object' ? orderError : { message: orderError };
      return <ErrorMessage message={errorInfo.message} />;
    }

    return (
        <div className="bg-pink-50 min-h-screen pt-16 pb-24">
            <div className="max-w-screen-md mx-auto px-4">
                <PageHeader
                  title="Assign Order"
                  onBack={() => navigate(-1)}
                  onRefresh={() => dispatch(fetchOrderById(id))}
                />
            </div>

            <main className="max-w-screen-md mx-auto px-4 space-y-4">
                <OrderDetailsCard orderId={id} />
                <CustomerInfoCard />
                <OrderItemsCard />
                <UrgencyBanner orderId={id} />
                <DeliveryPartnerCard 
                    partners={partners} 
                    loading={partnersLoading} 
                    error={partnersError} 
                    onAssign={handleAssign}
                    onRefresh={handleRefreshPartners}
                />
            </main>
        </div>
    );
};

export default AssignOrder; 