import { useState } from 'react'
import type { Project } from '../mcpClient'
import type { Task } from '../services/taskService'

interface VoiceAssistantStatusProps {
  projects: Project[]
  currentTasks: Task[]
  currentProject?: Project | null
}

export function VoiceAssistantStatus({
  projects,
  currentTasks,
  currentProject
}: VoiceAssistantStatusProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [testResults, setTestResults] = useState<any>({})
  const [isTestingCommands, setIsTestingCommands] = useState(false)

  // Calculate task statistics
  const taskStats = {
    total: currentTasks.length,
    completed: currentTasks.filter(t => t.completed).length,
    inProgress: currentTasks.filter(t => t.status === 'in_progress').length,
    overdue: currentTasks.filter(t =>
      t.due_date && new Date(t.due_date) < new Date() && !t.completed
    ).length,
    upcoming: currentTasks.filter(t => {
      if (!t.due_date || t.completed) return false
      const now = new Date()
      const dueDate = new Date(t.due_date)
      const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      return dueDate >= now && dueDate <= weekFromNow
    }).length
  }

  // Test voice commands
  const testVoiceCommands = async () => {
    setIsTestingCommands(true)
    const results: any = {}

    const commands = [
      { name: 'refresh_tasks', params: {} },
      { name: 'get_task_analytics', params: {} },
      { name: 'get_overdue_tasks', params: {} },
      { name: 'get_upcoming_tasks', params: { days: 7 } },
      { name: 'prioritize_tasks', params: { criteria: 'priority' } },
      { name: 'get_project_summary', params: {} },
      { name: 'list_all_tasks', params: { limit: 5 } },
      { name: 'list_project_tasks', params: { limit: 3 } }
    ]

    for (const command of commands) {
      try {
        if (typeof (window as any).handleVoiceCommand === 'function') {
          const result = await (window as any).handleVoiceCommand(command.name, command.params)
          results[command.name] = {
            success: result.success,
            message: result.message,
            hasData: !!result.data
          }
        } else {
          results[command.name] = {
            success: false,
            message: 'Voice command handler not available',
            hasData: false
          }
        }
      } catch (error) {
        results[command.name] = {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
          hasData: false
        }
      }
    }

    setTestResults(results)
    setIsTestingCommands(false)
  }

  return (
    <div className="fixed bottom-4 right-4 z-[10001]">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg">
        <div
          className="flex items-center justify-between p-3 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-medium">Voice Assistant</span>
          </div>
          <svg
            className={`w-4 h-4 text-white transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {isExpanded && (
          <div className="border-t border-white/20 p-4 w-80">
            <div className="space-y-4">
              {/* Context Overview */}
              <div>
                <h4 className="text-white font-medium mb-2">Context Overview</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/10 rounded p-2">
                    <div className="text-white/60">Projects</div>
                    <div className="text-white font-medium">{projects.length}</div>
                  </div>
                  <div className="bg-white/10 rounded p-2">
                    <div className="text-white/60">Total Tasks</div>
                    <div className="text-white font-medium">{taskStats.total}</div>
                  </div>
                  <div className="bg-white/10 rounded p-2">
                    <div className="text-white/60">Completed</div>
                    <div className="text-white font-medium">{taskStats.completed}</div>
                  </div>
                  <div className="bg-white/10 rounded p-2">
                    <div className="text-white/60">Overdue</div>
                    <div className="text-white font-medium text-red-300">{taskStats.overdue}</div>
                  </div>
                </div>
              </div>

              {/* Current Context */}
              <div>
                <h4 className="text-white font-medium mb-2">Current Context</h4>
                <div className="text-xs text-white/70">
                  <div>Page: {window.location.pathname.includes('dashboard') ? 'Dashboard' :
                              window.location.pathname.includes('projects') ? 'Projects' : 'Home'}</div>
                  <div>Selected Project: {currentProject?.name || 'None'}</div>
                  <div>Tasks in Context: {currentTasks.length}</div>
                </div>
              </div>

              {/* Voice Commands Test */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">Command Test</h4>
                  <button
                    onClick={testVoiceCommands}
                    disabled={isTestingCommands}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs px-2 py-1 rounded disabled:opacity-50"
                  >
                    {isTestingCommands ? 'Testing...' : 'Test Commands'}
                  </button>
                </div>

                {Object.keys(testResults).length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {Object.entries(testResults).map(([command, result]: [string, any]) => (
                      <div key={command} className="flex items-center justify-between text-xs">
                        <span className="text-white/70 truncate">{command}</span>
                        <span className={`${result.success ? 'text-green-300' : 'text-red-300'}`}>
                          {result.success ? '✅' : '❌'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Available Commands */}
              <div>
                <h4 className="text-white font-medium mb-2">Available Commands</h4>
                <div className="text-xs text-white/60 space-y-1">
                  <div>"Refresh task data"</div>
                  <div>"List all tasks"</div>
                  <div>"Show tasks in [project name]"</div>
                  <div>"Get task analytics"</div>
                  <div>"Show overdue tasks"</div>
                  <div>"What tasks are due this week?"</div>
                  <div>"Prioritize tasks by deadline"</div>
                  <div>"Create task [name] for [project]"</div>
                  <div>"Update task [name] to completed"</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}