/**
 * MCP Client for Claude Projects Integration
 * Handles communication with MCP servers
 */

export interface ProjectMetadata {
  definitionOfDone?: string[];
  definitionOfReady?: string[];
  projectType?: string;
  methodology?: 'agile' | 'waterfall' | 'kanban' | 'scrum' | 'custom';
  sprintLength?: number;
  teamSize?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  businessValue?: 'low' | 'medium' | 'high' | 'critical';
  technicalComplexity?: 'low' | 'medium' | 'high' | 'very-high';
  customFields?: { [key: string]: any };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  status: string;
  progress: number;
  tags?: string[];
  created?: string;
  updated?: string;
  conversationId?: string;
  lastActivity?: string;
  isLocal?: boolean;
  isPersonal?: boolean;
  metadata?: ProjectMetadata;
}

export interface MCPTask {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  completed: boolean;
  created: string;
  updated: string;
}

interface MCPProject {
  id: string;
  name: string;
  description: string;
  created: string;
  updated: string;
  status: string;
  tags: string[];
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  progress?: number;
}

interface MCPResponse {
  projects?: MCPProject[];
  project?: MCPProject;
  tasks?: MCPTask[];
  task?: MCPTask;
}

interface MCPCallArgs {
  limit?: number;
  projectId?: string;
  taskId?: string;
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  completed?: boolean;
}

class MCPClient {
  private servers: Map<string, any>;
  private isConnected: boolean;

  constructor() {
    this.servers = new Map();
    this.isConnected = false;
  }

  // Initialize MCP client and connect to servers
  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing MCP Client...');

