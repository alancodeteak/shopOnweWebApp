import React from 'react';
import { Search, Loader2 } from 'lucide-react';
import { FormButton } from './index';

export default function PhoneSearchInput({
  value,
  onChange,
  onSearch,
  loading = false,
  error,
  customerFound = false,
  className
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold mb-1">Customer Phone Number</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="tel"
            className="w-full rounded-lg px-3 py-2 shadow-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 pr-10"
            placeholder="Enter phone number"
            value={value}
            onChange={onChange}
            maxLength={10}
          />
          {loading ? (
            <Loader2 className="absolute right-3 top-2.5 text-blue-500 w-5 h-5 animate-spin" />
          ) : (
            <Search className="absolute right-3 top-2.5 text-blue-500 w-5 h-5" />
          )}
        </div>
        <FormButton
          type="button"
          onClick={onSearch}
          disabled={!value || value.length !== 10 || loading}
          loading={loading}
          size="md"
        >
          Search
        </FormButton>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
} 