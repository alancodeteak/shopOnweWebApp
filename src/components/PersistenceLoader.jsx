import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const PersistenceLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 text-sm">
          Loading your data...
        </p>
      </div>
    </div>
  );
};

export default PersistenceLoader; 