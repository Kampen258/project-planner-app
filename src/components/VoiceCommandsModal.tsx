import { useState } from 'react'

interface VoiceCommandsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface VoiceCommand {
  category: string
  commands: {
    example: string
    description: string
    parameters?: string
  }[]
}

const voiceCommands: VoiceCommand[] = [
  {
    category: "Project Management",
    commands: [
      {
        example: "Create a new project called Website Redesign",
        description: "Creates a new project with the specified name",
        parameters: "Project name (required)"
      },
      {
        example: "Get project summary",
        description: "Shows overview of all your projects and current status"
      },
      {
        example: "What's the status of [project name]?",
        description: "Gets detailed status information for a specific project"
      },
      {
        example: "Update project progress to 75%",
        description: "Updates the completion percentage of the current project"
      }
    ]
  },
  {
    category: "Task Management",
    commands: [
      {
        example: "Create task 'Design homepage mockup' for Website Redesign",
        description: "Creates a new task in the specified project",
        parameters: "Task name, project name (optional if one is selected)"
      },
      {
        example: "List all tasks",
        description: "Shows all tasks across all projects"
      },
      {
        example: "Show tasks for [project name]",
        description: "Lists all tasks for a specific project"
      },
      {
        example: "Update task 'Design homepage' to completed",
        description: "Changes the status of a task (todo, in_progress, completed, cancelled)"
      },
      {
        example: "Mark task 'User research' as in progress",
        description: "Updates task status to in progress"
      }
    ]
  },
  {
    category: "Analytics & Insights",
    commands: [
      {
        example: "Get task analytics",
        description: "Shows completion rates, priority distribution, and task statistics"
      },
      {
        example: "Show overdue tasks",
        description: "Lists all tasks that are past their due date"
      },
      {
        example: "What tasks are due this week?",
        description: "Shows tasks due in the next 7 days"
      },
      {
        example: "Prioritize tasks by deadline",
        description: "Shows tasks sorted by urgency (deadline, priority, or status)"
      }
    ]
  },
  {
    category: "Data Management",
    commands: [
      {
        example: "Refresh task data",
        description: "Reloads all task information from the database"
      },
      {
        example: "Refresh tasks for [project name]",
        description: "Reloads task data for a specific project"
      }
    ]
  }
]

export function VoiceCommandsModal({ isOpen, onClose }: VoiceCommandsModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  if (!isOpen) return null

  const handleTestCommand = async (command: string) => {
    if (typeof window !== 'undefined' && (window as any).handleVoiceCommand) {
      try {
        console.log(`🎤 Testing command: "${command}"`)
        // For demo purposes, we'll extract the command type and simulate it
        let commandType = 'get_project_summary'
        let params = {}

        if (command.includes('task analytics')) {
          commandType = 'get_task_analytics'
        } else if (command.includes('overdue tasks')) {
          commandType = 'get_overdue_tasks'
        } else if (command.includes('due this week')) {
          commandType = 'get_upcoming_tasks'
          params = { days: 7 }
        } else if (command.includes('prioritize tasks')) {
          commandType = 'prioritize_tasks'
          params = { criteria: 'deadline' }
        } else if (command.includes('list all tasks')) {
          commandType = 'list_all_tasks'
          params = { limit: 10 }
        } else if (command.includes('refresh task data')) {
          commandType = 'refresh_tasks'
        }

        const result = await (window as any).handleVoiceCommand(commandType, params)
        console.log('✅ Command result:', result)

        // Show a brief success message
        const button = document.activeElement as HTMLButtonElement
        if (button) {
          const originalText = button.textContent
          button.textContent = '✅ Executed!'
          button.style.background = 'rgba(34, 197, 94, 0.2)'
          setTimeout(() => {
            button.textContent = originalText
            button.style.background = ''
          }, 2000)
        }
      } catch (error) {
        console.error('❌ Command failed:', error)
      }
    } else {
      console.log('⚠️ Voice command handler not available - using demo mode')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-white/20">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Voice Commands</h2>
            <p className="text-white/70">Try these voice commands with your AI assistant</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-[60vh]">
          {/* Categories Sidebar */}
          <div className="w-1/3 border-r border-white/20 p-6">
            <h3 className="text-lg font-medium text-white mb-4">Categories</h3>
            <div className="space-y-2">
              {voiceCommands.map((category) => (
                <button
                  key={category.category}
                  onClick={() => setSelectedCategory(selectedCategory === category.category ? null : category.category)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    selectedCategory === category.category
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category.category}</span>
                    <div className="text-sm text-white/60 bg-white/10 px-2 py-1 rounded">
                      {category.commands.length}
                    </div>
                  </div>
                </button>
              ))}

              {/* Show all commands button */}
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  selectedCategory === null
                    ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-400/30'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="font-medium">All Commands</span>
              </button>
            </div>
          </div>

          {/* Commands Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {(selectedCategory ? voiceCommands.filter(cat => cat.category === selectedCategory) : voiceCommands).map((category) => (
                <div key={category.category} className="space-y-4">
                  <h4 className="text-xl font-semibold text-white flex items-center">
                    <span className="mr-3">{category.category}</span>
                    <div className="h-px bg-gradient-to-r from-white/30 to-transparent flex-1 ml-4"></div>
                  </h4>

                  <div className="grid gap-4">
                    {category.commands.map((command, index) => (
                      <div key={index} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="text-green-300 text-sm font-mono mr-2">💬</span>
                              <span className="text-white font-medium">"{command.example}"</span>
                            </div>
                            <p className="text-white/70 text-sm mb-2">{command.description}</p>
                            {command.parameters && (
                              <div className="text-xs text-white/50 bg-white/5 rounded px-2 py-1 inline-block">
                                Parameters: {command.parameters}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleTestCommand(command.example)}
                            className="ml-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white px-3 py-1.5 rounded-lg hover:from-blue-500/30 hover:to-purple-500/30 transition-all text-sm font-medium border border-blue-400/30"
                          >
                            Try It
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/60">
              💡 Tip: Speak naturally! The AI assistant can understand variations of these commands.
            </div>
            <div className="flex items-center space-x-2 text-white/60 text-sm">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span>Voice Assistant Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}