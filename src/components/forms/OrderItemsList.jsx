import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { FormButton } from './index';

export default function OrderItemsList({
  items,
  onAddItem,
  onRemoveItem,
  onItemChange,
  error,
  className
}) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-semibold">Order Items</label>
        <FormButton
          type="button"
          variant="primary"
          size="sm"
          onClick={onAddItem}
          icon={Plus}
        >
          Add Item
        </FormButton>
      </div>
      
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2 mb-2 items-end w-full">
          <input
            type="text"
            className="flex-1 rounded-lg px-2 py-1 shadow-sm text-black bg-white w-full"
            placeholder="Item Name"
            value={item.item_name}
            onChange={(e) => onItemChange(idx, 'item_name', e.target.value)}
          />
          <input
            type="number"
            className="w-16 rounded-lg px-2 py-1 shadow-sm text-black bg-white"
            placeholder="Qty"
            min={1}
            value={item.quantity}
            onChange={(e) => onItemChange(idx, 'quantity', e.target.value.replace(/\D/g, ''))}
          />
          <input
            type="number"
            className="w-20 rounded-lg px-2 py-1 shadow-sm text-black bg-white"
            placeholder="Price"
            min={0}
            step="0.01"
            value={item.price}
            onChange={(e) => onItemChange(idx, 'price', e.target.value)}
          />
          <span className="w-20 text-xs text-blue-500 font-bold">
            {item.totalamount ? `₹${item.totalamount}` : ''}
          </span>
          {items.length > 1 && (
            <button
              type="button"
              className="p-1 bg-red-500 rounded-full hover:bg-red-600 transition"
              onClick={() => onRemoveItem(idx)}
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      ))}
      
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
} 