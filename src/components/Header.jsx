import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Menu, Transition } from '@headlessui/react';
import { RefreshCw, User, LogOut, BarChart2 } from 'lucide-react';
import { Fragment } from 'react';
import { logout } from '@/store/slices/authSlice';

export default function Header({ title }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="max-w-screen-md mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <img src="/assets/yadro-logo-blue.png" alt="Yadro Logo" className="h-9 w-9 rounded-lg object-contain" />
          <h1 className="text-lg font-bold text-gray-800">{title}</h1>
        </div>
        
        <div className="flex items-center gap-4">
         

          <Menu as="div" className="relative">
            <Menu.Button
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
              tabIndex={0}
              aria-label="Open profile menu"
            >
              <User className="w-5 h-5" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 min-w-[12rem] origin-top-right z-50 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => navigate('/profile')}
                        className={`${
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        <User className="mr-2 h-5 w-5" aria-hidden="true" />
                        Profile
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => navigate('/dashboard/analytics')}
                        className={`${
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        <BarChart2 className="mr-2 h-5 w-5" aria-hidden="true" />
                        Analytics
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${
                          active ? 'bg-red-50 text-red-700' : 'text-gray-700'
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        <LogOut className="mr-2 h-5 w-5 text-red-600" aria-hidden="true" />
                        Logout
        </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
}
