import React from 'react';
import { Droplets } from 'lucide-react';

export default function WaterNeedToggle({
  value,
  onChange,
  label = "Water Need:",
  className
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <button
        type="button"
        onClick={() => onChange(value === 'Yes' ? 'No' : 'Yes')}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
          value === 'Yes' 
            ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <Droplets className={`w-4 h-4 ${value === 'Yes' ? 'text-white' : 'text-gray-500'}`} />
        <span>Water</span>
      </button>
    </div>
  );
} 