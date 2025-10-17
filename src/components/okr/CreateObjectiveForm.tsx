// Create Objective Form component - form for creating new objectives
// Part of the New Agile methodology OKR system

import React, { useState } from 'react';
import { objectiveService, okrUtils } from '../../services/okr/okrService';
import type { Objective, ObjectiveFormData, KeyResultFormData } from '../../types';

interface CreateObjectiveFormProps {
  projectId?: string;
  onObjectiveCreated: (objective: Objective) => void;
  onCancel: () => void;
  className?: string;
}

const CreateObjectiveForm: React.FC<CreateObjectiveFormProps> = ({
  projectId,
  onObjectiveCreated,
  onCancel,
  className = ''
}) => {
  const [formData, setFormData] = useState<ObjectiveFormData>({
    title: '',
    description: '',
    quarter: okrUtils.getCurrentQuarter(),
    year: okrUtils.getCurrentYear(),
    project_id: projectId
  });

  const [keyResults, setKeyResults] = useState<KeyResultFormData[]>([
    {
      title: '',
      description: '',
      baseline: 0,
      target: 100,
      unit: '%',
      measurement_frequency: 'weekly'
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle form field changes
  const handleFormChange = (field: keyof ObjectiveFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle key result changes
  const handleKeyResultChange = (index: number, field: keyof KeyResultFormData, value: any) => {
    setKeyResults(prev =>
      prev.map((kr, i) =>
        i === index ? { ...kr, [field]: value } : kr
      )
    );
  };

  // Add new key result
  const addKeyResult = () => {
    setKeyResults(prev => [...prev, {
      title: '',
      description: '',
      baseline: 0,
      target: 100,
      unit: '%',
      measurement_frequency: 'weekly'
    }]);
  };

  // Remove key result
  const removeKeyResult = (index: number) => {
    if (keyResults.length > 1) {
      setKeyResults(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Objective title is required');
      return;
    }

    // Validate key results
    const validKeyResults = keyResults.filter(kr => kr.title.trim());
    if (validKeyResults.length === 0) {
      setError('At least one key result is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newObjective = await objectiveService.createObjective({
        title: formData.title,
        description: formData.description,
        quarter: formData.quarter,
        year: formData.year,
        project_id: formData.project_id
      }, validKeyResults);

      onObjectiveCreated(newObjective);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create objective');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Create New Objective</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Objective Details */}
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Objective Title *
            </label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Improve customer satisfaction"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe what this objective aims to achieve..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quarter" className="block text-sm font-medium text-gray-700 mb-2">
                Quarter *
              </label>
              <select
                id="quarter"
                value={formData.quarter}
                onChange={(e) => handleFormChange('quarter', Number(e.target.value) as 1 | 2 | 3 | 4)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={1}>Q1</option>
                <option value={2}>Q2</option>
                <option value={3}>Q3</option>
                <option value={4}>Q4</option>
              </select>
            </div>

            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                Year *
              </label>
              <select
                id="year"
                value={formData.year}
                onChange={(e) => handleFormChange('year', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 1 + i;
                  return (
                    <option key={year} value={year}>{year}</option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Key Results */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-md font-medium text-gray-900">Key Results</h4>
            <button
              type="button"
              onClick={addKeyResult}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Key Result
            </button>
          </div>

          {keyResults.map((keyResult, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Key Result #{index + 1}</span>
                {keyResults.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeKeyResult(index)}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={keyResult.title}
                  onChange={(e) => handleKeyResultChange(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Increase NPS score"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={keyResult.description}
                  onChange={(e) => handleKeyResultChange(index, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="How will this be measured?"
                />
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Baseline
                  </label>
                  <input
                    type="number"
                    value={keyResult.baseline}
                    onChange={(e) => handleKeyResultChange(index, 'baseline', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target *
                  </label>
                  <input
                    type="number"
                    required
                    value={keyResult.target}
                    onChange={(e) => handleKeyResultChange(index, 'target', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={keyResult.unit}
                    onChange={(e) => handleKeyResultChange(index, 'unit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="%, $, users"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={keyResult.measurement_frequency}
                    onChange={(e) => handleKeyResultChange(index, 'measurement_frequency', e.target.value as 'daily' | 'weekly' | 'monthly')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors flex items-center gap-2"
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            )}
            Create Objective
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateObjectiveForm;