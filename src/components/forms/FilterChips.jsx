import React from 'react';
import { X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFilter } from '@/store/slices/ordersSlice';

export default function FilterChips() {
  const dispatch = useDispatch();
  const activeFilters = useSelector((state) => state.orders.activeFilters);
  const availableFilters = useSelector((state) => state.orders.availableFilters);

  // Calculate total active filters
  const totalActiveFilters = Object.values(activeFilters).reduce((sum, filters) => sum + (Array.isArray(filters) ? filters.length : 0), 0);

  if (totalActiveFilters === 0) {
    return null;
  }

  const getFilterLabel = (type, value) => {
    switch (type) {
      case 'deliveryPartners':
        const partner = Array.isArray(availableFilters.deliveryPartners) ? availableFilters.deliveryPartners.find(p => p.id === value || p.delivery_partner_id === value) : null;
        return partner?.name || partner?.delivery_partner_name || value;
      case 'paymentModes':
        return value;
      case 'verificationStatus':
        return value === 'verified' ? 'Verified' : 'Non-verified';
      default:
        return value;
    }
  };

  const getFilterTypeLabel = (type) => {
    switch (type) {
      case 'deliveryPartners':
        return 'Delivery Partner';
      case 'paymentModes':
        return 'Payment Mode';
      case 'verificationStatus':
        return 'Status';
      default:
        return type;
    }
  };

  const handleRemoveFilter = (type, value) => {
    dispatch(removeFilter({ type, value }));
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {Object.entries(activeFilters).map(([type, values]) =>
        Array.isArray(values) ? values.map((value) => (
          <div
            key={`${type}-${value}`}
            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
          >
            <span className="text-xs text-blue-600 font-semibold">
              {getFilterTypeLabel(type)}:
            </span>
            <span>{getFilterLabel(type, value)}</span>
            <button
              onClick={() => handleRemoveFilter(type, value)}
              className="ml-1 p-0.5 hover:bg-blue-200 rounded-full transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )) : null
      )}
    </div>
  );
} 