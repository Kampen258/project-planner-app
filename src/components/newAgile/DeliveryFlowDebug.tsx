import React from 'react';

interface DeliveryFlowDebugProps {
  projectId: string;
  className?: string;
}

const DeliveryFlowDebug: React.FC<DeliveryFlowDebugProps> = ({ projectId, className = '' }) => {
  return (
    <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl ${className}`}>
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Delivery Flow (Debug Mode)</h2>
            <p className="text-white/70">Project ID: {projectId}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white/80 mb-2">Delivery Flow Debug Component</h3>
          <p className="text-white/60 mb-6">
            This is a simplified version of the Delivery Flow component to test basic functionality.
            If you can see this, the issue is likely with the DnD library or complex state management.
          </p>
          <div className="bg-white/5 rounded-lg p-4 text-left max-w-md mx-auto">
            <h4 className="text-white font-medium mb-2">Test Info:</h4>
            <ul className="text-white/70 text-sm space-y-1">
              <li>✅ Component renders successfully</li>
              <li>✅ Props are being passed: projectId = {projectId}</li>
              <li>✅ Tailwind CSS is working</li>
              <li>✅ No DnD library interference</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryFlowDebug;