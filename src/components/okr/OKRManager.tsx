// OKR Manager - Main component for managing Objectives & Key Results
// Implements New Agile methodology OKR system

import React, { useState, useEffect } from 'react';
import {
  objectiveService,
  okrAnalyticsService,
  okrUtils
} from '../../services/okr/okrService';
import type { Objective } from '../../types';
import ObjectiveCard from './ObjectiveCard';
import OKRProgress from './OKRProgress';
import CreateObjectiveForm from './CreateObjectiveForm';

interface OKRManagerProps {
  projectId?: string; // If provided, shows OKRs linked to this project
  className?: string;
}

const OKRManager: React.FC<OKRManagerProps> = ({ projectId, className = '' }) => {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState(okrUtils.getCurrentQuarter());
  const [selectedYear, setSelectedYear] = useState(okrUtils.getCurrentYear());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [healthReport, setHealthReport] = useState<any>(null);

  // Load objectives
  const loadObjectives = async () => {
    try {
      setLoading(true);
      setError(null);

      let objectivesData: Objective[];

      if (projectId) {
        // Load objectives for specific project
        objectivesData = await objectiveService.getProjectObjectives(projectId);
      } else {
        // Load objectives for selected quarter/year
        objectivesData = await objectiveService.getObjectives(selectedQuarter, selectedYear);
      }

      setObjectives(objectivesData);

      // Generate health report for current quarter
      if (selectedQuarter === okrUtils.getCurrentQuarter() && selectedYear === okrUtils.getCurrentYear()) {
        const report = await okrAnalyticsService.generateHealthReport();
        setHealthReport(report);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load OKRs');
    } finally {
      setLoading(false);
    }
  };

  // Load objectives when component mounts or filters change
  useEffect(() => {
    loadObjectives();
  }, [selectedQuarter, selectedYear, projectId]);

  // Handle objective creation
  const handleObjectiveCreated = (newObjective: Objective) => {
    setObjectives(prev => [newObjective, ...prev]);
    setShowCreateForm(false);
    loadObjectives(); // Refresh to get updated health report
  };

  // Handle objective deletion
  const handleObjectiveDeleted = (objectiveId: string) => {
    setObjectives(prev => prev.filter(obj => obj.id !== objectiveId));
    loadObjectives(); // Refresh to get updated health report
  };

  // Handle objective update
  const handleObjectiveUpdated = (updatedObjective: Objective) => {
    setObjectives(prev =>
      prev.map(obj => obj.id === updatedObjective.id ? updatedObjective : obj)
    );
    loadObjectives(); // Refresh to get updated health report
  };

  if (loading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} bg-red-50 border border-red-200 rounded-lg p-4`}>
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading OKRs</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={loadObjectives}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {projectId ? 'Project OKRs' : 'OKR Management'}
          </h2>
          <p className="text-gray-600 mt-1">
            Track objectives and key results using the New Agile methodology
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Objective
        </button>
      </div>

      {/* Quarter/Year Selector (only show if not project-specific) */}
      {!projectId && (
        <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Quarter:</label>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(Number(e.target.value) as 1 | 2 | 3 | 4)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value={1}>Q1</option>
              <option value={2}>Q2</option>
              <option value={3}>Q3</option>
              <option value={4}>Q4</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <option key={year} value={year}>{year}</option>
                );
              })}
            </select>
          </div>
        </div>
      )}

      {/* Health Report (current quarter only) */}
      {healthReport && selectedQuarter === okrUtils.getCurrentQuarter() && selectedYear === okrUtils.getCurrentYear() && (
        <OKRProgress healthReport={healthReport} />
      )}

      {/* Create Objective Form */}
      {showCreateForm && (
        <CreateObjectiveForm
          projectId={projectId}
          onObjectiveCreated={handleObjectiveCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Objectives List */}
      {objectives.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A9.971 9.971 0 0124 28c4.418 0 7.865 2.833 9.287 6.286"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No objectives yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first objective for {okrUtils.getQuarterName(selectedQuarter)} {selectedYear}
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Objective
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {objectives.map((objective) => (
            <ObjectiveCard
              key={objective.id}
              objective={objective}
              onDeleted={handleObjectiveDeleted}
              onUpdated={handleObjectiveUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OKRManager;