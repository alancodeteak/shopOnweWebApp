import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Filter, X, Calendar } from 'lucide-react';
import OrderCard from '@/components/OrderCard';
import OrdersTopTabs from '@/components/orders/OrdersTopTabs';
import FilterActionBar from '@/components/orders/FilterActionBar';
import OrdersTable from '@/components/orders/OrdersTable';
import { createPortal } from 'react-dom';
import { LoadingSpinner, ErrorMessage, EmptyState, ErrorBoundary, NetworkErrorHandler } from '@/components';
import PageHeader from '@/components/PageHeader';
import { OrderSearchInput } from '@/components/forms';
import { fetchOrders, searchOrders, setCurrentPage, resetPagination, setUIFilter, clearUIFilters, setSearchQuery } from '@/store/slices/ordersSlice';
import { fetchAllPartners } from '@/store/slices/deliveryPartnerSlice';
import { isNetworkError, isServerError } from '@/utils/errorHandler';
import CalendarDatePicker from '@/components/CalendarDatePicker';

export default function OrdersList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const shopId = useSelector((state) => state.auth.user?.shopId);
  
  // Orders state
  const orders = useSelector((state) => state.orders.list) || [];
  const loading = useSelector((state) => state.orders.loading);
  const error = useSelector((state) => state.orders.error);
  const pagination = useSelector((state) => state.orders.pagination);
  
  // Delivery partners state
  const deliveryPartners = useSelector((state) => state.deliveryPartners.list);
  const deliveryPartnersLoading = useSelector((state) => state.deliveryPartners.loading);
  const deliveryPartnersError = useSelector((state) => state.deliveryPartners.error);
  
  // Pagination state - use persisted state from Redux
  const currentPage = useSelector((state) => state.orders.pagination?.currentPage) || 1;
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Search and filter state - use persisted state from Redux
  const searchQuery = String(useSelector((state) => state.orders.searchQuery) || '');
  const [showFilters, setShowFilters] = useState(false);
  const filters = useSelector((state) => state.orders.uiFilters) || {
    status: '',
    deliveryPartner: '',
    paymentMode: '',
    startDate: '',
    endDate: ''
  };
  
  // Ensure filters is always an object
  const safeFilters = typeof filters === 'object' && filters !== null ? filters : {
    status: '',
    deliveryPartner: '',
    paymentMode: '',
    startDate: '',
    endDate: ''
  };
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const [filteringOrders, setFilteringOrders] = useState(false);
  const [isUsingSearchAPI, setIsUsingSearchAPI] = useState(false);
  const [itemsModal, setItemsModal] = useState(null);

  // Debug fetch check for critical fields on first row
  useEffect(() => {
    if (Array.isArray(orders) && orders.length > 0) {
      const o = orders[0];
      // eslint-disable-next-line no-console
      console.debug('[OrdersList] sample row:', {
        address: o?.address,
        order_at: o?.order_at || o?.created_at,
        assigned_at: o?.assigned_at,
        picked_up_at: o?.picked_up_at || o?.pack_time,
        delivered_at: o?.delivered_at || o?.delivery_time,
      });
    }
  }, [orders]);

  // Update hasMore based on pagination
  useEffect(() => {
    if (pagination && pagination.totalPages) {
      const newHasMore = currentPage < pagination.totalPages;
      setHasMore(newHasMore);
    } else {
      setHasMore(true);
    }
  }, [pagination, currentPage]);

  // Determine if any loading is happening
  const isAnyLoading = loading || deliveryPartnersLoading;

  // Load delivery partners on component mount
  useEffect(() => {
    dispatch(fetchAllPartners());
  }, [dispatch]);

  // Initial load - use fetchOrders API
  useEffect(() => {
    if (shopId) {
      dispatch(fetchOrders({ shopId }));
      setIsUsingSearchAPI(false);
    }
  }, [dispatch, shopId]);

  // Handle pagination - use appropriate API based on current state
  useEffect(() => {
    if (shopId && currentPage > 1) {
      if (isUsingSearchAPI) {
        // Build filters for search API
        const apiFilters = {};
        
        if (safeFilters.status) {
          apiFilters.status = safeFilters.status;
        }
        
        if (safeFilters.paymentMode) {
          apiFilters.payment_mode = safeFilters.paymentMode;
        }
        
        if (safeFilters.deliveryPartner) {
          apiFilters.dpid = safeFilters.deliveryPartner;
        }
        
        if (safeFilters.startDate) {
          apiFilters.start_date = safeFilters.startDate;
        }
        
        if (safeFilters.endDate) {
          apiFilters.end_date = safeFilters.endDate;
        }
        

        
        dispatch(searchOrders({
          query: searchQuery,
          shopId,
          page: currentPage,
          limit: 10,
          filters: apiFilters
        }));
      } else {
        // Use fetchOrders API for pagination
        dispatch(fetchOrders({ shopId, page: currentPage }));
      }
    }
  }, [dispatch, shopId, currentPage, searchQuery, safeFilters, isUsingSearchAPI]);
  
  // Reset loading more flag when loading completes
  useEffect(() => {
    if (!loading && isLoadingMore) {
      setIsLoadingMore(false);
    }
  }, [loading, isLoadingMore]);
  
  // Reset loading more flag when loading completes
  useEffect(() => {
    if (!loading && isLoadingMore) {
      setIsLoadingMore(false);
    }
  }, [loading, isLoadingMore]);

  const handleRefresh = () => {
    if (shopId) {
      dispatch(resetPagination());
      setHasMore(true);
      setIsLoadingMore(false);
      // Clear search and filters
      dispatch(setSearchQuery(''));
      dispatch(clearUIFilters());
      setIsUsingSearchAPI(false);
      dispatch(fetchOrders({ shopId }));
    }
  };

  const handleSearchChange = useCallback((value) => {
    dispatch(setSearchQuery(value));
  }, [dispatch]);

  const handleSearchClear = useCallback(() => {
    dispatch(setSearchQuery(''));
  }, [dispatch]);

  const handleFilterChange = useCallback((filterType, value) => {
    dispatch(setUIFilter({ filterType, value }));
  }, [dispatch]);

  const clearAllFilters = useCallback(() => {
    dispatch(clearUIFilters());
    dispatch(resetPagination());
    setIsUsingSearchAPI(false);
    // Switch back to normal fetching
    if (shopId) {
      dispatch(fetchOrders({ shopId }));
    }
  }, [dispatch, shopId]);

  const handleApplyFilters = useCallback(() => {
    if (shopId) {
      dispatch(resetPagination());
      setFilteringOrders(true);
      
      // Build filters for search API
      const apiFilters = {};
      
      if (safeFilters.status) {
        apiFilters.status = safeFilters.status;
      }
      
      if (safeFilters.paymentMode) {
        apiFilters.payment_mode = safeFilters.paymentMode;
      }
      
      if (safeFilters.deliveryPartner) {
        apiFilters.dpid = safeFilters.deliveryPartner;
      }
      
      if (safeFilters.startDate) {
        apiFilters.start_date = safeFilters.startDate;
      }
      
      if (safeFilters.endDate) {
        apiFilters.end_date = safeFilters.endDate;
      }
      

      
      dispatch(searchOrders({
        query: searchQuery,
        shopId,
        page: 1,
        limit: 10,
        filters: apiFilters
      }));
      
      setIsUsingSearchAPI(true);
      
      // Reset filtering flag after a delay
      setTimeout(() => {
        setFilteringOrders(false);
      }, 500);
    }
  }, [dispatch, shopId, safeFilters, searchQuery]);

  // Orders are already filtered by the API, just return them
  const filteredOrders = useMemo(() => {
    return orders || [];
  }, [orders]);

  // Get unique values for filter options - memoized to prevent unnecessary recalculations
  const uniqueDeliveryPartners = useMemo(() => {
    // Ensure deliveryPartners is an array before mapping
    if (!Array.isArray(deliveryPartners)) {
      return [];
    }
    
    const partners = deliveryPartners.map(partner => ({
      id: partner.delivery_partner_id,
      name: `${partner.first_name || ''} ${partner.last_name || ''}`.trim() || 'Unknown Partner'
    }));
    return partners;
  }, [deliveryPartners]);

  const orderStatuses = useMemo(() => {
    return [
      'Pending',
      'Assigned',
      'Picked Up',
      'Out for Delivery',
      'Delivered',
      'customer_not_available',
      'cancelled'
    ];
  }, []);

  const paymentModes = useMemo(() => {
    return ['upi', 'online', 'cash', 'credit', 'pre-paid', 'cash-online'];
  }, []);

  // Simple toggle for filters
  const handleToggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  // Mark filters as initialized since we're using existing data and defaults
  useEffect(() => {
    if (((orders && orders.length > 0) || (deliveryPartners && deliveryPartners.length > 0)) && !filtersInitialized) {
      setFiltersInitialized(true);
    }
  }, [orders, deliveryPartners, filtersInitialized]);

  // Full-page loading overlay
  if (isAnyLoading) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-lg font-semibold text-gray-700">
            {loading ? 'Loading orders...' : 'Loading delivery partners...'}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {loading ? 'Please wait while we fetch your orders' : 'Please wait while we load delivery partners'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <NetworkErrorHandler>
        <div className="min-h-screen bg-[#F5F7FA] pt-16 pb-24">
          <div className="max-w-[1440px] mx-auto px-6 space-y-4">
            <OrdersTopTabs />
            <FilterActionBar />

      {/* Filter Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handleToggleFilters}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            {Object.values(safeFilters).some(v => v !== '') && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {Object.values(safeFilters).filter(v => v !== '').length}
              </span>
            )}
          </button>
          {Object.values(safeFilters).some(v => v !== '') && (
            <button
              onClick={clearAllFilters}
              className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        {showFilters && (
          <div className="bg-white rounded-lg border p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date Range Filter */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                    <div className="relative">
                      <CalendarDatePicker
                        value={safeFilters.startDate}
                        onChange={(date) => handleFilterChange('startDate', date)}
                        label="Start Date"
                        max={safeFilters.endDate || undefined}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Date</label>
                    <div className="relative">
                      <CalendarDatePicker
                        value={safeFilters.endDate}
                        onChange={(date) => handleFilterChange('endDate', date)}
                        label="End Date"
                        min={safeFilters.startDate || undefined}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Status
                </label>
                <select
                  value={safeFilters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                  {orderStatuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Mode Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Mode
                </label>
                <select
                  value={safeFilters.paymentMode}
                  onChange={(e) => handleFilterChange('paymentMode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                  {paymentModes.map(mode => (
                    <option key={mode} value={mode}>
                      {mode.charAt(0).toUpperCase() + mode.slice(1).replace(/-/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Delivery Partner Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Partner
                </label>
                <select
                  value={safeFilters.deliveryPartner}
                  onChange={(e) => handleFilterChange('deliveryPartner', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={deliveryPartnersLoading}
                >
                  <option value="">All</option>
                  {uniqueDeliveryPartners.length > 0 ? (
                    uniqueDeliveryPartners.map(partner => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      {deliveryPartnersLoading ? 'Loading partners...' : 'No partners available'}
                    </option>
                  )}
                </select>
                {deliveryPartnersLoading && (
                  <p className="text-xs text-gray-500 mt-1">Loading partners...</p>
                )}
                {!deliveryPartnersLoading && uniqueDeliveryPartners.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">No delivery partners found</p>
                )}
              </div>
            </div>

            {/* Active Filter Chips */}
            {Object.values(safeFilters).some(v => v !== '') && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {safeFilters.status && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {safeFilters.status.charAt(0).toUpperCase() + safeFilters.status.slice(1).replace(/_/g, ' ')}
                    <button
                      onClick={() => handleFilterChange('status', '')}
                      className="ml-1 hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {safeFilters.paymentMode && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    {safeFilters.paymentMode.charAt(0).toUpperCase() + safeFilters.paymentMode.slice(1).replace(/-/g, ' ')}
                    <button
                      onClick={() => handleFilterChange('paymentMode', '')}
                      className="ml-1 hover:text-purple-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {safeFilters.deliveryPartner && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    {uniqueDeliveryPartners.find(p => p.id === safeFilters.deliveryPartner)?.name || safeFilters.deliveryPartner}
                    <button
                      onClick={() => handleFilterChange('deliveryPartner', '')}
                      className="ml-1 hover:text-green-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {safeFilters.startDate && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                    From: {new Date(safeFilters.startDate).toLocaleDateString()}
                    <button
                      onClick={() => handleFilterChange('startDate', '')}
                      className="ml-1 hover:text-orange-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {safeFilters.endDate && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                    To: {new Date(safeFilters.endDate).toLocaleDateString()}
                    <button
                      onClick={() => handleFilterChange('endDate', '')}
                      className="ml-1 hover:text-orange-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Filter Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Close Filters
              </button>
              <div className="flex gap-2">
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Clear All
                </button>
                <button
                  onClick={handleApplyFilters}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

            {/* Error Display */}
            {(error || deliveryPartnersError) && (
              <ErrorMessage 
                message={error || deliveryPartnersError} 
                isNetworkError={isNetworkError(error || deliveryPartnersError)}
                isServerError={isServerError(error || deliveryPartnersError)}
                onRetry={handleRefresh}
              />
            )}

            {/* Orders Table */}
            {!error && !deliveryPartnersError && !filteringOrders && !loading && (
              <OrdersTable 
                orders={filteredOrders}
                currentPage={pagination?.currentPage || 1}
                totalPages={pagination?.totalPages || 1}
                onPageChange={(p) => dispatch(setCurrentPage(p))}
                isLoading={loading}
              />
            )}
            {(filteringOrders || loading) && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <LoadingSpinner size="large" />
                  <p className="mt-4 text-lg font-semibold text-gray-700">
                    {searchQuery ? 'Searching orders...' : 'Filtering orders...'}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">Please wait while we find your orders</p>
                </div>
              </div>
            )}
            {itemsModal && createPortal(
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setItemsModal(null)}>
                <div className="bg-white rounded-lg shadow-lg max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                  <div className="px-4 py-3 border-b flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Order Items</h3>
                    <button className="text-gray-500 hover:text-gray-700" onClick={() => setItemsModal(null)}>✕</button>
                  </div>
                  <div className="p-4 max-h-80 overflow-auto">
                    {Array.isArray(itemsModal) && itemsModal.length > 0 ? (
                      <ul className="divide-y">
                        {itemsModal.map((it, idx) => (
                          <li key={idx} className="py-2 flex justify-between text-sm">
                            <span className="font-medium text-gray-800">{it.item_name || 'Item'}</span>
                            <span className="text-gray-600">{it.quantity} × ₹{it.price} = ₹{it.totalamount}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-gray-500">No items</div>
                    )}
                  </div>
                </div>
              </div>, document.body)
            }
          </div>
        </div>
      </NetworkErrorHandler>
    </ErrorBoundary>
  );
}
