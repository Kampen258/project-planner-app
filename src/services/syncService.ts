import { ProjectService } from './projectService'
import { TaskService } from './taskService'
import type { Project } from '../mcpClient'
import type { Task } from './taskService'

export interface SyncState {
  lastSync: Date | null
  isSyncing: boolean
  projects: Project[]
  tasks: Task[]
  error: string | null
}

export class SyncService {
  private static syncState: SyncState = {
    lastSync: null,
    isSyncing: false,
    projects: [],
    tasks: [],
    error: null
  }

  private static listeners: Set<(state: SyncState) => void> = new Set()

  // Subscribe to sync state changes
  static subscribe(listener: (state: SyncState) => void) {
    this.listeners.add(listener)
    // Immediately call with current state
    listener(this.syncState)

    return () => {
      this.listeners.delete(listener)
    }
  }

  // Notify all listeners of state changes
  private static notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener({ ...this.syncState })
      } catch (error) {
        console.error('Error in sync listener:', error)
      }
    })
  }

  // Update sync state
  private static updateState(updates: Partial<SyncState>) {
    this.syncState = { ...this.syncState, ...updates }
    this.notifyListeners()
  }

  // Get current sync state
  static getState(): SyncState {
    return { ...this.syncState }
  }

  // Full synchronization with database
  static async fullSync(): Promise<{ projects: Project[], tasks: Task[] }> {
    try {
      console.log('🔄 Starting full database sync...')
      this.updateState({ isSyncing: true, error: null })

      // Load all projects from database
      const projects = await ProjectService.getAllProjects()
      console.log(`✅ Synced ${projects.length} projects`)

      // Load all tasks for all projects
      const allTasks: Task[] = []
      for (const project of projects) {
        try {
          const projectTasks = await TaskService.getTasksByProject(project.id)
          allTasks.push(...projectTasks)
        } catch (error) {
          console.error(`Failed to load tasks for project ${project.id}:`, error)
        }
      }
      console.log(`✅ Synced ${allTasks.length} tasks across all projects`)

      // Update sync state
      this.updateState({
        projects,
        tasks: allTasks,
        lastSync: new Date(),
        isSyncing: false,
        error: null
      })

      console.log('✅ Full sync completed successfully')
      return { projects, tasks: allTasks }

    } catch (error) {
      console.error('❌ Full sync failed:', error)
      this.updateState({
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Unknown sync error'
      })
      throw error
    }
  }

  // Sync projects only
  static async syncProjects(): Promise<Project[]> {
    try {
      console.log('🔄 Syncing projects...')

      const projects = await ProjectService.getAllProjects()
      console.log(`✅ Synced ${projects.length} projects`)

      this.updateState({
        projects,
        lastSync: new Date(),
        error: null
      })

      return projects
    } catch (error) {
      console.error('❌ Project sync failed:', error)
      this.updateState({
        error: error instanceof Error ? error.message : 'Failed to sync projects'
      })
      throw error
    }
  }

  // Sync tasks for a specific project
  static async syncProjectTasks(projectId: string): Promise<Task[]> {
    try {
      console.log(`🔄 Syncing tasks for project: ${projectId}`)

      const tasks = await TaskService.getTasksByProject(projectId)
      console.log(`✅ Synced ${tasks.length} tasks for project`)

      // Update tasks in sync state (replace tasks for this project)
      const updatedTasks = this.syncState.tasks.filter(t => t.project_id !== projectId)
      updatedTasks.push(...tasks)

      this.updateState({
        tasks: updatedTasks,
        lastSync: new Date(),
        error: null
      })

      return tasks
    } catch (error) {
      console.error('❌ Task sync failed:', error)
      this.updateState({
        error: error instanceof Error ? error.message : 'Failed to sync tasks'
      })
      throw error
    }
  }

  // Add a new project and sync
  static async addProject(project: Project): Promise<void> {
    try {
      console.log('➕ Adding new project to sync state:', project.name)

      const updatedProjects = [...this.syncState.projects, project]
      this.updateState({
        projects: updatedProjects,
        lastSync: new Date()
      })

    } catch (error) {
      console.error('❌ Failed to add project to sync:', error)
    }
  }

  // Add a new task and sync
  static async addTask(task: Task): Promise<void> {
    try {
      console.log('➕ Adding new task to sync state:', task.name)

      const updatedTasks = [task, ...this.syncState.tasks.filter(t => t.id !== task.id)]
      this.updateState({
        tasks: updatedTasks,
        lastSync: new Date()
      })

    } catch (error) {
      console.error('❌ Failed to add task to sync:', error)
    }
  }

  // Update a project and sync
  static async updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
    try {
      console.log('🔄 Updating project in sync state:', projectId)

      const updatedProjects = this.syncState.projects.map(project =>
        project.id === projectId ? { ...project, ...updates } : project
      )

      this.updateState({
        projects: updatedProjects,
        lastSync: new Date()
      })

    } catch (error) {
      console.error('❌ Failed to update project in sync:', error)
    }
  }

  // Update a task and sync
  static async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    try {
      console.log('🔄 Updating task in sync state:', taskId)

      const updatedTasks = this.syncState.tasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )

      this.updateState({
        tasks: updatedTasks,
        lastSync: new Date()
      })

    } catch (error) {
      console.error('❌ Failed to update task in sync:', error)
    }
  }

  // Remove a project and its tasks from sync
  static async removeProject(projectId: string): Promise<void> {
    try {
      console.log('🗑️ Removing project from sync state:', projectId)

      const updatedProjects = this.syncState.projects.filter(p => p.id !== projectId)
      const updatedTasks = this.syncState.tasks.filter(t => t.project_id !== projectId)

      this.updateState({
        projects: updatedProjects,
        tasks: updatedTasks,
        lastSync: new Date()
      })

    } catch (error) {
      console.error('❌ Failed to remove project from sync:', error)
    }
  }

  // Remove a task from sync
  static async removeTask(taskId: string): Promise<void> {
    try {
      console.log('🗑️ Removing task from sync state:', taskId)

      const updatedTasks = this.syncState.tasks.filter(t => t.id !== taskId)

      this.updateState({
        tasks: updatedTasks,
        lastSync: new Date()
      })

    } catch (error) {
      console.error('❌ Failed to remove task from sync:', error)
    }
  }

  // Get tasks for a specific project from sync state
  static getProjectTasks(projectId: string): Task[] {
    return this.syncState.tasks.filter(task => task.project_id === projectId)
  }

  // Get all projects from sync state
  static getProjects(): Project[] {
    return [...this.syncState.projects]
  }

  // Get all tasks from sync state
  static getAllTasks(): Task[] {
    return [...this.syncState.tasks]
  }

  // Force refresh from database
  static async forceRefresh(): Promise<void> {
    console.log('🔄 Force refreshing all data from database...')
    await this.fullSync()
  }

  // Check if data is stale (older than 5 minutes)
  static isStale(): boolean {
    if (!this.syncState.lastSync) return true
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    return this.syncState.lastSync < fiveMinutesAgo
  }

  // Auto-refresh if stale
  static async autoRefreshIfStale(): Promise<void> {
    if (this.isStale() && !this.syncState.isSyncing) {
      console.log('📅 Data is stale, auto-refreshing...')
      await this.fullSync()
    }
  }
}