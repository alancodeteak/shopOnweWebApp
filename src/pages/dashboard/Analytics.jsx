import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOverview } from '@/store/slices/overviewSlice';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { ArrowLeft, RefreshCw, Box, Truck, Gauge, Clock, Users, XCircle, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const periodOptions = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
];

const cardIconBg = {
  total: 'bg-green-100 text-green-600',
  delivered: 'bg-yellow-100 text-yellow-600',
  efficiency: 'bg-purple-100 text-purple-600',
  avgTime: 'bg-blue-100 text-blue-600',
  pending: 'bg-yellow-100 text-yellow-600',
  cancelled: 'bg-red-100 text-red-600',
  partners: 'bg-purple-100 text-purple-600',
};

export default function Analytics() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, loading } = useSelector((state) => state.overview);
  const user = useSelector((state) => state.auth.user);
  const shopId = user?.shopId;

  const [period, setPeriod] = useState('month');

  useEffect(() => {
    if (shopId) {
      dispatch(fetchOverview({ shopId, period }));
    }
  }, [dispatch, shopId, period]);

  // Donut chart data
  const donutData = {
    labels: ['Delivered', 'Pending', 'Cancelled'],
    datasets: [
      {
        data: [data?.deliveredOrders || 0, data?.pendingOrders || 0, data?.cancelledOrders || 0],
        backgroundColor: ['#22c55e', '#facc15', '#ef4444'],
        borderWidth: 2,
      },
    ],
  };

  // Calculate days and orders per day for the trend
  const periodDays = period === 'today' ? 1 : period === 'week' ? 7 : 30;
  const trendLabels = Array.from({ length: periodDays }, (_, i) => {
    if (period === 'today') return 'Today';
    if (period === 'week') return `Day ${i + 1}`;
    return `Day ${i + 1}`;
  });
  let ordersPerDay = Array(periodDays).fill(0);
  if (data?.totalOrders > 0) {
    const base = Math.floor(data.totalOrders / periodDays);
    const remainder = data.totalOrders % periodDays;
    for (let i = 0; i < periodDays; i++) {
      ordersPerDay[i] = base + (i < remainder ? 1 : 0);
    }
  }
  const lineData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Orders',
        data: ordersPerDay,
        fill: true,
        backgroundColor: 'rgba(59,130,246,0.15)', // blue-500 with opacity
        borderColor: '#3b82f6', // blue-500
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-blue-500 pt-16 pb-24">
      <div className="max-w-screen-md mx-auto px-4">
        <PageHeader
          title="Analytics Dashboard"
          onBack={() => navigate(-1)}
          onRefresh={() => dispatch(fetchOverview({ shopId, period }))}
        />

        {/* Filter Tabs */}
        <div className="flex justify-center gap-2 mb-4 mt-2">
          {periodOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-4 py-1 rounded-full border transition-all font-medium text-sm focus:outline-none ${
                period === opt.value
                  ? 'bg-white text-blue-500 shadow'
                  : 'bg-transparent border-white text-white hover:bg-white/10'
              }`}
              style={{ minWidth: 90 }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4 md:grid-cols-4">
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <span className={`p-2 rounded-full ${cardIconBg.total} mb-2`}><Box className="w-6 h-6" /></span>
            <div className="text-2xl font-bold text-gray-800">{loading ? '-' : data?.totalOrders || 0}</div>
            <div className="text-xs text-gray-500">Total Orders</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <span className={`p-2 rounded-full ${cardIconBg.delivered} mb-2`}><Truck className="w-6 h-6" /></span>
            <div className="text-2xl font-bold text-gray-800">{loading ? '-' : data?.deliveredOrders || 0}</div>
            <div className="text-xs text-gray-500">Delivered</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center col-span-2 md:col-span-1">
            <span className={`p-2 rounded-full ${cardIconBg.efficiency} mb-2`}><Gauge className="w-6 h-6" /></span>
            <div className="text-2xl font-bold text-gray-800">{loading ? '-' : data?.totalOrders ? `${Math.round((data.deliveredOrders / data.totalOrders) * 100)}%` : '0%'}</div>
            <div className="text-xs text-gray-500 text-center">Orders delivered successfully ({periodOptions.find(p => p.value === period)?.label})</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center col-span-2 md:col-span-1">
            <span className={`p-2 rounded-full ${cardIconBg.avgTime} mb-2`}><Clock className="w-6 h-6" /></span>
            <div className="text-2xl font-bold text-gray-800">{loading ? '-' : data?.averageDeliveryTime || 'N/A'}</div>
            <div className="text-xs text-gray-500 text-center">On-time delivery rate: {data?.onTimeDeliveryRate || 'N/A'}</div>
          </div>
        </div>

        {/* Order Status Section */}
        <div className="bg-white rounded-xl shadow mx-2 md:mx-4 mb-4 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold text-gray-800">Order Status</div>
            <div className="text-xs text-gray-500">{data?.totalOrders || 0} orders</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 md:w-40 md:h-40 mb-2 flex items-center justify-center">
              <Doughnut
                data={donutData}
                options={{
                  cutout: '70%',
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true },
                  },
                  maintainAspectRatio: false,
                  responsive: true,
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-xl font-bold text-gray-800">{data?.totalOrders ? `${Math.round((data.deliveredOrders / data.totalOrders) * 100)}%` : '0%'}</div>
                <div className="text-xs text-gray-500">Efficiency</div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Delivered</div>
              <div className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span> Pending</div>
              <div className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Cancelled</div>
            </div>
          </div>
        </div>

        {/* Breakdown Cards */}
        <div className="grid grid-cols-2 gap-3 px-2 md:px-4 mb-4 md:grid-cols-3">
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <span className={`p-2 rounded-full ${cardIconBg.pending} mb-2`}><Clock className="w-6 h-6" /></span>
            <div className="text-2xl font-bold text-gray-800">{loading ? '-' : data?.pendingOrders || 0}</div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <span className={`p-2 rounded-full ${cardIconBg.cancelled} mb-2`}><XCircle className="w-6 h-6" /></span>
            <div className="text-2xl font-bold text-gray-800">{loading ? '-' : data?.cancelledOrders || 0}</div>
            <div className="text-xs text-gray-500">Cancelled</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <span className={`p-2 rounded-full ${cardIconBg.partners} mb-2`}><Users className="w-6 h-6" /></span>
            <div className="text-2xl font-bold text-gray-800">{loading ? '-' : data?.activePartners || 0}</div>
            <div className="text-xs text-gray-500 text-center">Delivery Partners Out for Delivery</div>
          </div>
        </div>

        {/* Orders Trend */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="font-bold text-gray-800 mb-1">Orders Trend</div>
          <div className="text-xs text-gray-500 mb-2">Order trend for this {periodOptions.find(p => p.value === period)?.label?.toLowerCase()}</div>
          <div className="relative w-full h-40 md:h-56">
            {data?.totalOrders > 0 ? (
              <Line
                data={lineData}
                options={{
                  plugins: { legend: { display: false } },
                  maintainAspectRatio: false,
                  responsive: true,
                  scales: {
                    x: { grid: { display: false }, ticks: { color: '#64748b' } },
                    y: { grid: { color: '#e5e7eb' }, ticks: { color: '#64748b' } },
                  },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No data available</div>
            )}
          </div>
        </div>
        
        {/* Powered by Codeteak */}
        <div className="flex flex-col items-center mt-12 mb-4">
          <span className="text-xs text-white mb-1">Powered by</span>
          <img src="/assets/codeteak-logo.png" alt="Codeteak Logo" className="h-4 object-contain mt-1 md:mt-2" />
        </div>
      </div>
    </div>
  );
} 