      // Check if bridge server is running
      const response = await fetch('http://localhost:3001/health');
      if (response.ok) {
        const status = await response.json();
        this.isConnected = status.mcpConnected;
        console.log('✅ MCP Bridge Server connected:', status);
        return this.isConnected;
      } else {
        throw new Error('Bridge server not responding');
      }
    } catch (error) {
      console.error('❌ MCP Bridge Server not available, using simulation mode:', error);
      this.isConnected = true; // Still allow simulation mode
      return true;
    }
  }

  // Get Claude projects from MCP server
  async getClaudeProjects(limit = 10): Promise<Project[]> {
    if (!this.isConnected) {
      throw new Error('MCP Client not connected');
    }

    try {
      // Try bridge server first
      try {
        const response = await fetch(`http://localhost:3001/api/claude-projects?limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          console.log('📡 Fetched projects from MCP bridge server:', data.projects);
          return data.projects;
        }
      } catch (bridgeError) {
        console.warn('Bridge server not available, falling back to simulation');
      }

      // Fallback to simulation
      const response = await this.simulateMCPCall('get_claude_projects', { limit });
      return this.parseProjectsResponse(response);
    } catch (error) {
      console.error('Error fetching Claude projects:', error);
      throw error;
    }
  }

  // Get detailed project information
  async getProjectDetails(projectId: string): Promise<MCPProject> {
    if (!this.isConnected) {
      throw new Error('MCP Client not connected');
    }

    try {
      const response = await this.simulateMCPCall('get_project_details', { projectId });
      return response.project!;
    } catch (error) {
      console.error('Error fetching project details:', error);
      throw error;
    }
  }

  // Create a new Claude project
  async createClaudeProject(projectData: MCPCallArgs): Promise<Project> {
    if (!this.isConnected) {
      throw new Error('MCP Client not connected');
    }

    try {
      const response = await this.simulateMCPCall('create_claude_project', projectData);
      return this.parseProjectsResponse({ projects: [response.project!] })[0];
    } catch (error) {
      console.error('Error creating Claude project:', error);
      throw error;
    }
  }

  // Get tasks for a specific project from Claude/MCP
  async getProjectTasks(projectId: string): Promise<MCPTask[]> {
    if (!this.isConnected) {
      throw new Error('MCP Client not connected');
    }

    try {
      const response = await this.simulateMCPCall('get_project_tasks', { projectId });
      return response.tasks || [];
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      throw error;
    }
  }

  // Create a new task in Claude/MCP
  async createTask(taskData: MCPCallArgs): Promise<MCPTask> {
    if (!this.isConnected) {
      throw new Error('MCP Client not connected');
    }

    try {
      const response = await this.simulateMCPCall('create_task', taskData);
      return response.task!;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  // Update a task in Claude/MCP
  async updateTask(taskId: string, taskData: MCPCallArgs): Promise<MCPTask> {
    if (!this.isConnected) {
      throw new Error('MCP Client not connected');
    }

    try {
      const response = await this.simulateMCPCall('update_task', { ...taskData, taskId });
      return response.task!;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  // Delete a task in Claude/MCP
  async deleteTask(taskId: string): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('MCP Client not connected');
    }

    try {
      await this.simulateMCPCall('delete_task', { taskId });
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  // Generate AI suggestions for tasks using Claude
  async generateTaskSuggestions(projectId: string, context?: string): Promise<MCPTask[]> {
    if (!this.isConnected) {
      throw new Error('MCP Client not connected');
    }

    try {
      const response = await this.simulateMCPCall('generate_task_suggestions', {
        projectId,
        description: context
      });
      return response.tasks || [];
    } catch (error) {
      console.error('Error generating task suggestions:', error);
      throw error;
    }
  }

  // Simulate MCP server calls (replace with actual MCP protocol in production)
  private async simulateMCPCall(toolName: string, args: MCPCallArgs): Promise<MCPResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const mockResponses: Record<string, MCPResponse> = {
      get_claude_projects: {
        projects: [
          {
            id: 'claude_proj_001',
            name: 'AI-Powered Customer Service',
            description: 'Implementing Claude for automated customer support with natural language understanding',
            created: '2025-09-15T10:30:00Z',
            updated: '2025-10-01T15:45:00Z',
            status: 'active',
            tags: ['customer-service', 'ai', 'automation'],
            estimatedStartDate: '2025-10-05',
            estimatedEndDate: '2025-12-20',
            progress: 75
          },
          {
            id: 'claude_proj_002',
            name: 'Content Generation Platform',
            description: 'Building a platform that uses Claude to generate marketing content, blog posts, and social media updates',
            created: '2025-09-20T14:20:00Z',
            updated: '2025-10-02T09:15:00Z',
            status: 'development',
            tags: ['content-generation', 'marketing', 'social-media'],
            estimatedStartDate: '2025-10-15',
            estimatedEndDate: '2025-11-30',
            progress: 45
          },
          {
            id: 'claude_proj_003',
            name: 'Legal Document Analysis',
            description: 'Using Claude to analyze and summarize legal documents, contracts, and compliance materials',
            created: '2025-09-25T11:45:00Z',
            updated: '2025-10-02T13:30:00Z',
            status: 'planning',
            tags: ['legal', 'document-analysis', 'compliance'],
            estimatedStartDate: '2025-11-01',
            estimatedEndDate: '2026-01-15',
            progress: 10
          },
          {
            id: 'claude_proj_004',
            name: 'Educational Assistant',
            description: 'Developing an AI tutor using Claude to provide personalized learning experiences',
            created: '2025-09-28T16:00:00Z',
            updated: '2025-10-02T11:20:00Z',
            status: 'research',
            tags: ['education', 'personalization', 'learning'],
            estimatedStartDate: '2025-11-15',
            estimatedEndDate: '2026-02-28',
            progress: 25
          },
          {
            id: 'claude_proj_005',
            name: 'Code Review Automation',
            description: 'Leveraging Claude to automatically review code, suggest improvements, and generate documentation',
            created: '2025-10-01T09:30:00Z',
            updated: '2025-10-02T16:45:00Z',
            status: 'active',
            tags: ['code-review', 'development', 'documentation'],
            estimatedStartDate: '2025-10-10',
            estimatedEndDate: '2025-12-05',
            progress: 30
          }
        ]
      },

      get_project_details: {
        project: {
          id: args.projectId!,
          name: 'AI-Powered Customer Service',
          description: 'Implementing Claude for automated customer support with natural language understanding',
          created: '2025-09-15T10:30:00Z',
          updated: '2025-10-01T15:45:00Z',
          status: 'active',
          progress: 75,
          tags: ['customer-service', 'ai', 'automation'],
          estimatedStartDate: '2025-10-05',
          estimatedEndDate: '2025-12-20'
        }
      },

      create_claude_project: {
        project: {
          id: `claude_proj_${Date.now()}`,
          name: args.name!,
          description: args.description || '',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          status: 'planning',
          progress: 0,
          tags: [],
          estimatedStartDate: args.startDate || undefined,
          estimatedEndDate: args.endDate || undefined
        }
      },

      get_project_tasks: {
        tasks: [
          {
            id: `task_${args.projectId}_001`,
            project_id: args.projectId!,
            name: 'Setup Claude API Integration',
            description: 'Configure Claude API endpoints and authentication for the project',
            due_date: '2025-10-15',
            priority: 'high' as const,
            status: 'todo' as const,
            completed: false,
            created: '2025-10-01T10:00:00Z',
            updated: '2025-10-01T10:00:00Z'
          },
          {
            id: `task_${args.projectId}_002`,
            project_id: args.projectId!,
            name: 'Design User Interface Components',
            description: 'Create responsive UI components for the customer service interface',
            due_date: '2025-10-20',
            priority: 'medium' as const,
            status: 'in_progress' as const,
            completed: false,
            created: '2025-10-01T11:00:00Z',
            updated: '2025-10-02T09:30:00Z'
          },
          {
            id: `task_${args.projectId}_003`,
            project_id: args.projectId!,
            name: 'Implement Natural Language Processing',
            description: 'Integrate Claude for understanding and processing customer queries',
            due_date: '2025-11-01',
            priority: 'high' as const,
            status: 'todo' as const,
            completed: false,
            created: '2025-10-01T12:00:00Z',
            updated: '2025-10-01T12:00:00Z'
          }
        ]
      },

      create_task: {
        task: {
          id: `task_${args.projectId}_${Date.now()}`,
          project_id: args.projectId!,
          name: args.name!,
          description: args.description || '',
          due_date: args.due_date || undefined,
          priority: args.priority || 'medium',
          status: args.status || 'todo',
          completed: args.completed || false,
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        }
      },

      update_task: {
        task: {
          id: args.taskId!,
          project_id: args.projectId!,
          name: args.name || 'Updated Task',
          description: args.description || '',
          due_date: args.due_date || undefined,
          priority: args.priority || 'medium',
          status: args.status || 'todo',
          completed: args.completed || false,
          created: '2025-10-01T10:00:00Z',
          updated: new Date().toISOString()
        }
      },

      delete_task: {
        task: {
          id: args.taskId!,
          project_id: 'deleted',
          name: 'Deleted Task',
          description: '',
          priority: 'low' as const,
          status: 'cancelled' as const,
          completed: false,
          created: '2025-10-01T10:00:00Z',
          updated: new Date().toISOString()
        }
      },

      generate_task_suggestions: {
        tasks: [
          {
            id: `suggestion_${Date.now()}_001`,
            project_id: args.projectId!,
            name: 'Research and Analysis Phase',
            description: 'Conduct market research and analyze user requirements for the project',
            priority: 'high' as const,
            status: 'todo' as const,
            completed: false,
            created: new Date().toISOString(),
            updated: new Date().toISOString()
          },
          {
            id: `suggestion_${Date.now()}_002`,
            project_id: args.projectId!,
            name: 'Create Technical Specifications',
            description: 'Document technical requirements and system architecture',
            priority: 'medium' as const,
            status: 'todo' as const,
            completed: false,
            created: new Date().toISOString(),
            updated: new Date().toISOString()
          },
          {
            id: `suggestion_${Date.now()}_003`,
            project_id: args.projectId!,
            name: 'Setup Development Environment',
            description: 'Configure development tools, CI/CD pipeline, and testing framework',
            priority: 'medium' as const,
            status: 'todo' as const,
            completed: false,
            created: new Date().toISOString(),
            updated: new Date().toISOString()
          },
          {
            id: `suggestion_${Date.now()}_004`,
            project_id: args.projectId!,
            name: 'Quality Assurance and Testing',
            description: 'Implement comprehensive testing strategy and quality assurance processes',
            due_date: '2025-11-15',
            priority: 'high' as const,
            status: 'todo' as const,
            completed: false,
            created: new Date().toISOString(),
            updated: new Date().toISOString()
          }
        ]
      }
    };

    const response = mockResponses[toolName];
    if (!response) {
      throw new Error(`Unknown MCP tool: ${toolName}`);
    }

    return response;
  }

  // Parse projects response from MCP server
  private parseProjectsResponse(response: MCPResponse): Project[] {
    if (!response.projects) {
      throw new Error('Invalid response format from MCP server');
    }

    return response.projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      startDate: project.estimatedStartDate,
      endDate: project.estimatedEndDate,
      status: project.status,
      progress: project.progress || 0,
      tags: project.tags || [],
      created: project.created,
      updated: project.updated
    }));
  }

  // Check if client is connected
  isClientConnected(): boolean {
    return this.isConnected;
  }

  // Disconnect from MCP servers
  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.servers.clear();
    console.log('MCP Client disconnected');
  }
}

// Export singleton instance
export const mcpClient = new MCPClient();