import React from 'react';

export default function UrgencyToggle({
  value,
  onChange,
  label = "Urgency:",
  className
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <div className="relative w-full max-w-xs h-12 bg-white rounded-full flex items-center select-none overflow-hidden shadow-sm mx-auto">
        {/* Sliding indicator */}
        <span
          className={`absolute top-0 left-0 h-full w-1/2 rounded-full bg-blue-500 transition-transform duration-200 ease-in-out z-0 ${
            value === 'Urgent' ? 'translate-x-full' : 'translate-x-0'
          }`}
          style={{ width: '50%' }}
        />
        {/* Normal button */}
        <button
          type="button"
          className={`flex-1 h-full z-10 relative font-bold rounded-full transition-colors duration-150 ${
            value === 'Normal' ? 'text-white' : 'text-black'
          }`}
          onClick={() => onChange('Normal')}
          style={{ outline: 'none' }}
        >
          Normal
        </button>
        {/* Urgent button */}
        <button
          type="button"
          className={`flex-1 h-full z-10 relative font-bold rounded-full transition-colors duration-150 ${
            value === 'Urgent' ? 'text-white' : 'text-black'
          }`}
          onClick={() => onChange('Urgent')}
          style={{ outline: 'none' }}
        >
          Urgent
        </button>
      </div>
    </div>
  );
} 