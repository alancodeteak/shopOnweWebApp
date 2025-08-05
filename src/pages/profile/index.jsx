import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Copy } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useNavigate } from 'react-router-dom';
import { ErrorBoundary, NetworkErrorHandler } from '@/components';
import SupportModal from '@/components/SupportModal';

export default function Profile() {
  const user = useSelector((state) => state.auth.user);
  const [copied, setCopied] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) return <div className="text-center py-12 text-gray-500">No profile data found.</div>;

  const handleCopy = () => {
    navigator.clipboard.writeText(user.shopId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <ErrorBoundary>
      <NetworkErrorHandler>
        <div className="min-h-screen bg-blue-50 pt-16 pb-24">
      <div className="max-w-screen-md mx-auto px-4">
        <PageHeader title="Profile" onBack={() => navigate(-1)} />
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md mx-auto mt-6">
          <div className="space-y-4">
            <div>
              <div className="text-xs text-gray-500">Shop Name</div>
              <div className="font-semibold text-gray-800">{user.name}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Shop ID</div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-blue-600 text-sm break-all">{user.shopId}</span>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded hover:bg-blue-100 transition"
                  title="Copy Shop ID"
                >
                  <Copy className="w-4 h-4 text-blue-500" />
                </button>
                {copied && <span className="text-green-600 text-xs ml-1">Copied!</span>}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Role</div>
              <div className="font-semibold text-gray-800 capitalize">{user.role.replace('_', ' ')}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Automated Assignment</div>
              <div className="font-semibold text-gray-800">{user.auto_assigned ? 'Enabled' : 'Disabled'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Automated Shop</div>
              <div className="font-semibold text-gray-800">{user.is_automated ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>
        
        {/* Get Help & Support Button */}
        <div className="flex flex-col items-center mt-8">
          <button
            className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
            onClick={() => setSupportOpen(true)}
          >
            Get Help & Support
          </button>
        </div>
        {/* Powered by Codeteak */}
        <div className="flex flex-col items-center mt-12 mb-4">
          <span className="text-xs text-blue-500 mb-1">Powered by</span>
          <img src="/assets/codeteak-logo.png" alt="Codeteak Logo" className="h-4 object-contain mt-1 md:mt-2" />
        </div>
      </div>
        {/* Support Modal */}
        <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
        </div>
      </NetworkErrorHandler>
    </ErrorBoundary>
  );
}
