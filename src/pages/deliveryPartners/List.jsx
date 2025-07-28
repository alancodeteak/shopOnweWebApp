import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllPartners } from '@/store/slices/deliveryPartnerSlice';
import { RefreshCw, Plus, Home, Package, Users, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';

export default function DeliveryPartnerList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const partners = useSelector((state) => state.deliveryPartners.list);
  const loading = useSelector((state) => state.deliveryPartners.loading);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    dispatch(fetchAllPartners());
  }, [dispatch]);

  const filteredPartners = partners.filter((p) => {
    const name = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase());
    const matchesFilter =
      filter === 'All' ||
      (filter === 'Online' && p.online_status === 'online') ||
      (filter === 'Offline' && p.online_status === 'offline');
    return matchesSearch && matchesFilter;
  });

  return (
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
        <button onClick={() => dispatch(fetchAllPartners())} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition self-end xs:self-auto">
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

      {/* Partner List */}
      <div className="px-1 sm:px-2 mt-2 space-y-2 sm:space-y-3">
        {filteredPartners.map((partner) => (
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
                className="text-blue-600 underline text-xs mt-1"
              >
                Click to view details
              </button>
            </div>
            <img
              src={partner.photo || 'https://ui-avatars.com/api/?name=DP'}
              alt={partner.first_name}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border ml-2 flex-shrink-0"
              onError={e => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=DP'; }}
            />
          </div>
        ))}
        {!loading && filteredPartners.length === 0 && (
          <div className="text-center text-gray-400 mt-8 text-sm">No partners found.</div>
        )}
      </div>

      {/* Add Partner Button inside container */}
      <div className="flex justify-end max-w-screen-md mx-auto mt-8 pr-2 sm:pr-4">
        <button
          onClick={() => navigate('/delivery-partners/create')}
          className="bg-blue-500 text-white rounded-full shadow-lg flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 font-semibold text-sm sm:text-base"
        >
          <Plus size={20} className="sm:w-5 sm:h-5 w-4 h-4" /> Add Partner
        </button>
      </div>
      
      {/* Powered by Codeteak */}
      <div className="flex flex-col items-center mt-12 mb-4">
        <span className="text-xs text-blue-500 mb-1">Powered by</span>
        <img src="/assets/codeteak-logo.png" alt="Codeteak Logo" className="h-4 object-contain mt-1 md:mt-2" />
      </div>
    </div>
  );
}
