import { useState } from 'react';
import { Copy, Phone } from 'lucide-react';
import { toast } from 'react-toastify';

export default function TicketCard({ ticket, onAccept, onReject, onCall }) {
  const [notes, setNotes] = useState('');

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 border w-full mb-4">
      {/* Card Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-lg text-gray-800">Ticket #{ticket.id}</h2>
          <button onClick={() => copyToClipboard(ticket.id, 'Ticket ID')}>
            <Copy className="w-4 h-4 text-gray-400 hover:text-blue-600" />
          </button>
        </div>
        <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase">
          {ticket.status}
        </span>
      </div>

      {/* Main Content */}
      <div className="relative">
        <div className="pr-28"> {/* Padding to avoid overlap with call button */}
            <p className="font-bold text-gray-800">Order #{ticket.order_id}</p>
            <p className="text-sm text-blue-600 font-semibold">
              Partner ID: {ticket.delivery_partner.id}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Created: {new Date(ticket.created_at).toLocaleString()}
            </p>
            <p className="mt-2 text-sm text-gray-700">
              <span className="font-semibold">Reason:</span> {ticket.reason}
            </p>
        </div>
        
        <div className="absolute top-0 right-0">
          <button 
            onClick={() => onCall(ticket.delivery_partner.phone)}
            className="flex items-center gap-2 bg-blue-500 text-white font-semibold text-sm px-3 py-2 rounded-lg shadow-sm hover:bg-blue-600 transition"
          >
            <Phone size={14} />
            Call Partner
          </button>
        </div>
      </div>

      {/* Image */}
      {ticket.image && (
        <div className="mt-4">
          <p className="font-semibold text-sm mb-2 text-gray-700">Image:</p>
          <img 
            src={ticket.image} 
            alt="Ticket" 
            className="rounded-lg object-cover w-full h-auto max-h-60" 
          />
        </div>
      )}

      {/* Resolution Notes */}
      <div className="mt-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">Resolution Notes:</label>
        <textarea
          className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows={2}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Enter your reply or resolution notes here..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <button 
          onClick={() => onAccept(ticket.id, notes)}
          className="flex-1 bg-green-500 text-white font-bold py-3 rounded-full shadow-md hover:bg-green-600 transition"
        >
          ACCEPT
        </button>
        <button 
          onClick={() => onReject(ticket.id, notes)}
          className="flex-1 bg-red-500 text-white font-bold py-3 rounded-full shadow-md hover:bg-orange-600 transition"
        >
          REJECT
        </button>
      </div>
    </div>
  );
} 