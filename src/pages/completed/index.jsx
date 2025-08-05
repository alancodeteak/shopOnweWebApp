import { useState, useEffect, useMemo, useCallback, useRef } from 'react';


import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Filter, X, Calendar } from 'lucide-react';
import { LoadingSpinner, ErrorMessage, EmptyState, ErrorBoundary, NetworkErrorHandler } from '@/components';
import { PageContainer, PageHeader } from '@/components';
import { OrderSearchInput } from '@/components/forms';
import OrderCard from '@/components/OrderCard';
import { fetchOrdersByStatus, searchOrders, setCurrentPage, resetPagination, setUIFilter, clearUIFilters, setSearchQuery } from '@/store/slices/ordersSlice';
import { fetchAllPartners } from '@/store/slices/deliveryPartnerSlice';
import { isNetworkError, isServerError } from '@/utils/errorHandler';
import CalendarDatePicker from '@/components/CalendarDatePicker';

export default function CompletedOrders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const shopId = useSelector((state) => state.auth.user?.shopId);
  
  // Use search results for all completed orders
  const completedOrders = useSelector((state) => state.orders.list);
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
    paymentVerification: '',
    deliveryPartner: '',
    paymentMode: '',
    startDate: '',
    endDate: ''
  };
  
  // Ensure filters is always an object
  const safeFilters = typeof filters === 'object' && filters !== null ? filters : {
    paymentVerification: '',
    deliveryPartner: '',
    paymentMode: '',
    startDate: '',
    endDate: ''
  };
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const [filteringOrders, setFilteringOrders] = useState(false);
  



  
  // Update hasMore based on pagination
  useEffect(() => {
    if (pagination && pagination.totalPages) {
      const newHasMore = currentPage < pagination.totalPages;
      setHasMore(newHasMore);
    } else {
      // Default to true if no pagination data
      setHasMore(true);
    }
  }, [pagination, currentPage]);

  // Determine if any loading is happening
  const isAnyLoading = loading || deliveryPartnersLoading;

  // Load delivery partners on component mount
  useEffect(() => {
    dispatch(fetchAllPartners());
  }, [dispatch]);

  // Load completed orders using search API with "Delivered" status
  useEffect(() => {
    if (shopId) {
      dispatch(searchOrders({
        query: '',
        shopId,
        page: 1,
        limit: 10,
        filters: { status: 'Delivered' }
      }));
    }
  }, [dispatch, shopId]);

  // Handle pagination - use search API for all pages
  useEffect(() => {
    if (shopId && currentPage > 1) {
      
      // Build filters based on current state
      const apiFilters = { status: 'Delivered' };
      
      // Add other filters
      if (filters.paymentVerification) {
        apiFilters.verificationStatus = [filters.paymentVerification === 'verified' ? 'verified' : 'non-verified'];
      }
      
      if (filters.paymentMode) {
        apiFilters.payment_mode = filters.paymentMode;
      }
      
      if (filters.deliveryPartner) {
        apiFilters.dpid = filters.deliveryPartner;
      }
      
      if (filters.startDate) {
        apiFilters.start_date = filters.startDate;
      }
      
      if (filters.endDate) {
        apiFilters.end_date = filters.endDate;
      }
      

      
      dispatch(searchOrders({
        query: searchQuery,
        shopId,
        page: currentPage,
        limit: 10,
        filters: apiFilters
      }));
    }
  }, [dispatch, shopId, currentPage, searchQuery, safeFilters]);
  

  
  // Reset loading more flag when loading completes
  useEffect(() => {
    if (!loading && isLoadingMore) {
      setIsLoadingMore(false);
    }
  }, [loading, isLoadingMore]);



  const handleLoadMore = () => {
    if (hasMore && !loading) {
      dispatch(setCurrentPage(currentPage + 1));
    }
  };

  const handleRefresh = () => {
    if (shopId) {
      dispatch(resetPagination());
      setHasMore(true);
      setIsLoadingMore(false);
      // Clear search and filters
      dispatch(setSearchQuery(''));
      dispatch(clearUIFilters());
      dispatch(searchOrders({
        query: '',
        shopId,
        page: 1,
        limit: 10,
        filters: { status: 'Delivered' }
      }));
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
    // Switch back to normal completed orders fetching
    if (shopId) {
      dispatch(searchOrders({
        query: '',
        shopId,
        page: 1,
        limit: 10,
        filters: { status: 'Delivered' }
      }));
    }
  }, [dispatch, shopId]);

  const handleApplyFilters = useCallback(() => {
    if (shopId) {
      dispatch(resetPagination());
      setFilteringOrders(true);
      
      // Build filters for search API
      const apiFilters = { status: 'Delivered' };
      
      // Add other filters
      if (safeFilters.paymentVerification) {
        apiFilters.verificationStatus = [safeFilters.paymentVerification === 'verified' ? 'verified' : 'non-verified'];
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
      
      // Reset filtering flag after a delay
      setTimeout(() => {
        setFilteringOrders(false);
      }, 500);
    }
  }, [dispatch, shopId, safeFilters, searchQuery]);



  // Orders are already filtered by the search API, just return them
  const filteredOrders = useMemo(() => {
    return completedOrders || [];
  }, [completedOrders]);

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

  const uniquePaymentModes = useMemo(() => {
    // Use hardcoded values from the ENUM model
    return ['upi', 'online', 'cash', 'credit', 'pre-paid', 'cash-online'];
  }, []);

  // Simple toggle for filters
  const handleToggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  // Mark filters as initialized since we're using existing data and defaults
  useEffect(() => {
    if (((completedOrders && completedOrders.length > 0) || (deliveryPartners && deliveryPartners.length > 0)) && !filtersInitialized) {
      setFiltersInitialized(true);
    }
  }, [completedOrders, deliveryPartners, filtersInitialized]);

  // Full-page loading overlay
  if (isAnyLoading) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-lg font-semibold text-gray-700">
            {loading ? 'Loading completed orders...' : 'Loading delivery partners...'}
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
        <PageContainer>
      <PageHeader 
        title="Completed Orders" 
        onBack={() => navigate(-1)} 
        onRefresh={handleRefresh}
        isLoading={false}
      />
      
      {/* Search Bar */}
      <div className="mb-6">
        <OrderSearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={handleSearchClear}
          placeholder="Search by customer name, phone, or order ID..."
        />
      </div>

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
              {/* Payment Verification Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Verification
                </label>
                <select
                  value={safeFilters.paymentVerification}
                  onChange={(e) => handleFilterChange('paymentVerification', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                  <option value="verified">Verified</option>
                  <option value="non-verified">Non-Verified</option>
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
                  {uniquePaymentModes.map(mode => (
                    <option key={mode} value={mode}>
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
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
                {safeFilters.paymentVerification && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {safeFilters.paymentVerification === 'verified' ? 'Verified' : 'Non-Verified'}
                    <button
                      onClick={() => handleFilterChange('paymentVerification', '')}
                      className="ml-1 hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {safeFilters.paymentMode && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    {safeFilters.paymentMode.charAt(0).toUpperCase() + safeFilters.paymentMode.slice(1)}
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

      {/* Orders List */}
      {!error && !deliveryPartnersError && (
        <>
                      {filteringOrders || loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <LoadingSpinner size="large" />
                <p className="mt-4 text-lg font-semibold text-gray-700">
                  {searchQuery ? 'Searching orders...' : 'Filtering orders...'}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Please wait while we find your orders
                </p>
              </div>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <OrderCard key={order.order_id} order={order} />
              ))}
              

              
              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center py-4 px-2 sm:px-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    {/* Previous button */}
                    <button
                      onClick={() => dispatch(setCurrentPage(Math.max(1, currentPage - 1)))}
                      disabled={currentPage === 1 || loading}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    
                    {/* Page numbers - Smart pagination */}
                    {(() => {
                      const totalPages = pagination.totalPages;
                      const currentPageNum = currentPage;
                      const pages = [];
                      
                      if (totalPages <= 7) {
                        // Show all pages if 7 or fewer
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        // Smart pagination for more than 7 pages
                        if (currentPageNum <= 4) {
                          // Near the beginning: show 1,2,3,4,5,...,last
                          for (let i = 1; i <= 5; i++) {
                            pages.push(i);
                          }
                          pages.push('...');
                          pages.push(totalPages);
                        } else if (currentPageNum >= totalPages - 3) {
                          // Near the end: show 1,...,last-4,last-3,last-2,last-1,last
                          pages.push(1);
                          pages.push('...');
                          for (let i = totalPages - 4; i <= totalPages; i++) {
                            pages.push(i);
                          }
                        } else {
                          // In the middle: show 1,...,current-1,current,current+1,...,last
                          pages.push(1);
                          pages.push('...');
                          pages.push(currentPageNum - 1);
                          pages.push(currentPageNum);
                          pages.push(currentPageNum + 1);
                          pages.push('...');
                          pages.push(totalPages);
                        }
                      }
                      
                      return pages.map((pageNum, index) => {
                        if (pageNum === '...') {
                          return (
                            <span key={`ellipsis-${index}`} className="px-1 sm:px-2 text-gray-400 text-xs sm:text-sm">
                              ...
                            </span>
                          );
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => dispatch(setCurrentPage(pageNum))}
                            disabled={loading}
                            className={`px-1.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md min-w-[28px] sm:min-w-[36px] ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {pageNum}
                          </button>
                        );
                      });
                    })()}
                    
                    {/* Next button */}
                    <button
                      onClick={() => dispatch(setCurrentPage(Math.min(pagination.totalPages, currentPage + 1)))}
                      disabled={currentPage === pagination.totalPages || loading}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
              

              

            </div>
          ) : (
            <EmptyState
              icon={CheckCircle}
              title={searchQuery || Object.values(safeFilters).some(v => v !== '') ? "No orders found" : "No completed orders"}
              description={
                searchQuery || Object.values(safeFilters).some(v => v !== '') 
                  ? "Try adjusting your search or filters to find more orders."
                  : "You don't have any completed orders yet."
              }
            />
          )}
        </>
      )}
        </PageContainer>
      </NetworkErrorHandler>
    </ErrorBoundary>
  );
}
