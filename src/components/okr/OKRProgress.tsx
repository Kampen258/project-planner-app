// OKR Progress component - displays health report and overall progress metrics
// Part of the New Agile methodology OKR system

import React from 'react';

interface HealthReport {
  total_objectives: number;
  completed_objectives: number;
  in_progress_objectives: number;
  avg_progress_percentage: number;
  key_results_summary: {
    total: number;
    completed: number;
    at_risk: number;
    blocked: number;
  };
  recommendations: string[];
}

interface OKRProgressProps {
  healthReport: HealthReport;
  className?: string;
}

const OKRProgress: React.FC<OKRProgressProps> = ({ healthReport, className = '' }) => {
  const {
    total_objectives,
    completed_objectives,
    in_progress_objectives,
    avg_progress_percentage,
    key_results_summary,
    recommendations
  } = healthReport;

  const objectiveCompletionRate = total_objectives > 0 ? (completed_objectives / total_objectives) * 100 : 0;
  const keyResultCompletionRate = key_results_summary.total > 0 ? (key_results_summary.completed / key_results_summary.total) * 100 : 0;

  // Determine health status based on progress
  const getHealthStatus = (percentage: number) => {
    if (percentage >= 80) return { status: 'excellent', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' };
    if (percentage >= 60) return { status: 'good', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
    if (percentage >= 40) return { status: 'fair', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
    return { status: 'needs attention', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' };
  };

  const overallHealth = getHealthStatus(avg_progress_percentage);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">OKR Health Report</h3>
          <p className="text-sm text-gray-600">Current quarter progress overview</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${overallHealth.bgColor} ${overallHealth.textColor}`}>
          {overallHealth.status}
        </div>
      </div>

      {/* Progress Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Progress */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Overall Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-gray-900">{Math.round(avg_progress_percentage)}%</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${avg_progress_percentage}%` }}
            />
          </div>
        </div>

        {/* Objective Completion */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Objectives</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-gray-900">{completed_objectives}</div>
            <span className="text-sm text-gray-500">of {total_objectives}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${objectiveCompletionRate}%` }}
            />
          </div>
        </div>

        {/* Key Results Completion */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Key Results</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-gray-900">{key_results_summary.completed}</div>
            <span className="text-sm text-gray-500">of {key_results_summary.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${keyResultCompletionRate}%` }}
            />
          </div>
        </div>

        {/* At Risk/Blocked */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">At Risk/Blocked</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-red-600">{key_results_summary.at_risk + key_results_summary.blocked}</div>
            <span className="text-sm text-gray-500">key results</span>
          </div>
          <div className="flex space-x-1 mt-2">
            <div className="flex-1 bg-orange-200 rounded-full h-2 flex items-center justify-center text-xs text-orange-800">
              {key_results_summary.at_risk > 0 && key_results_summary.at_risk}
            </div>
            <div className="flex-1 bg-red-200 rounded-full h-2 flex items-center justify-center text-xs text-red-800">
              {key_results_summary.blocked > 0 && key_results_summary.blocked}
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{in_progress_objectives}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{key_results_summary.at_risk}</div>
          <div className="text-sm text-gray-600">At Risk</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{key_results_summary.blocked}</div>
          <div className="text-sm text-gray-600">Blocked</div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            AI Recommendations
          </h4>
          <ul className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="text-sm text-blue-800 flex items-start">
                <span className="w-4 h-4 rounded-full bg-blue-200 flex-shrink-0 mt-0.5 mr-3" />
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default OKRProgress;