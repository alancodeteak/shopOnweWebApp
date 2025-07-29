import { useSelector } from 'react-redux';

export default function TabBar({ activeTab, setActiveTab, pillSize }) {
  const tabs = ['New Orders', 'Ongoing', 'Tickets'];
  const newOrdersCount = useSelector((state) => state.orders.newOrders?.length || 0);
  const pillClass = pillSize === 'small'
    ? 'px-2 py-1.5 rounded-full text-[10px] sm:px-3 sm:py-2 sm:text-xs md:px-4 md:py-2.5 md:text-sm'
    : 'px-5 py-3 rounded-full text-base';

  return (
    <div className="flex justify-between gap-1 sm:gap-2 mt-4 mb-4 w-full max-w-[280px] sm:max-w-xs mx-auto">
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
              <span className="absolute -top-1.5 -right-3 sm:-top-2 sm:-right-4 bg-red-500 text-white text-[8px] sm:text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center shadow">
                {newOrdersCount > 99 ? '99+' : newOrdersCount}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
