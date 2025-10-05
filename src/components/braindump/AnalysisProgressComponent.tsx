import React, { useState, useEffect } from 'react';
import type { ProgressUpdate } from '../../services/braindumpService';

interface AnalysisProgressComponentProps {
  updates: ProgressUpdate[];
  onComplete: () => void;
  isComplete: boolean;
}

const AnalysisProgressComponent: React.FC<AnalysisProgressComponentProps> = ({
  updates,
  onComplete,
  isComplete
}) => {
  const [displayedUpdates, setDisplayedUpdates] = useState<ProgressUpdate[]>([]);

  useEffect(() => {
    if (updates.length === 0) return;

    // Display updates progressively with delays
    let timeoutId: NodeJS.Timeout;
    const displayUpdate = (index: number) => {
      if (index < updates.length) {
        setDisplayedUpdates(prev => [...prev, updates[index]!]);
        timeoutId = setTimeout(() => displayUpdate(index + 1), 1500);
      } else if (isComplete) {
        // Small delay before calling onComplete
        timeoutId = setTimeout(onComplete, 1000);
      }
    };

    displayUpdate(0);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [updates, isComplete, onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400 flex items-center justify-center p-4">
      <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/20 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">AI Analysis in Progress</h2>
          <p className="text-white/80">Analyzing your document and extracting project information...</p>
        </div>

        {/* Progress Updates */}
        <div className="p-6 space-y-4 min-h-[400px]">
          {displayedUpdates.map((update, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 animate-fade-in"
              style={{
                animationDelay: `${index * 0.3}s`
              }}
            >
              {/* AI Avatar */}
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm">🤖</span>
              </div>

              {/* Message */}
              <div className="flex-1 space-y-1">
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-white font-medium">{update.message}</p>
                  {update.detail && (
                    <p className="text-white/80 text-sm mt-1">{update.detail}</p>
                  )}
                </div>

                {/* Typing indicator for the latest update */}
                {index === displayedUpdates.length - 1 && !isComplete && (
                  <div className="flex items-center space-x-1 mt-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="text-white/60 text-xs ml-2">AI is thinking...</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Completion indicator */}
          {isComplete && displayedUpdates.length > 0 && (
            <div className="flex items-center justify-center pt-6">
              <div className="bg-green-500/20 text-green-100 px-6 py-3 rounded-lg flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Analysis Complete!</span>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="px-6 pb-6">
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.min((displayedUpdates.length / Math.max(updates.length, 1)) * 100, 100)}%`
              }}
            ></div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-white/70 text-sm">Step {displayedUpdates.length} of {updates.length || 1}</span>
            <span className="text-white/70 text-sm">
              {isComplete ? 'Complete' : 'In Progress...'}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default AnalysisProgressComponent;