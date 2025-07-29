import React from 'react';
import { RefreshCw, Bike } from 'lucide-react';

const DeliveryPartnerCard = React.memo(({ partners, loading, error, onAssign, onRefresh }) => {
    return (
        <div className="bg-white shadow-md rounded-xl p-3 sm:p-4">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800">Available Delivery Partners</h3>
                <button onClick={onRefresh}>
                    <RefreshCw size={16} className={`${loading ? 'animate-spin' : ''} sm:w-[18px] sm:h-[18px]`} />
                </button>
            </div>

            {loading && <p className="text-xs sm:text-sm">Loading partners...</p>}
            {error && <p className="text-red-500 text-xs sm:text-sm">{error}</p>}
            
            <div className="space-y-2 sm:space-y-3">
                {partners.map(partner => (
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
                ))}
            </div>
        </div>
    );
});

export default DeliveryPartnerCard; 