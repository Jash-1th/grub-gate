import React from 'react';

const ProFeaturesPanel = () => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="font-bold text-purple-900">Smart Planning</h3>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex items-start space-x-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
          <p className="text-purple-800">Day-specific menu availability</p>
        </div>
        <div className="flex items-start space-x-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
          <p className="text-purple-800">Weekly budget: <span className="font-semibold text-blue-600">$127.50</span></p>
        </div>
        <div className="flex items-start space-x-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
          <p className="text-purple-800">Advanced meal scheduling</p>
        </div>
      </div>
    </div>
  );
};

export default ProFeaturesPanel;
