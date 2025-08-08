import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function FilterActionBar({
  dateValue,
  onDateChange,
  searchValue,
  onSearchChange,
}) {
  const navigate = useNavigate();
  return (
    <div className="w-full bg-white h-16 rounded-lg shadow-sm border border-gray-100 flex items-center px-4 md:px-6 gap-3">
      {/* Date picker placeholder (use native for now; can swap to existing CalendarDatePicker later) */}
      <input
        type="date"
        value={dateValue || ''}
        onChange={(e) => onDateChange && onDateChange(e.target.value)}
        className="h-9 w-40 border border-gray-300 rounded-md px-3 text-sm"
      />
      {/* Search */}
      <input
        type="text"
        placeholder="Type a command or search…"
        value={searchValue || ''}
        onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
        className="h-9 w-56 border border-gray-300 rounded-md px-3 text-sm"
      />
    </div>
  );
}


