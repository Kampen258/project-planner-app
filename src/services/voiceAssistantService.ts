import { mcpClient, type Project } from '../mcpClient'
import { ProjectService } from './projectService'
import { TaskService, type Task } from './taskService'
import { MetadataAIService } from './metadataAIService'
import { SyncService } from './syncService'

export interface VoiceAssistantContext {
  currentProject?: Project | null
  projects: Project[]
  currentTasks: Task[]
  user: {
    name?: string
    preferences?: any
  }
}

export class VoiceAssistantService {
  private static context: VoiceAssistantContext = {
    currentProject: null,
    projects: [],
    currentTasks: [],
    user: {}
  }

  // Initialize the voice assistant with current app context
  static async initialize(initialContext: Partial<VoiceAssistantContext>) {
    this.context = { ...this.context, ...initialContext }

    // Set up the ElevenLabs ConvAI agent with project context
    this.configureConvAIAgent()
  }

  // Update context when user navigates or data changes
  static updateContext(updates: Partial<VoiceAssistantContext>) {
    this.context = { ...this.context, ...updates }
    this.configureConvAIAgent()
  }

  // Configure the ElevenLabs ConvAI agent with current context
  private static configureConvAIAgent() {
    // Send context to the ConvAI agent
    if (typeof window !== 'undefined' && (window as any).ElevenLabs) {
      const contextData = this.buildContextForAgent()

      // Debug logging
      console.log('🎤 Voice Assistant Context Update:', {
        projects: contextData.projectOverview.totalProjects,
        tasks: contextData.taskOverview.totalTasks,
        currentProject: contextData.currentProject?.name,
        capabilities: Object.keys(contextData.capabilities).filter(key => (contextData.capabilities as any)[key]).length
      })

      // Update the agent's knowledge base with current project context
      if ((window as any).ElevenLabs?.updateContext) {
        (window as any).ElevenLabs.updateContext(contextData)
      }
    }
  }

  // Build comprehensive context data for the voice assistant
  private static buildContextForAgent() {
    const { currentProject, projects, currentTasks, user } = this.context

    // Group tasks by project for better organization
    const tasksByProject = this.groupTasksByProject(currentTasks, projects)

    // Get task analytics
    const taskAnalytics = this.getTaskAnalytics(currentTasks)

    const contextData = {
      userInfo: {
        name: user.name || "User",
        currentTime: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        currentPage: this.getCurrentPageContext()
      },

      projectOverview: {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        completedProjects: projects.filter(p => p.status === 'completed').length,
        projectList: projects.map(p => ({
          id: p.id,
          name: p.name,
          status: p.status,
          progress: p.progress,
          description: p.description?.substring(0, 100) + (p.description?.length > 100 ? '...' : ''),
          taskCount: tasksByProject[p.id]?.length || 0,
          completedTaskCount: tasksByProject[p.id]?.filter(t => t.completed).length || 0
        }))
      },

      currentProject: currentProject ? {
        id: currentProject.id,
        name: currentProject.name,
        description: currentProject.description,
        status: currentProject.status,
        progress: currentProject.progress,
        startDate: currentProject.startDate,
        endDate: currentProject.endDate,
        tags: currentProject.tags,
        metadata: currentProject.metadata,
        taskSummary: {
          total: tasksByProject[currentProject.id]?.length || 0,
          completed: tasksByProject[currentProject.id]?.filter(t => t.completed).length || 0,
          inProgress: tasksByProject[currentProject.id]?.filter(t => t.status === 'in_progress').length || 0,
          todo: tasksByProject[currentProject.id]?.filter(t => t.status === 'todo').length || 0,
          urgent: tasksByProject[currentProject.id]?.filter(t => t.priority === 'urgent').length || 0,
          overdue: this.getOverdueTasks(tasksByProject[currentProject.id] || []).length
        },
        recentTasks: this.getRecentTasks(tasksByProject[currentProject.id] || []),
        upcomingTasks: this.getUpcomingTasks(tasksByProject[currentProject.id] || [])
      } : null,

      taskOverview: {
        totalTasks: currentTasks.length,
        completedTasks: currentTasks.filter(t => t.completed).length,
        inProgressTasks: currentTasks.filter(t => t.status === 'in_progress').length,
        todoTasks: currentTasks.filter(t => t.status === 'todo').length,
        urgentTasks: currentTasks.filter(t => t.priority === 'urgent').length,
        overdueTasks: this.getOverdueTasks(currentTasks).length,
        tasksByProject: tasksByProject,
        analytics: taskAnalytics
      },

      capabilities: {
        canCreateProjects: true,
        canCreateTasks: true,
        canUpdateTasks: true,
        canDeleteTasks: true,
        canGenerateMetadata: true,
        canAnalyzeProjects: true,
        canGenerateReports: true,
        canSetReminders: true,
        canManageTaskPriorities: true,
        canTrackTaskProgress: true,
        mcpConnected: mcpClient.isClientConnected()
      },

      recentActivity: this.getRecentActivity()
    }

    return contextData
  }

