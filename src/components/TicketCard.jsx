import { useState } from 'react';
import { Copy, Phone } from 'lucide-react';
import { toast } from 'react-toastify';
import Card from '@/components/Card';
import StatusBadge from '@/components/StatusBadge';
import { FormTextarea, FormButton } from '@/components/forms';

export default function TicketCard({ ticket, onAccept, onReject, onCall }) {
  const [notes, setNotes] = useState('');

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  return (
    <Card className="w-full mb-4">
      {/* Card Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-lg text-gray-800">Ticket #{ticket.id}</h2>
          <button onClick={() => copyToClipboard(ticket.id, 'Ticket ID')}>
            <Copy className="w-4 h-4 text-gray-400 hover:text-blue-600" />
          </button>
        </div>
        <StatusBadge status={ticket.status} variant="pill" />
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
          <FormButton
            onClick={() => onCall(ticket.delivery_partner.phone)}
            icon={Phone}
            size="sm"
          >
            Call Partner
          </FormButton>
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
        <FormTextarea
          label="Resolution Notes"
          placeholder="Enter your reply or resolution notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          showCounter={false}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <FormButton
          onClick={() => onAccept(ticket.id, notes)}
          variant="primary"
          fullWidth
          size="lg"
        >
          ACCEPT
        </FormButton>
        <FormButton
          onClick={() => onReject(ticket.id, notes)}
          variant="danger"
          fullWidth
          size="lg"
        >
          REJECT
        </FormButton>
      </div>
    </Card>
  );
} 