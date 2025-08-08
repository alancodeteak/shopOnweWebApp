import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const tabs = [
  { label: 'New Orders', to: '/orders/new' },
  { label: 'Ongoing', to: '/orders/ongoing' },
  { label: 'All Orders', to: '/orders' },
  { label: 'Completed', to: '/completed' },
  { label: 'Tickets', to: '/tickets' },
];

export default function OrdersTopTabs() {
  const { pathname } = useLocation();

  const isActive = (to) => {
    if (to === '/orders') return pathname === '/orders';
    return pathname.startsWith(to);
  };

  return (
    <div className="w-full bg-white shadow-sm border border-gray-100 rounded-lg">
      <div className="flex gap-4 px-4 md:px-6 h-16 items-end">
        {tabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to} className="pb-3">
            <span
              className={`text-sm md:text-[14px] font-medium pb-3 inline-block border-b-4 transition-colors ${
                isActive(tab.to)
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-blue-600'
              }`}
            >
              {tab.label}
            </span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}


