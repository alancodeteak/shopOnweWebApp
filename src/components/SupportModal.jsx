import React, { useState } from 'react';
import { Copy, X } from 'lucide-react';

export default function SupportModal({ open, onClose }) {
  const [copied, setCopied] = useState('');

  if (!open) return null;

  const handleCopy = (value, key) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(''), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-xs mx-auto relative animate-fade-in">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-blue-700 mb-2 text-center">Get Help & Support</h2>
        <p className="text-gray-700 text-sm mb-4 text-center">Please contact the admin section.</p>
        <div className="bg-blue-50 rounded-lg p-3 mb-2">
          <div className="text-xs text-blue-700 font-semibold mb-1">Email</div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-blue-700">info@codeteak.com</span>
            <button
              className="p-1 rounded hover:bg-blue-100 transition"
              onClick={() => handleCopy('info@codeteak.com', 'info')}
              title="Copy Email"
            >
              <Copy className="w-4 h-4 text-blue-500" />
            </button>
            {copied === 'info' && <span className="text-green-600 text-xs ml-1">Copied!</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-700">yadro@codeteak.com</span>
            <button
              className="p-1 rounded hover:bg-blue-100 transition"
              onClick={() => handleCopy('yadro@codeteak.com', 'yaadro')}
              title="Copy Email"
            >
              <Copy className="w-4 h-4 text-blue-500" />
            </button>
            {copied === 'yaadro' && <span className="text-green-600 text-xs ml-1">Copied!</span>}
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-xs text-blue-700 font-semibold mb-1">Phone</div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-700">9995203149</span>
            <button
              className="p-1 rounded hover:bg-blue-100 transition"
              onClick={() => handleCopy('9995203149', 'phone')}
              title="Copy Phone"
            >
              <Copy className="w-4 h-4 text-blue-500" />
            </button>
            {copied === 'phone' && <span className="text-green-600 text-xs ml-1">Copied!</span>}
          </div>
        </div>
      </div>
    </div>
  );
}