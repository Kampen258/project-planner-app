import { useState } from 'react'
import type { ProjectMetadata, Project } from '../mcpClient'
import { MetadataAIService, type ProjectContext } from '../services/metadataAIService'

interface ProjectMetadataFormProps {
  project: Project
  metadata: ProjectMetadata
  onSave: (metadata: ProjectMetadata) => void
  onCancel: () => void
}

export function ProjectMetadataForm({ project, metadata, onSave, onCancel }: ProjectMetadataFormProps) {
  const [formData, setFormData] = useState<ProjectMetadata>(metadata)
  const [dodItems, setDodItems] = useState<string[]>(metadata.definitionOfDone || [])
  const [dorItems, setDorItems] = useState<string[]>(metadata.definitionOfReady || [])
  const [newDodItem, setNewDodItem] = useState('')
  const [newDorItem, setNewDorItem] = useState('')
  const [customFields, setCustomFields] = useState<{ [key: string]: any }>(
    metadata.customFields || {}
  )
  const [newFieldKey, setNewFieldKey] = useState('')
  const [newFieldValue, setNewFieldValue] = useState('')
  const [isGeneratingCriteria, setIsGeneratingCriteria] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const updatedMetadata: ProjectMetadata = {
      ...formData,
      definitionOfDone: dodItems.filter(item => item.trim() !== ''),
      definitionOfReady: dorItems.filter(item => item.trim() !== ''),
      customFields: customFields
    }

    onSave(updatedMetadata)
  }

  const addDodItem = () => {
    if (newDodItem.trim()) {
      setDodItems([...dodItems, newDodItem.trim()])
      setNewDodItem('')
    }
  }

  const removeDodItem = (index: number) => {
    setDodItems(dodItems.filter((_, i) => i !== index))
  }

  const addDorItem = () => {
    if (newDorItem.trim()) {
      setDorItems([...dorItems, newDorItem.trim()])
      setNewDorItem('')
    }
  }

  const removeDorItem = (index: number) => {
    setDorItems(dorItems.filter((_, i) => i !== index))
  }

  const addCustomField = () => {
    if (newFieldKey.trim() && newFieldValue.trim()) {
      setCustomFields({
        ...customFields,
        [newFieldKey.trim()]: newFieldValue.trim()
      })
      setNewFieldKey('')
      setNewFieldValue('')
    }
  }

  const removeCustomField = (key: string) => {
    const newFields = { ...customFields }
    delete newFields[key]
    setCustomFields(newFields)
  }

  // Generate DoD and DoR suggestions using AI
  const generateCriteriaWithAI = async () => {
    try {
      setIsGeneratingCriteria(true)

      const context: ProjectContext = {
        name: project.name,
        description: project.description,
        projectType: formData.projectType,
        methodology: formData.methodology,
        teamSize: formData.teamSize,
        riskLevel: formData.riskLevel,
        businessValue: formData.businessValue,
        technicalComplexity: formData.technicalComplexity
      }

      const aiSuggestions = await MetadataAIService.generateDoDAndDoR(context)

      // Merge AI suggestions with existing items, avoiding duplicates
      const existingDodLower = dodItems.map(item => item.toLowerCase())
      const existingDorLower = dorItems.map(item => item.toLowerCase())

      const newDodItems = aiSuggestions.definitionOfDone.filter(
        item => !existingDodLower.some(existing =>
          existing.includes(item.toLowerCase().substring(0, 20)) ||
          item.toLowerCase().includes(existing.substring(0, 20))
        )
      )

      const newDorItems = aiSuggestions.definitionOfReady.filter(
        item => !existingDorLower.some(existing =>
          existing.includes(item.toLowerCase().substring(0, 20)) ||
          item.toLowerCase().includes(existing.substring(0, 20))
        )
      )

      setDodItems([...dodItems, ...newDodItems])
      setDorItems([...dorItems, ...newDorItems])

      // Show success notification
      const notification = document.createElement('div')
      notification.innerHTML = `
        <div class="fixed top-4 right-4 bg-green-500/20 backdrop-blur-sm border border-green-400/30 text-green-100 px-4 py-2 rounded-lg z-50">
          ✨ Generated ${newDodItems.length} DoD and ${newDorItems.length} DoR suggestions!
        </div>
      `
      document.body.appendChild(notification)
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 3000)

    } catch (error) {
      console.error('Failed to generate criteria:', error)

      // Show error notification
      const notification = document.createElement('div')
      notification.innerHTML = `
        <div class="fixed top-4 right-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-100 px-4 py-2 rounded-lg z-50">
          ❌ Failed to generate AI suggestions. Please try again.
        </div>
      `
      document.body.appendChild(notification)
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 3000)
    } finally {
      setIsGeneratingCriteria(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Project Metadata</h2>
          <button
            onClick={onCancel}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Project Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Project Type
              </label>
              <input
                type="text"
                value={formData.projectType || ''}
                onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="e.g., web-development, mobile-app"
              />
            </div>

            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Methodology
              </label>
              <select
                value={formData.methodology || ''}
                onChange={(e) => setFormData({ ...formData, methodology: e.target.value as any })}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="" className="bg-gray-800">Select methodology</option>
                <option value="agile" className="bg-gray-800">Agile</option>
                <option value="scrum" className="bg-gray-800">Scrum</option>
                <option value="kanban" className="bg-gray-800">Kanban</option>
                <option value="waterfall" className="bg-gray-800">Waterfall</option>
                <option value="custom" className="bg-gray-800">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Sprint Length (weeks)
              </label>
              <input
                type="number"
                min="1"
                max="8"
                value={formData.sprintLength || ''}
                onChange={(e) => setFormData({ ...formData, sprintLength: parseInt(e.target.value) || undefined })}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="2"
              />
            </div>
          </div>

          {/* Risk and Complexity Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Team Size
              </label>
              <input
                type="number"
                min="1"
                value={formData.teamSize || ''}
                onChange={(e) => setFormData({ ...formData, teamSize: parseInt(e.target.value) || undefined })}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="5"
              />
            </div>

            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Risk Level
              </label>
              <select
                value={formData.riskLevel || ''}
                onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as any })}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="" className="bg-gray-800">Select risk level</option>
                <option value="low" className="bg-gray-800">Low</option>
                <option value="medium" className="bg-gray-800">Medium</option>
                <option value="high" className="bg-gray-800">High</option>
                <option value="critical" className="bg-gray-800">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Business Value
              </label>
              <select
                value={formData.businessValue || ''}
                onChange={(e) => setFormData({ ...formData, businessValue: e.target.value as any })}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="" className="bg-gray-800">Select business value</option>
                <option value="low" className="bg-gray-800">Low</option>
                <option value="medium" className="bg-gray-800">Medium</option>
                <option value="high" className="bg-gray-800">High</option>
                <option value="critical" className="bg-gray-800">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Technical Complexity
              </label>
              <select
                value={formData.technicalComplexity || ''}
                onChange={(e) => setFormData({ ...formData, technicalComplexity: e.target.value as any })}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="" className="bg-gray-800">Select complexity</option>
                <option value="low" className="bg-gray-800">Low</option>
                <option value="medium" className="bg-gray-800">Medium</option>
                <option value="high" className="bg-gray-800">High</option>
                <option value="very-high" className="bg-gray-800">Very High</option>
              </select>
            </div>
          </div>

          {/* AI Generation Section */}
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-purple-400/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">🤖 AI-Powered Criteria Generation</h3>
                <p className="text-white/70 text-sm">
                  Let Claude AI analyze your project context and generate comprehensive Definition of Done and Definition of Ready criteria tailored to your specific needs.
                </p>
              </div>
              <button
                type="button"
                onClick={generateCriteriaWithAI}
                disabled={isGeneratingCriteria}
                className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300 border border-purple-400/30 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-0 whitespace-nowrap"
              >
                {isGeneratingCriteria ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Generate with AI</span>
                  </>
                )}
              </button>
            </div>

            {!formData.projectType && !formData.methodology && (
              <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-yellow-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-yellow-200 text-sm">
                    💡 Fill in the project type, methodology, and risk assessment above for better AI suggestions.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Definition of Done */}
          <div>
            <label className="block text-white/90 text-sm font-medium mb-4">
              Definition of Done (DoD)
            </label>
            <div className="space-y-3">
              {dodItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-white/80 flex-1 bg-white/10 px-3 py-2 rounded-lg">{item}</span>
                  <button
                    type="button"
                    onClick={() => removeDodItem(index)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newDodItem}
                  onChange={(e) => setNewDodItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDodItem())}
                  className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="Add definition of done item..."
                />
                <button
                  type="button"
                  onClick={addDodItem}
                  className="bg-green-500/20 text-green-300 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Definition of Ready */}
          <div>
            <label className="block text-white/90 text-sm font-medium mb-4">
              Definition of Ready (DoR)
            </label>
            <div className="space-y-3">
              {dorItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-white/80 flex-1 bg-white/10 px-3 py-2 rounded-lg">{item}</span>
                  <button
                    type="button"
                    onClick={() => removeDorItem(index)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newDorItem}
                  onChange={(e) => setNewDorItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDorItem())}
                  className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="Add definition of ready item..."
                />
                <button
                  type="button"
                  onClick={addDorItem}
                  className="bg-green-500/20 text-green-300 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Custom Fields */}
          <div>
            <label className="block text-white/90 text-sm font-medium mb-4">
              Custom Fields
            </label>
            <div className="space-y-3">
              {Object.entries(customFields).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <span className="text-white/80 font-medium min-w-0 w-1/3">{key}:</span>
                  <span className="text-white/80 flex-1 bg-white/10 px-3 py-2 rounded-lg">{String(value)}</span>
                  <button
                    type="button"
                    onClick={() => removeCustomField(key)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="Field name..."
                />
                <input
                  type="text"
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="Field value..."
                />
                <button
                  type="button"
                  onClick={addCustomField}
                  className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                  Add Field
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-6 border-t border-white/20">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-colors border border-white/30 font-medium"
            >
              Save Metadata
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}