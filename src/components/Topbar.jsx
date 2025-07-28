import { useSelector } from 'react-redux';

export default function TabBar({ activeTab, setActiveTab, pillSize }) {
  const tabs = ['New Orders', 'Ongoing', 'Tickets'];
  const newOrdersCount = useSelector((state) => state.orders.newOrders?.length || 0);
  const pillClass = pillSize === 'small'
    ? 'px-3 py-2 rounded-full text-xs sm:px-4 sm:py-2.5 sm:text-sm'
    : 'px-5 py-3 rounded-full text-base';

  return (
    <div className="flex justify-between gap-2 mb-4 w-full max-w-xs mx-auto">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`relative transition font-medium ${pillClass}
            ${
              activeTab === tab
                ? 'bg-blue-600 text-white font-semibold shadow'
                : 'text-black hover:text-blue-600 bg-gray-100'
            }
          `}
        >
          <span className="relative inline-block">
          {tab}
            {tab === 'New Orders' && newOrdersCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow">
                {newOrdersCount > 99 ? '99+' : newOrdersCount}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
