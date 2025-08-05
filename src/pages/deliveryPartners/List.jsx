import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllPartners, setCurrentPage, resetPagination } from '@/store/slices/deliveryPartnerSlice';
import { RefreshCw, Plus, Home, Package, Users, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner, ErrorMessage, ErrorBoundary, NetworkErrorHandler } from '@/components';
import PageHeader from '@/components/PageHeader';
import { isNetworkError, isServerError } from '@/utils/errorHandler';
import { getImageUrl, createInitialsAvatar } from '@/utils/imageUtils';



export default function DeliveryPartnerList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const partners = useSelector((state) => state.deliveryPartners.list);
  const loading = useSelector((state) => state.deliveryPartners.loading);
  const error = useSelector((state) => state.deliveryPartners.error);
  const pagination = useSelector((state) => state.deliveryPartners.pagination);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  // Pagination state - use persisted state from Redux
  const currentPage = useSelector((state) => state.deliveryPartners.pagination?.currentPage) || 1;

  useEffect(() => {
    dispatch(fetchAllPartners({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);

  const handleRefresh = () => {
    dispatch(resetPagination());
    dispatch(fetchAllPartners({ page: 1, limit: 10 }));
  };

  const filteredPartners = Array.isArray(partners) ? partners.filter((p) => {
    const name = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase());
    const matchesFilter =
      filter === 'All' ||
      (filter === 'Online' && p.online_status === 'online') ||
      (filter === 'Offline' && p.online_status === 'offline');
    return matchesSearch && matchesFilter;
  }) : [];

  return (
    <ErrorBoundary>
      <NetworkErrorHandler>
        <div className="min-h-screen bg-white max-w-screen-md mx-auto pt-16 pb-24 px-4">
      <PageHeader title="Delivery Partners" />
      
      {/* Search Bar */}
      <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 pt-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by Partner Name"
          className="flex-1 rounded-full border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-0"
        />
        <button onClick={handleRefresh} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition self-end xs:self-auto">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mt-3 mb-2 px-1">
        {['All', 'Online', 'Offline'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 sm:px-4 py-1 rounded-full border transition font-medium text-xs sm:text-sm whitespace-nowrap ${
              filter === tab
                ? 'bg-blue-100 text-blue-700 border-blue-500'
                : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Error Handling */}
      {error && (
        <ErrorMessage 
          message={error} 
          isNetworkError={isNetworkError(error)}
          isServerError={isServerError(error)}
          onRetry={handleRefresh}
        />
      )}

      {/* Partner List */}
      {loading && <LoadingSpinner size="large" message="Loading delivery partners..." />}
      <div className="px-1 sm:px-2 mt-2 space-y-2 sm:space-y-3">
        {!loading && !error && filteredPartners.map((partner) => (
          <div
            key={partner.delivery_partner_id}
            className="bg-white border rounded-xl shadow-sm flex flex-row items-center justify-between px-2 sm:px-4 py-2 sm:py-3 gap-2"
          >
            <div className="flex-1 w-full min-w-0">
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <span className="font-bold text-sm sm:text-base truncate">{partner.first_name} {partner.last_name}</span>
                {partner.online_status === 'online' && (
                  <span className="ml-1 flex items-center gap-1 text-green-600 font-semibold text-xs">
                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block" /> ONLINE
                  </span>
                )}
                <span className="ml-1 text-xs text-gray-500 truncate">Current Status: <span className="font-semibold">{partner.current_status}</span></span>
              </div>
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Package size={12} /> Partner ID
                </span>
                <span className="ml-1 font-semibold">{partner.delivery_partner_id}</span>
              </div>
              <button
                onClick={() => navigate(`/delivery-partners/${partner.delivery_partner_id}`)}
                className="text-blue-600 hover:text-blue-800 text-xs font-medium mt-1"
              >
                View Details →
              </button>
            </div>
            <div className="flex-shrink-0">
              <img
                src={getImageUrl(partner.photo_url) || createInitialsAvatar(partner.first_name, partner.last_name)}
                alt={`${partner.first_name} ${partner.last_name}`}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                onError={e => { 
                  e.target.onerror = null; 
                  e.target.src = createInitialsAvatar(partner.first_name, partner.last_name);
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {!loading && !error && pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex flex-col items-center">
          {/* Pagination Info */}
          <div className="text-sm text-gray-600 mb-3">
            Showing page {pagination.currentPage} of {pagination.totalPages} 
            ({pagination.totalCount} total partners)
          </div>
          
          {/* Pagination Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
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

      {/* Empty State */}
      {!loading && !error && filteredPartners.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Delivery Partners Found</h3>
          <p className="text-gray-500 mb-4">
            {search || filter !== 'All' 
              ? 'No partners match your search criteria.' 
              : 'No delivery partners have been added yet.'
            }
          </p>
          <button
            onClick={() => navigate('/delivery-partners/create')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add First Partner
          </button>
        </div>
      )}
        </div>
      </NetworkErrorHandler>
    </ErrorBoundary>
  );
}
