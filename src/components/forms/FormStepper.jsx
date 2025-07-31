import React from 'react';

export default function FormStepper({
  steps,
  currentStep,
  className
}) {
  return (
    <div className={className}>
      <div className="flex items-center justify-center gap-8 mb-6">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                currentStep === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {index + 1}
              </div>
              <span className={`text-xs mt-1 ${
                currentStep === index + 1 ? 'text-blue-600 font-semibold' : 'text-gray-400'
              }`}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 bg-gray-200 rounded mx-2" style={{ maxWidth: 60 }}>
                <div 
                  className="h-1 rounded bg-blue-500 transition-all duration-300" 
                  style={{ width: currentStep > index + 1 ? '100%' : '50%' }} 
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
} 