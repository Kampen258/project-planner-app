// Create Key Result Form component - form for adding key results to objectives
// Part of the New Agile methodology OKR system

import React, { useState } from 'react';
import { keyResultService } from '../../services/okr/okrService';
import type { KeyResult, KeyResultFormData } from '../../types';

interface CreateKeyResultFormProps {
  objectiveId: string;
  onKeyResultCreated: (keyResult: KeyResult) => void;
  onCancel: () => void;
  className?: string;
}

const CreateKeyResultForm: React.FC<CreateKeyResultFormProps> = ({
  objectiveId,
  onKeyResultCreated,
  onCancel,
  className = ''
}) => {
  const [formData, setFormData] = useState<KeyResultFormData>({
    title: '',
    description: '',
    baseline: 0,
    target: 100,
    unit: '%',
    measurement_frequency: 'weekly'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle form field changes
  const handleChange = (field: keyof KeyResultFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Key result title is required');
      return;
    }

    if (formData.target <= formData.baseline) {
      setError('Target must be greater than baseline');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newKeyResult = await keyResultService.createKeyResult({
        objective_id: objectiveId,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        baseline: formData.baseline,
        target: formData.target,
        current_value: formData.baseline, // Start at baseline
        unit: formData.unit.trim() || 'units',
        measurement_frequency: formData.measurement_frequency
      });

      onKeyResultCreated(newKeyResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create key result');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-semibold text-gray-900">Add Key Result</h4>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Key Result Title */}
        <div>
          <label htmlFor="kr-title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            id="kr-title"
            type="text"
            required
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Increase user engagement rate"
          />
        </div>

        {/* Key Result Description */}
        <div>
          <label htmlFor="kr-description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="kr-description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="How will this be measured? What defines success?"
          />
        </div>

        {/* Measurement Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Baseline */}
          <div>
            <label htmlFor="kr-baseline" className="block text-sm font-medium text-gray-700 mb-1">
              Baseline
            </label>
            <input
              id="kr-baseline"
              type="number"
              step="0.01"
              value={formData.baseline}
              onChange={(e) => handleChange('baseline', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Starting value"
            />
          </div>

          {/* Target */}
          <div>
            <label htmlFor="kr-target" className="block text-sm font-medium text-gray-700 mb-1">
              Target *
            </label>
            <input
              id="kr-target"
              type="number"
              step="0.01"
              required
              value={formData.target}
              onChange={(e) => handleChange('target', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Goal value"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Unit */}
          <div>
            <label htmlFor="kr-unit" className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <input
              id="kr-unit"
              type="text"
              value={formData.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="%, $, users, hours"
            />
          </div>

          {/* Measurement Frequency */}
          <div>
            <label htmlFor="kr-frequency" className="block text-sm font-medium text-gray-700 mb-1">
              Update Frequency
            </label>
            <select
              id="kr-frequency"
              value={formData.measurement_frequency}
              onChange={(e) => handleChange('measurement_frequency', e.target.value as 'daily' | 'weekly' | 'monthly')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {/* Progress Preview */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600 mb-2">Preview:</div>
          <div className="flex items-center justify-between text-sm">
            <span>
              {formData.baseline} → {formData.target} {formData.unit}
            </span>
            <span className="text-gray-500">
              Goal: +{formData.target - formData.baseline} {formData.unit}
            </span>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.title.trim()}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors flex items-center gap-2"
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            )}
            Add Key Result
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateKeyResultForm;