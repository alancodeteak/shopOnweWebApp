import { NavLink } from 'react-router-dom';
import { Home, Package, Plus, CheckSquare, Users } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function Sidebar() {
  const { newOrders } = useSelector((state) => state.orders);
  const newOrdersCount = newOrders?.length || 0;

  const linkClass = ({ isActive }) =>
    `flex h-full w-20 items-center justify-center transition-colors ${
      isActive ? 'text-[#2979FF]' : 'text-gray-500 hover:text-[#2979FF]'
    }`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-16">
      <div className="max-w-screen-md w-full mx-auto px-4 h-full flex justify-center">
        <div className="h-16 bg-white rounded-3xl shadow-[0_4px_32px_rgba(41,121,255,0.18),0_1.5px_8px_rgba(0,0,0,0.10)] border border-blue-100 backdrop-blur-md relative" style={{ background: 'linear-gradient(90deg, #f8fbff 0%, #eaf2ff 100%)' }}>
          <div className="flex h-full items-center justify-around">
            {/* Navigation items now include an icon and a text label */}
            <NavLink to="/dashboard" className={linkClass}>
              <div className="flex flex-col items-center" style={{ lineHeight: 1.2 }}>
                <Home className="h-6 w-6" />
                <span className="mt-1 text-[11px] font-medium">Home</span>
              </div>
            </NavLink>
            <NavLink to="/orders" className={linkClass}>
              <div className="flex flex-col items-center relative" style={{ lineHeight: 1.2 }}>
                <Package className="h-6 w-6" />
                {/* Removed newOrdersCount badge */}
                <span className="mt-1 text-[11px] font-medium">all Orders</span>
              </div>
            </NavLink>

            {/* Spacer for the central FAB */}
            <div className="w-16" />

            <NavLink to="/completed" className={linkClass}>
              <div className="flex flex-col items-center" style={{ lineHeight: 1.2 }}>
                <CheckSquare className="h-6 w-6" />
                <span className="mt-1 text-[11px] font-medium">Completed</span>
              </div>
            </NavLink>
            <NavLink to="/delivery-partners" className={linkClass}>
              <div className="flex flex-col items-center" style={{ lineHeight: 1.2 }}>
                <Users className="h-6 w-6" />
                <span className="mt-1 text-[11px] font-medium">Partners</span>
              </div>
            </NavLink>
          </div>

          {/* Central Floating Action Button */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[20%]">
            <NavLink
              to="/orders/create"
              className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#2979FF] text-white shadow-lg transition-transform hover:scale-105"
              aria-label="Create new order"
            >
              <Plus className="h-8 w-8" />
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
