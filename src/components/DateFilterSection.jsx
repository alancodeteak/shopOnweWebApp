import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Calendar, X } from 'lucide-react';
import { clearDateFilter, setTodayFilter } from '@/store/slices/ordersSlice';

export default function DateFilterSection() {
  const dispatch = useDispatch();
  const { isToday } = useSelector((state) => state.orders.dateFilter);

  const handleTodayFilter = () => {
    dispatch(setTodayFilter());
  };

  const handleClearFilter = () => {
    dispatch(clearDateFilter());
  };

  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filter by Date:</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleTodayFilter}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isToday
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Today
          </button>
          
          {isToday && (
            <button
              onClick={handleClearFilter}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>
      
      {isToday && (
        <div className="mt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            <span>Today's Orders</span>
            <button onClick={handleClearFilter} className="p-0.5 hover:bg-blue-200 rounded-full">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}