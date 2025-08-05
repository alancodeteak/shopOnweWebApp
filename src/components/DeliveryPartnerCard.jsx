import React from 'react';
import { RefreshCw, Bike, AlertCircle, UserPlus } from 'lucide-react';
import Card from '@/components/Card';
import { LoadingSpinner } from '@/components';

const DeliveryPartnerCard = React.memo(({ partners, loading, error, onAssign, onRefresh }) => {
    return (
        <Card>
            <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800">Available Delivery Partners</h3>
                <button onClick={onRefresh}>
                    <RefreshCw size={16} className={`${loading ? 'animate-spin' : ''} sm:w-[18px] sm:h-[18px]`} />
                </button>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner message="Loading available partners..." />
              </div>
            )}
            
            {error && (
              <div className="py-6">
                {typeof error === 'object' && error.type === 'no_partners_available' ? (
                  // Special handling for no partners available
                  <div className="text-center py-8">
                    <UserPlus className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Partners Available</h3>
                    <p className="text-sm text-gray-600 mb-4 max-w-sm mx-auto">
                      {error.message}
                    </p>
                    <div className="space-y-2 text-xs text-gray-500">
                      <p>• All delivery partners might be busy with other orders</p>
                      <p>• Partners might be offline or unavailable</p>
                      <p>• Try refreshing in a few minutes</p>
                    </div>
                    <button
                      onClick={onRefresh}
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <RefreshCw className="w-4 h-4 inline mr-2" />
                      Refresh
                    </button>
                  </div>
                ) : (
                  // General error handling
                  <div className="text-center py-6">
                    <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Error Loading Partners</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {typeof error === 'object' ? error.message : error}
                    </p>
                    <button
                      onClick={onRefresh}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <RefreshCw className="w-4 h-4 inline mr-2" />
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {!loading && !error && (
              <div className="space-y-2 sm:space-y-3">
                {Array.isArray(partners) && partners.length > 0 ? (
                  partners.map(partner => (
                    <div key={partner.delivery_partner_id} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm sm:text-base">
                          {partner.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-xs sm:text-sm">{partner.name}</p>
                          <p className="text-xs text-gray-500">{partner.phone}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => onAssign(partner.delivery_partner_id)}
                        className="flex items-center gap-1 sm:gap-2 bg-blue-100 text-blue-600 px-2 py-2 sm:px-4 sm:py-3 rounded-xl font-medium hover:bg-blue-200 text-xs sm:text-sm"
                      >
                        <Bike size={14} className="sm:w-[18px] sm:h-[18px]" />
                         assign order
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <UserPlus className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">No delivery partners found</p>
                  </div>
                )}
              </div>
            )}
        </Card>
    );
});

export default DeliveryPartnerCard; 