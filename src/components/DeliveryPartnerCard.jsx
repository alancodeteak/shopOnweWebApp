import React from 'react';
import { RefreshCw, Bike } from 'lucide-react';

const DeliveryPartnerCard = React.memo(({ partners, loading, error, onAssign, onRefresh }) => {
    return (
        <div className="bg-white shadow-md rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-800">Available Delivery Partners</h3>
                <button onClick={onRefresh}>
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {loading && <p>Loading partners...</p>}
            {error && <p className="text-red-500">{error}</p>}
            
            <div className="space-y-3">
                {partners.map(partner => (
                    <div key={partner.delivery_partner_id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                {partner.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-semibold">{partner.name}</p>
                                <p className="text-xs text-gray-500">{partner.phone}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onAssign(partner.delivery_partner_id)}
                            className="flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-3 rounded-xl font-medium hover:bg-blue-200"
                        >
                            <Bike size={18} />
                             assign order
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default DeliveryPartnerCard; 