// Objective Card - Display and manage individual objectives with key results
// Part of New Agile methodology OKR system

import React, { useState } from 'react';
import { objectiveService, okrAnalyticsService } from '../../services/okr/okrService';
import type { Objective } from '../../types';
import KeyResultItem from './KeyResultItem';
import CreateKeyResultForm from './CreateKeyResultForm';

interface ObjectiveCardProps {
  objective: Objective;
  onDeleted: (id: string) => void;
  onUpdated: (objective: Objective) => void;
  className?: string;
}

const ObjectiveCard: React.FC<ObjectiveCardProps> = ({
  objective,
  onDeleted,
  onUpdated,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showKeyResultForm, setShowKeyResultForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(objective.title);
  const [editDescription, setEditDescription] = useState(objective.description || '');
  const [loading, setLoading] = useState(false);

  // Calculate progress
  const progress = okrAnalyticsService.calculateObjectiveProgress(objective);
  const keyResultsCount = objective.key_results?.length || 0;
  const completedKeyResults = objective.key_results?.filter(kr => kr.status === 'completed').length || 0;

  // Get status styling
  const getStatusStyling = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'active':
        return progress >= 70 ? 'bg-blue-100 text-blue-800 border-blue-200' :
               progress >= 40 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
               'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Handle objective update
  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      const updatedObjective = await objectiveService.updateObjective(objective.id, {
        title: editTitle,
        description: editDescription
      });
      onUpdated(updatedObjective);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update objective:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle objective deletion
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this objective? This will also delete all key results.')) {
      return;
    }

    try {
      setLoading(true);
      await objectiveService.deleteObjective(objective.id);
      onDeleted(objective.id);
    } catch (error) {
      console.error('Failed to delete objective:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus: 'draft' | 'active' | 'completed' | 'cancelled') => {
    try {
      setLoading(true);
      const updatedObjective = await objectiveService.updateObjective(objective.id, {
        status: newStatus
      });
      onUpdated(updatedObjective);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle key result added
  const handleKeyResultAdded = () => {
    setShowKeyResultForm(false);
    // Refresh the objective to get updated key results
    window.location.reload(); // Simple refresh for now, could be optimized
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-lg font-semibold border border-gray-300 rounded px-3 py-2"
                  placeholder="Objective title"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 resize-none"
                  rows={2}
                  placeholder="Objective description"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    disabled={loading || !editTitle.trim()}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditTitle(objective.title);
                      setEditDescription(objective.description || '');
                    }}
                    className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{objective.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusStyling(objective.status)}`}>
                    {objective.status.charAt(0).toUpperCase() + objective.status.slice(1)}
                  </span>
                </div>
                {objective.description && (
                  <p className="text-gray-600 text-sm mb-3">{objective.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Q{objective.quarter} {objective.year}</span>
                  <span>{keyResultsCount} Key Results</span>
                  <span>{completedKeyResults} Completed</span>
                </div>
              </>
            )}
          </div>

          {!isEditing && (
            <div className="flex items-center gap-2 ml-4">
              {/* Status Dropdown */}
              <select
                value={objective.status}
                onChange={(e) => handleStatusChange(e.target.value as any)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
                disabled={loading}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Actions */}
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>

              <button
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-600"
                disabled={loading}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {!isEditing && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  progress >= 100 ? 'bg-green-500' :
                  progress >= 70 ? 'bg-blue-500' :
                  progress >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Key Results Section */}
      {isExpanded && (
        <div className="p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-900">Key Results</h4>
            <button
              onClick={() => setShowKeyResultForm(true)}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              Add Key Result
            </button>
          </div>

          {/* Create Key Result Form */}
          {showKeyResultForm && (
            <div className="mb-4">
              <CreateKeyResultForm
                objectiveId={objective.id}
                onKeyResultCreated={handleKeyResultAdded}
                onCancel={() => setShowKeyResultForm(false)}
              />
            </div>
          )}

          {/* Key Results List */}
          {objective.key_results && objective.key_results.length > 0 ? (
            <div className="space-y-3">
              {objective.key_results.map((keyResult) => (
                <KeyResultItem
                  key={keyResult.id}
                  keyResult={keyResult}
                  onUpdated={handleKeyResultAdded} // Simple refresh for now
                  onDeleted={handleKeyResultAdded} // Simple refresh for now
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No key results yet. Add one to start tracking progress.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ObjectiveCard;