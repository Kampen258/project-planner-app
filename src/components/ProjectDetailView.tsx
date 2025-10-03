import { useState, useEffect } from 'react'
import type { Project, MCPTask, ProjectMetadata } from '../mcpClient'
import { TaskService, type Task } from '../services/taskService'
import { ProjectService } from '../services/projectService'
import { ClaudeIntegration } from './ClaudeIntegration'
import { ProjectMetadataForm } from './ProjectMetadataForm'
import { SyncService } from '../services/syncService'

interface ProjectDetailViewProps {
  project: Project
  onBack: () => void
  onProjectUpdate?: (project: Project) => void
}

export function ProjectDetailView({ project, onBack, onProjectUpdate }: ProjectDetailViewProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateTaskForm, setShowCreateTaskForm] = useState(false)
  const [showMetadataForm, setShowMetadataForm] = useState(false)
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    todo: 0,
    overdue: 0
  })

  useEffect(() => {
    loadTasks()
  }, [project.id])

  const loadTasks = async () => {
    try {
      setLoading(true)
      console.log(`🔄 Loading tasks for project: ${project.name} (ID: ${project.id})`)

      const [projectTasks, stats] = await Promise.all([
        TaskService.getTasksByProject(project.id),
        TaskService.getProjectTaskStats(project.id)
      ])

      console.log(`✅ Loaded ${projectTasks.length} tasks:`, projectTasks)
      console.log(`📊 Task stats:`, stats)

      setTasks(projectTasks)
      setTaskStats(stats)
    } catch (error) {
      console.error('❌ Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      console.log(`🔄 Creating new task:`, taskData)
      console.log(`📍 Project ID: ${project.id}`)

      const newTask = await TaskService.createTask({
        ...taskData,
        project_id: project.id
      })

      console.log(`✅ Task created successfully:`, newTask)

      if (newTask) {
        // Sync with SyncService to update all app components
        await SyncService.addTask(newTask)

        // Update tasks list with new task at the top
        setTasks(prev => {
          console.log(`📝 Updating tasks list. Previous count: ${prev.length}, New count: ${prev.length + 1}`)
          return [newTask, ...prev]
        })

        // Update task statistics
        setTaskStats(prev => ({
          ...prev,
          total: prev.total + 1,
          todo: prev.todo + 1
        }))

        // Close the form
        setShowCreateTaskForm(false)

        // Show success notification
        const notification = document.createElement('div')
        notification.innerHTML = `
          <div class="fixed top-4 right-4 bg-green-500/20 backdrop-blur-sm border border-green-400/30 text-green-100 px-4 py-2 rounded-lg z-50">
            ✅ Task "${newTask.name}" created successfully!
          </div>
        `
        document.body.appendChild(notification)
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 3000)
      } else {
        throw new Error('Failed to create task')
      }
    } catch (error) {
      console.error('❌ Failed to create task:', error)

      // Show error notification
      const notification = document.createElement('div')
      notification.innerHTML = `
        <div class="fixed top-4 right-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-100 px-4 py-2 rounded-lg z-50">
          ❌ Failed to create task. Please try again.
        </div>
      `
      document.body.appendChild(notification)
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 3000)
    }
  }

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      const updatedTask = await TaskService.toggleTaskCompletion(taskId, completed)
      if (updatedTask) {
        setTasks(tasks.map(task =>
          task.id === taskId ? updatedTask : task
        ))
        // Reload stats
        const newStats = await TaskService.getProjectTaskStats(project.id)
        setTaskStats(newStats)
      }
    } catch (error) {
      console.error('Failed to toggle task:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const success = await TaskService.deleteTask(taskId)
      if (success) {
        setTasks(tasks.filter(task => task.id !== taskId))
        // Reload stats
        const newStats = await TaskService.getProjectTaskStats(project.id)
        setTaskStats(newStats)
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const handleSaveMetadata = async (metadata: ProjectMetadata) => {
    try {
      const updatedProject = await ProjectService.updateProject(project.id, {
        ...project,
        metadata
      })

      if (updatedProject) {
        setShowMetadataForm(false)
        onProjectUpdate?.(updatedProject)

        // Show success notification
        const notification = document.createElement('div')
        notification.innerHTML = `
          <div class="fixed top-4 right-4 bg-green-500/20 backdrop-blur-sm border border-green-400/30 text-green-100 px-4 py-2 rounded-lg z-50">
            ✅ Project metadata updated successfully!
          </div>
        `
        document.body.appendChild(notification)
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 3000)
      } else {
        throw new Error('Failed to update project metadata')
      }
    } catch (error) {
      console.error('Failed to save metadata:', error)

      // Show error notification
      const notification = document.createElement('div')
      notification.innerHTML = `
        <div class="fixed top-4 right-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-100 px-4 py-2 rounded-lg z-50">
          ❌ Failed to save metadata. Please try again.
        </div>
      `
      document.body.appendChild(notification)
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 3000)
    }
  }

  const handleClaudeTasksGenerated = async (mcpTasks: MCPTask[]) => {
    try {
      // Convert MCP tasks to our Task format and create them
      for (const mcpTask of mcpTasks) {
        const taskData = {
          project_id: project.id,
          name: mcpTask.name,
          description: mcpTask.description || '',
          due_date: mcpTask.due_date || undefined,
          priority: mcpTask.priority,
          status: mcpTask.status,
          completed: mcpTask.completed
        }

        const newTask = await TaskService.createTask(taskData)
        if (newTask) {
          setTasks(prev => [newTask, ...prev])
        }
      }

      // Reload stats
      const newStats = await TaskService.getProjectTaskStats(project.id)
      setTaskStats(newStats)

      // Show success notification
      const notification = document.createElement('div')
      notification.innerHTML = `
        <div class="fixed top-4 right-4 bg-green-500/20 backdrop-blur-sm border border-green-400/30 text-green-100 px-4 py-2 rounded-lg z-50">
          ✅ Added ${mcpTasks.length} Claude-generated tasks to your project!
        </div>
      `
      document.body.appendChild(notification)
      setTimeout(() => document.body.removeChild(notification), 3000)

    } catch (error) {
      console.error('Failed to add Claude tasks:', error)
    }
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-400/20 text-red-100 border-red-400/30'
      case 'high': return 'bg-orange-400/20 text-orange-100 border-orange-400/30'
      case 'medium': return 'bg-yellow-400/20 text-yellow-100 border-yellow-400/30'
      case 'low': return 'bg-green-400/20 text-green-100 border-green-400/30'
      default: return 'bg-gray-400/20 text-gray-100 border-gray-400/30'
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-400/20 text-green-100 border-green-400/30'
      case 'in_progress': return 'bg-blue-400/20 text-blue-100 border-blue-400/30'
      case 'todo': return 'bg-gray-400/20 text-gray-100 border-gray-400/30'
      case 'cancelled': return 'bg-red-400/20 text-red-100 border-red-400/30'
      default: return 'bg-gray-400/20 text-gray-100 border-gray-400/30'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400 flex items-center justify-center">
        <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30 transition-colors border border-white/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white">{project.name}</h1>
              <p className="text-white/70 mt-2">{project.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowMetadataForm(true)}
              className="bg-purple-500/20 backdrop-blur-sm text-purple-300 px-6 py-3 rounded-lg hover:bg-purple-500/30 transition-colors border border-purple-400/30 flex items-center space-x-2"
              title="Project Metadata (DoD, DoR, etc.)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Metadata</span>
            </button>
            <ClaudeIntegration
              project={project}
              onTasksGenerated={handleClaudeTasksGenerated}
            />
            <button
              onClick={() => setShowCreateTaskForm(true)}
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-colors border border-white/30 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{taskStats.total}</div>
            <div className="text-white/70 text-sm">Total Tasks</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-300">{taskStats.completed}</div>
            <div className="text-white/70 text-sm">Completed</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-300">{taskStats.inProgress}</div>
            <div className="text-white/70 text-sm">In Progress</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-300">{taskStats.todo}</div>
            <div className="text-white/70 text-sm">To Do</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-300">{taskStats.overdue}</div>
            <div className="text-white/70 text-sm">Overdue</div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {tasks.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-12 text-center">
            <svg className="w-16 h-16 text-white/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">No tasks yet</h3>
            <p className="text-white/70 mb-6">Start organizing your project by adding tasks.</p>
            <button
              onClick={() => setShowCreateTaskForm(true)}
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-colors border border-white/30"
            >
              Add Your First Task
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <button
                      onClick={() => handleToggleTask(task.id, !task.completed)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        task.completed
                          ? 'bg-green-400/20 border-green-400'
                          : 'border-white/30 hover:border-white/50'
                      }`}
                    >
                      {task.completed && (
                        <svg className="w-4 h-4 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${task.completed ? 'text-white/60 line-through' : 'text-white'}`}>
                        {task.name}
                      </h3>
                      {task.description && (
                        <p className="text-white/70 text-sm mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.replace('_', ' ').slice(1)}
                        </span>
                        {task.due_date && (
                          <span className="text-white/60 text-xs">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-white/60 hover:text-red-300 transition-colors p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Create Task Form Modal */}
      {showCreateTaskForm && (
        <TaskCreateForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowCreateTaskForm(false)}
        />
      )}

      {/* Project Metadata Form Modal */}
      {showMetadataForm && (
        <ProjectMetadataForm
          project={project}
          metadata={project.metadata || {}}
          onSave={handleSaveMetadata}
          onCancel={() => setShowMetadataForm(false)}
        />
      )}
    </div>
  )
}

// Task Creation Form Component
interface TaskFormData {
  name: string
  description: string
  due_date: string
  priority: Task['priority']
}

function TaskCreateForm({ onSubmit, onCancel }: {
  onSubmit: (data: TaskFormData) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<TaskFormData>({
    name: '',
    description: '',
    due_date: '',
    priority: 'medium'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim()) {
      onSubmit(formData)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Add New Task</h2>
          <button
            onClick={onCancel}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Task Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
              placeholder="Enter task name..."
              required
            />
          </div>

          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent resize-none"
              placeholder="Describe the task..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value as Task['priority']})}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
              >
                <option value="low" className="bg-gray-800">Low</option>
                <option value="medium" className="bg-gray-800">Medium</option>
                <option value="high" className="bg-gray-800">High</option>
                <option value="urgent" className="bg-gray-800">Urgent</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
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
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}