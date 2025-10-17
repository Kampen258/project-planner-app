// Key Result Item component - displays individual key result with progress tracking
// Part of the New Agile methodology OKR system

import React, { useState } from 'react';
import { keyResultService } from '../../services/okr/okrService';
import type { KeyResult } from '../../types';

interface KeyResultItemProps {
  keyResult: KeyResult;
  onUpdated: (updatedKeyResult: KeyResult) => void;
  onDeleted: (keyResultId: string) => void;
  className?: string;
}

const KeyResultItem: React.FC<KeyResultItemProps> = ({
  keyResult,
  onUpdated,
  onDeleted,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newValue, setNewValue] = useState(keyResult.current_value);
  const [updateNote, setUpdateNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Calculate progress percentage
  const progressPercentage = keyResult.target > 0
    ? Math.min((keyResult.current_value / keyResult.target) * 100, 100)
    : 0;

  // Get status color based on progress and status
  const getStatusColor = (status: string, progress: number) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'at_risk':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'blocked':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        if (progress >= 80) return 'bg-green-100 text-green-800 border-green-200';
        if (progress >= 60) return 'bg-blue-100 text-blue-800 border-blue-200';
        if (progress >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Handle progress update
  const handleUpdateProgress = async () => {
    if (newValue === keyResult.current_value && !updateNote.trim()) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const updatedKeyResult = await keyResultService.updateProgress(
        keyResult.id,
        newValue,
        updateNote.trim() || undefined
      );
      onUpdated(updatedKeyResult);
      setIsEditing(false);
      setUpdateNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus: 'active' | 'completed' | 'at_risk' | 'blocked') => {
    try {
      const updatedKeyResult = await keyResultService.updateKeyResult(keyResult.id, {
        status: newStatus
      });
      onUpdated(updatedKeyResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  // Handle deletion
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this key result?')) return;

    try {
      await keyResultService.deleteKeyResult(keyResult.id);
      onDeleted(keyResult.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete key result');
    }
  };

  const statusColor = getStatusColor(keyResult.status, progressPercentage);

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{keyResult.title}</h4>
          {keyResult.description && (
            <p className="text-sm text-gray-600 mt-1">{keyResult.description}</p>
          )}
        </div>

        {/* Status Badge */}
        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
          {keyResult.status.replace('_', ' ')}
        </div>
      </div>

      {/* Progress Bar and Values */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {keyResult.current_value} / {keyResult.target} {keyResult.unit}
          </span>
          <span className="font-medium text-gray-900">
            {Math.round(progressPercentage)}%
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              progressPercentage >= 80 ? 'bg-green-500' :
              progressPercentage >= 60 ? 'bg-blue-500' :
              progressPercentage >= 40 ? 'bg-yellow-500' :
              'bg-gray-400'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {keyResult.baseline !== keyResult.current_value && (
          <div className="text-xs text-gray-500">
            Started from {keyResult.baseline} {keyResult.unit}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {/* Update Progress Form */}
      {isEditing ? (
        <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Update Progress
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={newValue}
                onChange={(e) => setNewValue(Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="New value"
              />
              <span className="text-sm text-gray-600">{keyResult.unit}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Update Note (optional)
            </label>
            <textarea
              value={updateNote}
              onChange={(e) => setUpdateNote(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="What changed? Any blockers or insights?"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleUpdateProgress}
              disabled={isUpdating}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setNewValue(keyResult.current_value);
                setUpdateNote('');
                setError(null);
              }}
              className="px-3 py-2 text-gray-600 bg-gray-200 text-sm rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Action Buttons */
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Update Progress
            </button>

            {/* Quick Status Updates */}
            {keyResult.status !== 'completed' && (
              <button
                onClick={() => handleStatusChange('completed')}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Mark Complete
              </button>
            )}

            {keyResult.status !== 'at_risk' && progressPercentage < 80 && (
              <button
                onClick={() => handleStatusChange('at_risk')}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Mark At Risk
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Updated {keyResult.measurement_frequency}</span>
            <button
              onClick={handleDelete}
              className="text-red-400 hover:text-red-600"
              title="Delete key result"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Recent Updates */}
      {keyResult.updates && keyResult.updates.length > 0 && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <div className="font-medium mb-1">Latest Update:</div>
          <div className="flex items-center justify-between">
            <span>Value: {keyResult.updates[0].value} {keyResult.unit}</span>
            <span>{new Date(keyResult.updates[0].created_at).toLocaleDateString()}</span>
          </div>
          {keyResult.updates[0].note && (
            <div className="mt-1 italic">{keyResult.updates[0].note}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default KeyResultItem;