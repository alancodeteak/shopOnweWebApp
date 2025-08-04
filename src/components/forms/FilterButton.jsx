import React, { useState, useRef, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setFilter, removeFilter, clearAllFilters } from '@/store/slices/ordersSlice';

export default function FilterButton() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  
  const activeFilters = useSelector((state) => state.orders.activeFilters);
  const availableFilters = useSelector((state) => state.orders.availableFilters);
  const filtersLoading = useSelector((state) => state.orders.filtersLoading);

  // Calculate total active filters
  const totalActiveFilters = Object.values(activeFilters).reduce((sum, filters) => sum + filters.length, 0);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterToggle = (type, value) => {
    if (activeFilters[type].includes(value)) {
      dispatch(removeFilter({ type, value }));
    } else {
      dispatch(setFilter({ type, value }));
    }
  };

  const handleClearAll = () => {
    dispatch(clearAllFilters());
  };

  const getFilterLabel = (type, value) => {
    switch (type) {
      case 'deliveryPartners':
        const partner = availableFilters.deliveryPartners.find(p => p.id === value || p.delivery_partner_id === value);
        return partner?.name || partner?.delivery_partner_name || value;
      case 'paymentModes':
        return value;
      case 'verificationStatus':
        return value === 'verified' ? 'Verified' : 'Non-verified';
      default:
        return value;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <Filter className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Filters</span>
        {totalActiveFilters > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
            {totalActiveFilters > 99 ? '99+' : totalActiveFilters}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              {totalActiveFilters > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {filtersLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading filters...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Delivery Partners */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Partners</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {availableFilters.deliveryPartners.map((partner) => {
                      const value = partner.id || partner.delivery_partner_id;
                      const label = partner.name || partner.delivery_partner_name;
                      return (
                        <label key={value} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={activeFilters.deliveryPartners.includes(value)}
                            onChange={() => handleFilterToggle('deliveryPartners', value)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Modes */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Modes</h4>
                  <div className="space-y-2">
                    {availableFilters.paymentModes.map((mode) => (
                      <label key={mode} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={activeFilters.paymentModes.includes(mode)}
                          onChange={() => handleFilterToggle('paymentModes', mode)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{mode}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Verification Status */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Verification Status</h4>
                  <div className="space-y-2">
                    {['verified', 'non-verified'].map((status) => (
                      <label key={status} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={activeFilters.verificationStatus.includes(status)}
                          onChange={() => handleFilterToggle('verificationStatus', status)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {status === 'verified' ? 'Verified' : 'Non-verified'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 