import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchOrderById, assignOrder } from '@/store/slices/ordersSlice';
import { fetchAvailablePartners } from '@/store/slices/deliveryPartnerSlice';


import OrderDetailsCard from '@/components/OrderDetailsCard';
import CustomerInfoCard from '@/components/CustomerInfoCard';
import OrderItemsCard from '@/components/OrderItemsCard';
import DeliveryPartnerCard from '@/components/DeliveryPartnerCard';
import UrgencyBanner from '@/components/UrgencyBanner';
import ErrorMessage from '@/components/ErrorMessage';
import PageHeader from '@/components/PageHeader';
import { ErrorBoundary, NetworkErrorHandler, LoadingSpinner } from '@/components';
import { isNetworkError, isServerError } from '@/utils/errorHandler';
import toast from 'react-hot-toast';

const AssignOrder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const orderError = useSelector((state) => state.orders.error);
    const partners = useSelector((state) => state.deliveryPartners.available);
    const partnersLoading = useSelector((state) => state.deliveryPartners.loading);
    const partnersError = useSelector((state) => state.deliveryPartners.error);
    const shopId = useSelector((state) => state.auth.user?.shopId);
    
    // Page-level loading state for assignment process
    const [isAssigning, setIsAssigning] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState(null);

    useEffect(() => {
        // Fetch data in parallel for faster loading
        Promise.all([
            dispatch(fetchOrderById(id)),
            dispatch(fetchAvailablePartners())
        ]);
    }, [dispatch, id]);

    const handleAssign = useCallback(async (partnerId) => {
        // Find the selected partner from the partners array
        const partner = partners.find(p => p.delivery_partner_id === partnerId);
        setSelectedPartner(partner);
        setIsAssigning(true);
        try {
            const result = await dispatch(assignOrder({ orderId: id, partnerId, shopId }));
            if (result.type.endsWith('fulfilled')) {
                // Show success message with better styling
                toast.success('🎉 Success! Delivery partner assigned', {
                    duration: 3000,
                    position: 'top-center',
                    style: {
                        background: '#10B981',
                        color: '#fff',
                        fontWeight: '600',
                        borderRadius: '12px',
                        padding: '16px 20px'
                    }
                });
                
                // Refresh order data to show updated information
                await dispatch(fetchOrderById(id));
                
                // Navigate to success page after a short delay
                setTimeout(() => {
                    navigate('/orders/assign/success', { 
                        state: { 
                            orderId: id,
                            partnerId: partnerId,
                            partnerName: partner?.name
                        }
                    });
                }, 1500);
            } else {
                throw new Error(result.payload || 'Failed to assign partner');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to assign delivery partner');
            setIsAssigning(false);
            setSelectedPartner(null);
        }
    }, [dispatch, id, shopId, navigate, partners]);
    
    const handleRefreshPartners = useCallback(() => {
        dispatch(fetchAvailablePartners());
    }, [dispatch]);

    const handleRetryOrder = useCallback(() => {
        dispatch(fetchOrderById(id));
    }, [dispatch, id]);

    if (orderError) {
      return (
        <ErrorMessage 
          message={orderError} 
          isNetworkError={isNetworkError(orderError)}
          isServerError={isServerError(orderError)}
          onRetry={handleRetryOrder}
        />
      );
    }

    // Show page-level loading during assignment with faster feedback
    if (isAssigning) {
        return (
            <ErrorBoundary>
                <NetworkErrorHandler>
                    <div className="bg-pink-50 min-h-screen pt-16 pb-24">
                        <div className="max-w-screen-md mx-auto px-4">
                            <PageHeader
                                title="Assign Order"
                                onBack={() => navigate(-1)}
                                onRefresh={() => dispatch(fetchOrderById(id))}
                            />
                        </div>
                        <div className="flex items-center justify-center mt-20">
                            <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md mx-4">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-blue-500"></div>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                      Assigning Delivery Partner {selectedPartner?.name ? `- ${selectedPartner.name}` : ''}
                                </h3>
                                {selectedPartner && (
                                    <p className="text-sm text-gray-600">
                                        Assigning order to {selectedPartner.name} ({selectedPartner.phone})
                                    </p>
                                )}
                                <div className="mt-4 flex items-center justify-center gap-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </NetworkErrorHandler>
            </ErrorBoundary>
        );
    }

    return (
        <ErrorBoundary>
            <NetworkErrorHandler>
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
                    isAssigning={isAssigning}
                />
            </main>
                </div>
            </NetworkErrorHandler>
        </ErrorBoundary>
    );
};

export default AssignOrder;