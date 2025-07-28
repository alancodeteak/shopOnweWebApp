import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message = "An unknown error occurred.", className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
      <h3 className="text-lg font-semibold text-red-700 mb-2">Oops! Something went wrong.</h3>
      <p className="text-sm text-red-600">{message}</p>
    </div>
  );
} 