  // Group tasks by project ID for better organization
  private static groupTasksByProject(tasks: Task[], projects: Project[]) {
    const grouped: { [projectId: string]: Task[] } = {}

    // Initialize with project IDs
    projects.forEach(project => {
      grouped[project.id] = []
    })

    // Group tasks by project
    tasks.forEach(task => {
      if (grouped[task.project_id]) {
        grouped[task.project_id].push(task)
      } else {
        grouped[task.project_id] = [task]
      }
    })

    return grouped
  }

  // Get task analytics for better insights
  private static getTaskAnalytics(tasks: Task[]) {
    const now = new Date()
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    return {
      completionRate: tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length * 100).toFixed(1) + '%' : '0%',
      averageTasksPerProject: this.context.projects.length > 0 ? (tasks.length / this.context.projects.length).toFixed(1) : '0',
      recentlyCompleted: tasks.filter(t => t.completed && new Date(t.updated_at) >= thisWeek).length,
      priorityDistribution: {
        urgent: tasks.filter(t => t.priority === 'urgent').length,
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length
      },
      statusDistribution: {
        todo: tasks.filter(t => t.status === 'todo').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.completed).length,
        cancelled: tasks.filter(t => t.status === 'cancelled').length
      }
    }
  }

  // Get overdue tasks
  private static getOverdueTasks(tasks: Task[]) {
    const now = new Date()
    return tasks.filter(task =>
      task.due_date &&
      new Date(task.due_date) < now &&
      !task.completed
    )
  }

  // Get recent tasks (created or updated in last 7 days)
  private static getRecentTasks(tasks: Task[], limit = 5) {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return tasks
      .filter(task => new Date(task.updated_at) >= oneWeekAgo)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, limit)
      .map(task => ({
        id: task.id,
        name: task.name,
        status: task.status,
        priority: task.priority,
        lastUpdated: task.updated_at
      }))
  }

  // Get upcoming tasks (due within next 7 days)
  private static getUpcomingTasks(tasks: Task[], limit = 5) {
    const now = new Date()
    const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    return tasks
      .filter(task =>
        task.due_date &&
        new Date(task.due_date) >= now &&
        new Date(task.due_date) <= oneWeekFromNow &&
        !task.completed
      )
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
      .slice(0, limit)
      .map(task => ({
        id: task.id,
        name: task.name,
        status: task.status,
        priority: task.priority,
        dueDate: task.due_date
      }))
  }

  // Determine current page context
  private static getCurrentPageContext() {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      if (path.includes('dashboard')) return 'dashboard'
      if (path.includes('projects')) return 'projects'
      if (path.includes('team')) return 'team'
    }
    return 'unknown'
  }

  // Get recent activity summary for context
  private static getRecentActivity() {
    const { projects } = this.context

    // Sort projects by updated date and get recent ones
    const recentProjects = projects
      .filter(p => p.updated)
      .sort((a, b) => new Date(b.updated!).getTime() - new Date(a.updated!).getTime())
      .slice(0, 3)

    return {
      recentProjects: recentProjects.map(p => ({
        name: p.name,
        status: p.status,
        lastUpdated: p.updated
      }))
    }
  }

  // Parse tool response format from ConvAI
  static parseToolResponse(toolResponse: string): { command: string, parameters: any } | null {
    try {
      // Match pattern like: createTask(project="projectflow", taskName="planning", dueDate="tomorrow", description="tasks for next week", priority="medium")
      const toolMatch = toolResponse.match(/(\w+)\((.*)\)/)
      if (!toolMatch) return null

      const [, functionName, paramString] = toolMatch

      // Parse parameters from the string
      const parameters: any = {}
      const paramMatches = paramString.match(/(\w+)="([^"]*?)"/g)

      if (paramMatches) {
        paramMatches.forEach(match => {
          const [key, value] = match.split('=')
          parameters[key] = value.replace(/"/g, '')
        })
      }

      // Map function names to command names
      const commandMapping: { [key: string]: string } = {
        'createTask': 'create_task',
        'createProject': 'create_project',
        'updateTask': 'update_task_status',
        'getProjectStatus': 'get_project_status',
        'listTasks': 'list_project_tasks',
        'getTaskDetails': 'get_task_details'
      }

      const command = commandMapping[functionName] || functionName.toLowerCase()

      return { command, parameters }
    } catch (error) {
      console.error('Error parsing tool response:', error)
      return null
    }
  }

  // Handle voice commands from ConvAI
  static async handleVoiceCommand(command: string, parameters?: any): Promise<any> {
    console.log('Voice command received:', command, parameters)

    // Check if this is a tool response format that needs parsing
    if (typeof command === 'string' && command.includes('(') && command.includes(')')) {
      const parsed = this.parseToolResponse(command)
      if (parsed) {
        console.log('Parsed tool response:', parsed)
        command = parsed.command
        parameters = parsed.parameters
      }
    }

    try {
      switch (command) {
        case 'create_project':
          return await this.createProjectFromVoice(parameters)

        case 'create_task':
          return await this.createTaskFromVoice(parameters)

        case 'get_project_status':
          return await this.getProjectStatusFromVoice(parameters)

        case 'generate_dod_dor':
          return await this.generateDoDDoRFromVoice(parameters)

        case 'get_project_summary':
          return await this.getProjectSummaryFromVoice(parameters)

        case 'analyze_project':
          return await this.analyzeProjectFromVoice(parameters)

        case 'update_project_progress':
          return await this.updateProjectProgressFromVoice(parameters)

        case 'get_task_details':
          return await this.getTaskDetailsFromVoice(parameters)

        case 'update_task_status':
          return await this.updateTaskStatusFromVoice(parameters)

        case 'get_overdue_tasks':
          return await this.getOverdueTasksFromVoice(parameters)

        case 'get_upcoming_tasks':
          return await this.getUpcomingTasksFromVoice(parameters)

        case 'get_task_analytics':
          return await this.getTaskAnalyticsFromVoice(parameters)

        case 'prioritize_tasks':
          return await this.prioritizeTasksFromVoice(parameters)

        case 'list_project_tasks':
          return await this.listProjectTasksFromVoice(parameters)

        case 'list_all_tasks':
          return await this.listAllTasksFromVoice(parameters)

        case 'refresh_tasks':
          return await this.refreshTasksFromVoice(parameters)

        default:
          return {
            success: false,
            message: `Command "${command}" not recognized. Available commands: create_project, create_task, get_project_status, generate_dod_dor, get_project_summary, analyze_project, update_project_progress, get_task_details, update_task_status, get_overdue_tasks, get_upcoming_tasks, get_task_analytics, prioritize_tasks, list_project_tasks, list_all_tasks, refresh_tasks`
          }
      }
    } catch (error) {
      console.error('Error handling voice command:', error)
      return {
        success: false,
        message: 'Sorry, I encountered an error processing your request. Please try again.'
      }
    }
  }

  // Create project from voice input
  private static async createProjectFromVoice(params: any) {
    const { name, description, projectType, methodology } = params

    if (!name) {
      return { success: false, message: 'Project name is required' }
    }

    try {
      const newProject = await ProjectService.createProject({
        name,
        description: description || '',
        status: 'planning',
        progress: 0,
        metadata: {
          projectType,
          methodology,
          customFields: {
            createdViaVoice: true,
            createdAt: new Date().toISOString()
          }
        }
      })

      if (newProject) {
        this.updateContext({
          projects: [...this.context.projects, newProject],
          currentProject: newProject
        })

        // Sync with SyncService to update all app components
        await SyncService.addProject(newProject)

        console.log('✅ Voice Agent: Project created and synced successfully:', {
          projectId: newProject.id,
          projectName: newProject.name
        })

        return {
          success: true,
          message: `Project "${name}" created successfully!`,
          data: newProject
        }
      } else {
        return { success: false, message: 'Failed to create project' }
      }
    } catch (error) {
      return { success: false, message: 'Error creating project: ' + (error as Error).message }
    }
  }

  // Create task from voice input
  private static async createTaskFromVoice(params: any) {
    // Handle different parameter naming conventions from voice agent
    const taskName = params.name || params.taskName || params.task
    const taskDescription = params.description || params.desc
    const taskPriority = params.priority
    const projectId = params.projectId
    const projectName = params.projectName || params.project
    const dueDate = params.dueDate

    let targetProjectId = projectId || this.context.currentProject?.id

    if (!taskName) {
      return { success: false, message: 'Task name is required' }
    }

    // Find project by name if projectName provided
    if (projectName && !targetProjectId) {
      const project = this.context.projects.find(p =>
        p.name.toLowerCase().includes(projectName.toLowerCase())
      )
      if (project) {
        targetProjectId = project.id
      } else {
        return { success: false, message: `Project "${projectName}" not found` }
      }
    }

    if (!targetProjectId) {
      return { success: false, message: 'No project selected. Please specify a project name or select one first.' }
    }

    try {
      // Validate priority
      const validPriorities = ['low', 'medium', 'high', 'urgent']
      const validTaskPriority = validPriorities.includes(taskPriority) ? taskPriority : 'medium'

      const newTask = await TaskService.createTask({
        project_id: targetProjectId,
        name: taskName,
        description: taskDescription || '',
        priority: validTaskPriority,
        status: 'todo',
        completed: false,
        due_date: dueDate || null
      })

      if (newTask) {
        // Update context with new task
        this.updateContext({
          currentTasks: [...this.context.currentTasks, newTask]
        })

        // Sync with SyncService to update all app components
        await SyncService.addTask(newTask)

        // Force refresh project tasks to ensure consistency
        await SyncService.syncProjectTasks(targetProjectId)

        const project = this.context.projects.find(p => p.id === targetProjectId)

        console.log('✅ Voice Agent: Task created and synced successfully:', {
          taskId: newTask.id,
          taskName: newTask.name,
          projectId: targetProjectId,
          projectName: project?.name
        })

        return {
          success: true,
          message: `Task "${taskName}" created successfully in project "${project?.name}"${validTaskPriority !== 'medium' ? ` with ${validTaskPriority} priority` : ''}!`,
          data: newTask
        }
      } else {
        return { success: false, message: 'Failed to create task in database' }
      }
    } catch (error) {
      console.error('Voice command - create task error:', error)
      return { success: false, message: 'Error creating task: ' + (error as Error).message }
    }
  }

  // Get project status from voice
  private static async getProjectStatusFromVoice(params: any) {
    const { projectName, projectId } = params
    let project = this.context.currentProject

    // Find project by name or ID if specified
    if (projectName || projectId) {
      project = this.context.projects.find(p =>
        p.name.toLowerCase().includes((projectName || '').toLowerCase()) ||
        p.id === projectId
      )
    }

    if (!project) {
      return {
        success: false,
        message: projectName
          ? `Project "${projectName}" not found`
          : 'No project selected. Please specify a project name or select one first.'
      }
    }

    const tasks = this.context.currentTasks
    const summary = {
      name: project.name,
      status: project.status,
      progress: project.progress,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.completed).length,
      inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
      todoTasks: tasks.filter(t => t.status === 'todo').length
    }

    return {
      success: true,
      message: `Project "${project.name}" is ${project.status} at ${project.progress}% completion with ${summary.completedTasks} of ${summary.totalTasks} tasks completed.`,
      data: summary
    }
  }

  // Generate DoD/DoR from voice
  private static async generateDoDDoRFromVoice(_params: any) {
    const project = this.context.currentProject

    if (!project) {
      return { success: false, message: 'No project selected. Please select a project first.' }
    }

    try {
      const context = {
        name: project.name,
        description: project.description,
        projectType: project.metadata?.projectType,
        methodology: project.metadata?.methodology,
        teamSize: project.metadata?.teamSize,
        riskLevel: project.metadata?.riskLevel,
        businessValue: project.metadata?.businessValue,
        technicalComplexity: project.metadata?.technicalComplexity
      }

      const criteria = await MetadataAIService.generateDoDAndDoR(context)

      return {
        success: true,
        message: `Generated ${criteria.definitionOfDone.length} Definition of Done and ${criteria.definitionOfReady.length} Definition of Ready criteria for "${project.name}".`,
        data: criteria
      }
    } catch (error) {
      return { success: false, message: 'Error generating criteria: ' + (error as Error).message }
    }
  }

  // Get project summary from voice
  private static async getProjectSummaryFromVoice(_params: any) {
    const { projects, currentProject, currentTasks } = this.context

    const summary = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      currentProject: currentProject ? {
        name: currentProject.name,
        progress: currentProject.progress,
        totalTasks: currentTasks.length,
        completedTasks: currentTasks.filter(t => t.completed).length
      } : null
    }

    const message = currentProject
      ? `You have ${summary.totalProjects} projects total, with ${summary.activeProjects} active. Currently working on "${currentProject.name}" which is ${currentProject.progress}% complete with ${summary.currentProject!.completedTasks} of ${summary.currentProject!.totalTasks} tasks finished.`
      : `You have ${summary.totalProjects} projects total, with ${summary.activeProjects} active and ${summary.completedProjects} completed. No project is currently selected.`

    return {
      success: true,
      message,
      data: summary
    }
  }

  // Analyze project from voice
  private static async analyzeProjectFromVoice(_params: any) {
    const project = this.context.currentProject

    if (!project) {
      return { success: false, message: 'No project selected. Please select a project first.' }
    }

    const tasks = this.context.currentTasks
    const analysis = {
      project: project.name,
      health: this.calculateProjectHealth(project, tasks),
      risks: this.identifyProjectRisks(project, tasks),
      recommendations: this.generateRecommendations(project, tasks)
    }

    return {
      success: true,
      message: `Project "${project.name}" analysis complete. Health score: ${analysis.health.score}/10. ${analysis.risks.length} risks identified.`,
      data: analysis
    }
  }

  // Update project progress from voice
  private static async updateProjectProgressFromVoice(params: any) {
    const { progress, projectId } = params
    const targetProject = projectId
      ? this.context.projects.find(p => p.id === projectId)
      : this.context.currentProject

    if (!targetProject) {
      return { success: false, message: 'No project specified or selected.' }
    }

    if (progress < 0 || progress > 100) {
      return { success: false, message: 'Progress must be between 0 and 100.' }
    }

    try {
      const updatedProject = await ProjectService.updateProject(targetProject.id, {
        ...targetProject,
        progress
      })

      if (updatedProject) {
        this.updateContext({
          projects: this.context.projects.map(p =>
            p.id === targetProject.id ? updatedProject : p
          ),
          currentProject: this.context.currentProject?.id === targetProject.id
            ? updatedProject
            : this.context.currentProject
        })

        return {
          success: true,
          message: `Updated "${targetProject.name}" progress to ${progress}%.`,
          data: updatedProject
        }
      } else {
        return { success: false, message: 'Failed to update project progress.' }
      }
    } catch (error) {
      return { success: false, message: 'Error updating progress: ' + (error as Error).message }
    }
  }

  // Helper methods for analysis
  private static calculateProjectHealth(project: Project, tasks: Task[]) {
    let score = 10
    const now = new Date()

    // Reduce score based on overdue tasks
    const overdueTasks = tasks.filter(t =>
      t.due_date && new Date(t.due_date) < now && !t.completed
    ).length
    score -= Math.min(overdueTasks * 2, 5)

    // Reduce score if project is behind schedule
    if (project.endDate && new Date(project.endDate) < now && project.progress < 100) {
      score -= 3
    }

    // Reduce score if no recent activity
    if (project.updated) {
      const daysSinceUpdate = (now.getTime() - new Date(project.updated).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceUpdate > 7) score -= 2
    }

    return {
      score: Math.max(score, 0),
      factors: {
        overdueTasks,
        isOverdue: project.endDate && new Date(project.endDate) < now && project.progress < 100,
        daysSinceUpdate: project.updated ? (now.getTime() - new Date(project.updated).getTime()) / (1000 * 60 * 60 * 24) : null
      }
    }
  }

  private static identifyProjectRisks(project: Project, tasks: Task[]) {
    const risks = []
    const now = new Date()

    if (project.endDate && new Date(project.endDate) < now && project.progress < 100) {
      risks.push('Project is overdue')
    }

    const overdueTasks = tasks.filter(t =>
      t.due_date && new Date(t.due_date) < now && !t.completed
    ).length

    if (overdueTasks > 0) {
      risks.push(`${overdueTasks} tasks are overdue`)
    }

    if (project.metadata?.riskLevel === 'high' || project.metadata?.riskLevel === 'critical') {
      risks.push(`High ${project.metadata.riskLevel} risk level`)
    }

    if (tasks.length === 0) {
      risks.push('No tasks defined for project')
    }

    return risks
  }

  private static generateRecommendations(project: Project, tasks: Task[]) {
    const recommendations = []

    if (tasks.length === 0) {
      recommendations.push('Create initial project tasks')
    }

    if (!project.metadata?.definitionOfDone) {
      recommendations.push('Define Definition of Done criteria')
    }

    if (project.progress < 50 && tasks.filter(t => t.status === 'in_progress').length === 0) {
      recommendations.push('Start working on tasks to make progress')
    }

    const overdueTasks = tasks.filter(t =>
      t.due_date && new Date(t.due_date) < new Date() && !t.completed
    ).length

    if (overdueTasks > 0) {
      recommendations.push('Focus on completing overdue tasks first')
    }

    return recommendations
  }

  // Get task details from voice command
  private static async getTaskDetailsFromVoice(params: any) {
    const { taskName, taskId, projectName } = params

    // Find tasks based on provided parameters
    let tasks = this.context.currentTasks

    if (projectName) {
      const project = this.context.projects.find(p =>
        p.name.toLowerCase().includes(projectName.toLowerCase())
      )
      if (project) {
        tasks = tasks.filter(t => t.project_id === project.id)
      }
    }

    if (taskId) {
      tasks = tasks.filter(t => t.id === taskId)
    } else if (taskName) {
      tasks = tasks.filter(t =>
        t.name.toLowerCase().includes(taskName.toLowerCase())
      )
    }

    if (tasks.length === 0) {
      return {
        success: false,
        message: taskName ? `No tasks found matching "${taskName}"` : 'No tasks found with the specified criteria'
      }
    }

    if (tasks.length === 1) {
      const task = tasks[0]
      const project = this.context.projects.find(p => p.id === task.project_id)
      return {
        success: true,
        message: `Task "${task.name}" is ${task.status} with ${task.priority} priority${task.due_date ? `, due ${new Date(task.due_date).toLocaleDateString()}` : ''}`,
        data: {
          task: task,
          project: project?.name,
          overdue: task.due_date && new Date(task.due_date) < new Date() && !task.completed
        }
      }
    }

    return {
      success: true,
      message: `Found ${tasks.length} tasks matching your criteria`,
      data: { tasks: tasks.slice(0, 10) } // Limit to 10 tasks
    }
  }

  // Update task status from voice command
  private static async updateTaskStatusFromVoice(params: any) {
    const { taskName, taskId, status, projectName } = params

    if (!status || !['todo', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return {
        success: false,
        message: 'Please specify a valid status: todo, in_progress, completed, or cancelled'
      }
    }

    // Find the task
    let tasks = this.context.currentTasks

    if (projectName) {
      const project = this.context.projects.find(p =>
        p.name.toLowerCase().includes(projectName.toLowerCase())
      )
      if (project) {
        tasks = tasks.filter(t => t.project_id === project.id)
      }
    }

    let targetTask = null
    if (taskId) {
      targetTask = tasks.find(t => t.id === taskId)
    } else if (taskName) {
      const matchingTasks = tasks.filter(t =>
        t.name.toLowerCase().includes(taskName.toLowerCase())
      )
      if (matchingTasks.length === 1) {
        targetTask = matchingTasks[0]
      } else if (matchingTasks.length > 1) {
        return {
          success: false,
          message: `Multiple tasks found matching "${taskName}". Please be more specific.`,
          data: { tasks: matchingTasks.slice(0, 5) }
        }
      }
    }

    if (!targetTask) {
      return {
        success: false,
        message: taskName ? `Task "${taskName}" not found` : 'Task not found'
      }
    }

    try {
      // Update the task in the database
      const updatedTask = await TaskService.updateTask(targetTask.id, {
        ...targetTask,
        status: status,
        completed: status === 'completed',
        updated_at: new Date().toISOString()
      })

      if (updatedTask) {
        // Update context with the updated task
        this.updateContext({
          currentTasks: this.context.currentTasks.map(task =>
            task.id === targetTask.id ? updatedTask : task
          )
        })

        // Sync with SyncService to update all app components
        await SyncService.updateTask(targetTask.id, updatedTask)

        console.log('✅ Voice Agent: Task updated and synced successfully:', {
          taskId: updatedTask.id,
          taskName: updatedTask.name,
          oldStatus: targetTask.status,
          newStatus: status
        })

        return {
          success: true,
          message: `Task "${targetTask.name}" status updated to ${status}`,
          data: { task: updatedTask, previousStatus: targetTask.status, newStatus: status }
        }
      } else {
        return {
          success: false,
          message: 'Failed to update task status in database'
        }
      }
    } catch (error) {
      console.error('Voice command - update task status error:', error)
      return {
        success: false,
        message: 'Error updating task status: ' + (error as Error).message
      }
    }
  }

  // Get overdue tasks from voice
  private static async getOverdueTasksFromVoice(params: any) {
    const { projectName } = params
    let tasks = this.context.currentTasks

    if (projectName) {
      const project = this.context.projects.find(p =>
        p.name.toLowerCase().includes(projectName.toLowerCase())
      )
      if (project) {
        tasks = tasks.filter(t => t.project_id === project.id)
      }
    }

    const overdueTasks = this.getOverdueTasks(tasks)

    if (overdueTasks.length === 0) {
      return {
        success: true,
        message: projectName ? `No overdue tasks in "${projectName}"` : 'No overdue tasks found',
        data: { overdueTasks: [] }
      }
    }

    return {
      success: true,
      message: `Found ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`,
      data: {
        overdueTasks: overdueTasks.map(t => ({
          name: t.name,
          project: this.context.projects.find(p => p.id === t.project_id)?.name,
          dueDate: t.due_date,
          priority: t.priority,
          daysOverdue: Math.floor((new Date().getTime() - new Date(t.due_date!).getTime()) / (1000 * 60 * 60 * 24))
        }))
      }
    }
  }

  // Get upcoming tasks from voice
  private static async getUpcomingTasksFromVoice(params: any) {
    const { projectName, days = 7 } = params
    let tasks = this.context.currentTasks

    if (projectName) {
      const project = this.context.projects.find(p =>
        p.name.toLowerCase().includes(projectName.toLowerCase())
      )
      if (project) {
        tasks = tasks.filter(t => t.project_id === project.id)
      }
    }

    const now = new Date()
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

    const upcomingTasks = tasks.filter(task =>
      task.due_date &&
      new Date(task.due_date) >= now &&
      new Date(task.due_date) <= futureDate &&
      !task.completed
    ).sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())

    if (upcomingTasks.length === 0) {
      return {
        success: true,
        message: `No tasks due in the next ${days} days${projectName ? ` for "${projectName}"` : ''}`,
        data: { upcomingTasks: [] }
      }
    }

    return {
      success: true,
      message: `Found ${upcomingTasks.length} task${upcomingTasks.length > 1 ? 's' : ''} due in the next ${days} days`,
      data: {
        upcomingTasks: upcomingTasks.map(t => ({
          name: t.name,
          project: this.context.projects.find(p => p.id === t.project_id)?.name,
          dueDate: t.due_date,
          priority: t.priority,
          daysUntilDue: Math.ceil((new Date(t.due_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        }))
      }
    }
  }

  // Get task analytics from voice
  private static async getTaskAnalyticsFromVoice(params: any) {
    const { projectName } = params
    let tasks = this.context.currentTasks

    if (projectName) {
      const project = this.context.projects.find(p =>
        p.name.toLowerCase().includes(projectName.toLowerCase())
      )
      if (project) {
        tasks = tasks.filter(t => t.project_id === project.id)
      }
    }

    const analytics = this.getTaskAnalytics(tasks)
    const overdue = this.getOverdueTasks(tasks)
    const upcoming = this.getUpcomingTasks(tasks)

    return {
      success: true,
      message: `Task analytics: ${analytics.completionRate} completion rate, ${overdue.length} overdue, ${upcoming.length} due soon`,
      data: {
        analytics,
        overdueTasks: overdue.length,
        upcomingTasks: upcoming.length,
        scope: projectName || 'all projects'
      }
    }
  }

  // Prioritize tasks from voice
  private static async prioritizeTasksFromVoice(params: any) {
    const { projectName, criteria = 'deadline' } = params
    let tasks = this.context.currentTasks.filter(t => !t.completed)

    if (projectName) {
      const project = this.context.projects.find(p =>
        p.name.toLowerCase().includes(projectName.toLowerCase())
      )
      if (project) {
        tasks = tasks.filter(t => t.project_id === project.id)
      }
    }

    if (tasks.length === 0) {
      return {
        success: false,
        message: projectName ? `No active tasks found in "${projectName}"` : 'No active tasks found'
      }
    }

    // Sort tasks based on criteria
    let sortedTasks
    switch (criteria) {
      case 'deadline':
        sortedTasks = tasks
          .filter(t => t.due_date)
          .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
        break
      case 'priority':
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
        sortedTasks = tasks
          .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
        break
      case 'status':
        const statusOrder: Record<string, number> = { in_progress: 0, todo: 1, completed: 2, cancelled: 3 }
        sortedTasks = tasks
          .sort((a, b) => (statusOrder[a.status] || 999) - (statusOrder[b.status] || 999))
        break
      default:
        sortedTasks = tasks
    }

    const top5 = sortedTasks.slice(0, 5).map(t => ({
      name: t.name,
      priority: t.priority,
      status: t.status,
      dueDate: t.due_date,
      project: this.context.projects.find(p => p.id === t.project_id)?.name
    }))

    return {
      success: true,
      message: `Top 5 tasks prioritized by ${criteria}`,
      data: {
        prioritizedTasks: top5,
        totalTasks: tasks.length,
        criteria
      }
    }
  }

  // List tasks for a specific project
  private static async listProjectTasksFromVoice(params: any) {
    const { projectName, projectId, status, limit = 10 } = params
    let targetProject = this.context.currentProject

    // Find project by name or ID
    if (projectName) {
      targetProject = this.context.projects.find(p =>
        p.name.toLowerCase().includes(projectName.toLowerCase())
      )
    } else if (projectId) {
      targetProject = this.context.projects.find(p => p.id === projectId)
    }

    if (!targetProject) {
      return {
        success: false,
        message: projectName ? `Project "${projectName}" not found` : 'No project selected or specified'
      }
    }

    try {
      // Get fresh tasks from database using the correct method
      const projectTasks = await TaskService.getTasksByProject(targetProject.id)

      // Filter by status if specified
      let filteredTasks = projectTasks
      if (status && ['todo', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        filteredTasks = projectTasks.filter(t => t.status === status)
      }

      const limitedTasks = filteredTasks.slice(0, limit)

      if (limitedTasks.length === 0) {
        return {
          success: true,
          message: `No tasks found in project "${targetProject.name}"${status ? ` with status "${status}"` : ''}`,
          data: { tasks: [], project: targetProject.name, totalTasks: projectTasks.length }
        }
      }

      const taskSummary = limitedTasks.map(task => ({
        id: task.id,
        name: task.name,
        status: task.status,
        priority: task.priority,
        completed: task.completed,
        dueDate: task.due_date,
        description: task.description ? task.description.substring(0, 50) + '...' : null
      }))

      return {
        success: true,
        message: `Found ${limitedTasks.length} task${limitedTasks.length > 1 ? 's' : ''} in project "${targetProject.name}"${status ? ` with status "${status}"` : ''}`,
        data: {
          tasks: taskSummary,
          project: targetProject.name,
          totalTasks: projectTasks.length,
          filteredCount: filteredTasks.length
        }
      }
    } catch (error) {
      console.error('Voice command - list project tasks error:', error)
      return {
        success: false,
        message: 'Error retrieving project tasks: ' + (error as Error).message
      }
    }
  }

  // List all tasks across all projects
  private static async listAllTasksFromVoice(params: any) {
    const { status, priority, limit = 20, includeCompleted = true, refreshFromDb = false } = params

    try {
      let allTasks: Task[] = []

      // If refreshFromDb is true or context seems empty, load fresh data from database
      if (refreshFromDb || this.context.currentTasks.length === 0) {
        console.log('Loading fresh task data from database...')
        // Load tasks from all projects
        for (const project of this.context.projects) {
          try {
            const projectTasks = await TaskService.getTasksByProject(project.id)
            allTasks.push(...projectTasks)
          } catch (error) {
            console.error(`Error loading tasks for project ${project.name}:`, error)
          }
        }

        // Update context with fresh data
        if (allTasks.length > 0) {
          this.updateContext({ currentTasks: allTasks })
        }
      } else {
        // Use existing context data
        allTasks = this.context.currentTasks
      }

      // Apply filters
      if (!includeCompleted) {
        allTasks = allTasks.filter(t => !t.completed)
      }

      if (status && ['todo', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        allTasks = allTasks.filter(t => t.status === status)
      }

      if (priority && ['low', 'medium', 'high', 'urgent'].includes(priority)) {
        allTasks = allTasks.filter(t => t.priority === priority)
      }

      const limitedTasks = allTasks.slice(0, limit)

      if (limitedTasks.length === 0) {
        return {
          success: true,
          message: `No tasks found${status ? ` with status "${status}"` : ''}${priority ? ` with priority "${priority}"` : ''}`,
          data: { tasks: [], totalTasks: this.context.currentTasks.length }
        }
      }

      // Group tasks by project for better organization
      const tasksByProject: { [projectId: string]: any[] } = {}

      limitedTasks.forEach(task => {
        const project = this.context.projects.find(p => p.id === task.project_id)
        const projectName = project?.name || 'Unknown Project'

        if (!tasksByProject[projectName]) {
          tasksByProject[projectName] = []
        }

        tasksByProject[projectName].push({
          id: task.id,
          name: task.name,
          status: task.status,
          priority: task.priority,
          completed: task.completed,
          dueDate: task.due_date,
          description: task.description ? task.description.substring(0, 50) + '...' : null
        })
      })

      return {
        success: true,
        message: `Found ${limitedTasks.length} task${limitedTasks.length > 1 ? 's' : ''} across ${Object.keys(tasksByProject).length} project${Object.keys(tasksByProject).length > 1 ? 's' : ''}`,
        data: {
          tasksByProject,
          totalTasks: this.context.currentTasks.length,
          filteredCount: allTasks.length,
          filters: {
            status: status || null,
            priority: priority || null,
            includeCompleted
          }
        }
      }
    } catch (error) {
      console.error('Voice command - list all tasks error:', error)
      return {
        success: false,
        message: 'Error retrieving tasks: ' + (error as Error).message
      }
    }
  }

  // Refresh task data from database
  private static async refreshTasksFromVoice(params: any) {
    const { projectName } = params

    try {
      let refreshedTasks: Task[] = []
      let projectsToRefresh: Project[] = []

      // Determine which projects to refresh
      if (projectName) {
        const project = this.context.projects.find(p =>
          p.name.toLowerCase().includes(projectName.toLowerCase())
        )
        if (project) {
          projectsToRefresh = [project]
        } else {
          return {
            success: false,
            message: `Project "${projectName}" not found`
          }
        }
      } else {
        projectsToRefresh = this.context.projects
      }

      // Load fresh task data from database
      console.log(`Refreshing task data for ${projectsToRefresh.length} project${projectsToRefresh.length > 1 ? 's' : ''}...`)

      for (const project of projectsToRefresh) {
        try {
          const projectTasks = await TaskService.getTasksByProject(project.id)
          refreshedTasks.push(...projectTasks)
        } catch (error) {
          console.error(`Error refreshing tasks for project ${project.name}:`, error)
        }
      }

      // If refreshing specific project, merge with existing tasks from other projects
      if (projectName) {
        const otherProjectTasks = this.context.currentTasks.filter(task =>
          !projectsToRefresh.some(project => project.id === task.project_id)
        )
        refreshedTasks.push(...otherProjectTasks)
      }

      // Update context with refreshed data
      this.updateContext({ currentTasks: refreshedTasks })

      const message = projectName
        ? `Refreshed ${refreshedTasks.length} tasks for project "${projectName}"`
        : `Refreshed ${refreshedTasks.length} tasks across all projects`

      return {
        success: true,
        message,
        data: {
          totalTasks: refreshedTasks.length,
          projectsRefreshed: projectsToRefresh.length,
          refreshedProjects: projectsToRefresh.map(p => p.name)
        }
      }
    } catch (error) {
      console.error('Voice command - refresh tasks error:', error)
      return {
        success: false,
        message: 'Error refreshing task data: ' + (error as Error).message
      }
    }
  }
}