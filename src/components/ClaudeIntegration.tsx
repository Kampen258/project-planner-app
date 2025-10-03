import { useState } from 'react'
import { mcpClient, type MCPTask } from '../mcpClient'
import type { Project } from '../mcpClient'

interface ClaudeIntegrationProps {
  project: Project
  onTasksGenerated: (tasks: MCPTask[]) => void
}

export function ClaudeIntegration({ project, onTasksGenerated }: ClaudeIntegrationProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showClaudePanel, setShowClaudePanel] = useState(false)
  const [context, setContext] = useState('')
  const [generatedTasks, setGeneratedTasks] = useState<MCPTask[]>([])

  const handleGenerateTasks = async () => {
    if (!mcpClient.isClientConnected()) {
      alert('Claude MCP is not connected. Please check your connection.')
      return
    }

    try {
      setIsGenerating(true)

      // Use Claude to generate task suggestions based on project context
      const suggestions = await mcpClient.generateTaskSuggestions(
        project.id,
        context || `Project: ${project.name}. Description: ${project.description}`
      )

      setGeneratedTasks(suggestions)

      // Show success message
      const notification = document.createElement('div')
      notification.innerHTML = `
        <div class="fixed top-4 right-4 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 text-blue-100 px-4 py-2 rounded-lg z-50">
          ✨ Claude generated ${suggestions.length} task suggestions!
        </div>
      `
      document.body.appendChild(notification)
      setTimeout(() => document.body.removeChild(notification), 3000)

    } catch (error) {
      console.error('Failed to generate tasks:', error)
      alert('Failed to generate tasks. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAddTasksToProject = () => {
    onTasksGenerated(generatedTasks)
    setGeneratedTasks([])
    setShowClaudePanel(false)
    setContext('')
  }

  const getPriorityColor = (priority: MCPTask['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-400/20 text-red-100 border-red-400/30'
      case 'high': return 'bg-orange-400/20 text-orange-100 border-orange-400/30'
      case 'medium': return 'bg-yellow-400/20 text-yellow-100 border-yellow-400/30'
      case 'low': return 'bg-green-400/20 text-green-100 border-green-400/30'
      default: return 'bg-gray-400/20 text-gray-100 border-gray-400/30'
    }
  }

  return (
    <>
      {/* Claude Integration Button */}
      <button
        onClick={() => setShowClaudePanel(true)}
        className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300 border border-purple-400/30 flex items-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span>Ask Claude for Task Ideas</span>
        <div className="bg-purple-400/30 px-2 py-1 rounded text-xs font-medium">AI</div>
      </button>

      {/* Claude Panel Modal */}
      {showClaudePanel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Claude Task Assistant</h2>
                  <p className="text-white/60 text-sm">AI-powered task suggestions for your project</p>
                </div>
              </div>
              <button
                onClick={() => setShowClaudePanel(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Project Context */}
            <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-white font-semibold mb-2">Project Context</h3>
              <p className="text-white/80 text-sm"><strong>Name:</strong> {project.name}</p>
              <p className="text-white/80 text-sm"><strong>Description:</strong> {project.description}</p>
              <p className="text-white/80 text-sm"><strong>Status:</strong> {project.status}</p>
            </div>

            {/* Additional Context Input */}
            <div className="mb-6">
              <label className="block text-white/90 text-sm font-medium mb-2">
                Additional Context (Optional)
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={3}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-transparent resize-none"
                placeholder="Tell Claude more about what you need help with... (e.g., 'Focus on backend development tasks' or 'Include testing and deployment steps')"
              />
            </div>

            {/* Generate Button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={handleGenerateTasks}
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm text-white px-8 py-3 rounded-lg hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300 border border-purple-400/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                    <span>Claude is thinking...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Generate Task Suggestions</span>
                  </>
                )}
              </button>
            </div>

            {/* Generated Tasks */}
            {generatedTasks.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-white">Claude's Suggestions</h3>
                  <div className="text-white/60 text-sm">{generatedTasks.length} tasks suggested</div>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {generatedTasks.map((task) => (
                    <div key={task.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-medium">{task.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm mb-2">{task.description}</p>
                      {task.due_date && (
                        <p className="text-white/60 text-xs">
                          Suggested due date: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex space-x-4 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setGeneratedTasks([])}
                    className="flex-1 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-colors border border-white/20"
                  >
                    Regenerate
                  </button>
                  <button
                    onClick={handleAddTasksToProject}
                    className="flex-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300 border border-purple-400/30 font-medium"
                  >
                    Add All Tasks to Project
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}