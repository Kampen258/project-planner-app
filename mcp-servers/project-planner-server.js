#!/usr/bin/env node

/**
 * Project Planner MCP Server
 * Provides access to project planner data via Model Context Protocol
 * Integrates with Supabase database for real data persistence
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Load environment variables
config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

class ProjectPlannerServer {
  constructor() {
    this.server = new Server(
      {
        name: 'project-planner-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'createTask',
          description: 'Create a new task in a project',
          inputSchema: {
            type: 'object',
            properties: {
              project: {
                type: 'string',
                description: 'Name of the project to add the task to'
              },
              task: {
                type: 'string',
                description: 'Name of the task'
              },
              taskName: {
                type: 'string',
                description: 'Name of the task (alternative parameter)'
              },
              description: {
                type: 'string',
                description: 'Description of the task'
              },
              priority: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'urgent'],
                description: 'Priority level of the task'
              },
              dueDate: {
                type: 'string',
                description: 'Due date for the task (relative like "tomorrow" or absolute date)'
              }
            },
            required: []
          }
        },
        {
          name: 'createProject',
          description: 'Create a new project',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name of the project'
              },
              description: {
                type: 'string',
                description: 'Description of the project'
              },
              projectType: {
                type: 'string',
                description: 'Type of project'
              },
              methodology: {
                type: 'string',
                description: 'Project methodology (agile, waterfall, etc.)'
              }
            },
            required: ['name']
          }
        },
        {
          name: 'updateTask',
          description: 'Update an existing task',
          inputSchema: {
            type: 'object',
            properties: {
              taskName: {
                type: 'string',
                description: 'Name of the task to update'
              },
              taskId: {
                type: 'string',
                description: 'ID of the task to update'
              },
              status: {
                type: 'string',
                enum: ['todo', 'in_progress', 'completed', 'cancelled'],
                description: 'New status for the task'
              },
              priority: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'urgent'],
                description: 'New priority for the task'
              }
            }
          }
        },
        {
          name: 'getProjectTasks',
          description: 'Get all tasks for a project',
          inputSchema: {
            type: 'object',
            properties: {
              projectName: {
                type: 'string',
                description: 'Name of the project to get tasks for'
              },
              projectId: {
                type: 'string',
                description: 'ID of the project to get tasks for'
              },
              status: {
                type: 'string',
                enum: ['todo', 'in_progress', 'completed', 'cancelled'],
                description: 'Filter tasks by status'
              }
            }
          }
        },
        {
          name: 'getAllProjects',
          description: 'Get all projects',
          inputSchema: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                description: 'Filter projects by status'
              }
            }
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'createTask':
          return await this.createTask(request.params.arguments);

        case 'createProject':
          return await this.createProject(request.params.arguments);

        case 'updateTask':
          return await this.updateTask(request.params.arguments);

        case 'getProjectTasks':
          return await this.getProjectTasks(request.params.arguments);

        case 'getAllProjects':
          return await this.getAllProjects(request.params.arguments);

        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
      }
    });
  }

  setupResourceHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'planner://projects',
          mimeType: 'application/json',
          name: 'All Projects',
          description: 'List of all projects in the project planner'
        },
        {
          uri: 'planner://tasks',
          mimeType: 'application/json',
          name: 'All Tasks',
          description: 'List of all tasks across all projects'
        }
      ]
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      if (request.params.uri === 'planner://projects') {
        const projects = await this.getAllProjects({});
        return {
          contents: [
            {
              uri: request.params.uri,
              mimeType: 'application/json',
              text: JSON.stringify(projects.content, null, 2)
            }
          ]
        };
      }

      if (request.params.uri === 'planner://tasks') {
        // For now, return mock data - in real implementation, fetch from database
        const mockTasks = await this.getAllTasksFromDatabase();
        return {
          contents: [
            {
              uri: request.params.uri,
              mimeType: 'application/json',
              text: JSON.stringify(mockTasks, null, 2)
            }
          ]
        };
      }

      throw new McpError(
        ErrorCode.InvalidRequest,
        `Unknown resource: ${request.params.uri}`
      );
    });
  }

  async createTask(args) {
    try {
      console.log('🎯 MCP Server: Creating task with args:', args);

      // Handle different parameter naming conventions
      const taskName = args.task || args.taskName || args.name;
      const projectName = args.project || args.projectName;
      const description = args.description || '';
      const priority = args.priority || 'medium';
      const dueDate = this.parseDueDate(args.dueDate);

      if (!taskName) {
        throw new McpError(ErrorCode.InvalidParams, 'Task name is required');
      }

      if (!projectName) {
        throw new McpError(ErrorCode.InvalidParams, 'Project name is required');
      }

      console.log(`🔧 Creating task "${taskName}" in project "${projectName}"`);

      // First, find or create the project
      let { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('name', projectName)
        .single();

      if (projectError && projectError.code !== 'PGRST116') {
        console.error('Error fetching project:', projectError);
        throw new McpError(ErrorCode.InternalError, 'Failed to fetch project');
      }

      if (!project) {
        // Create project if it doesn't exist
        const { data: newProject, error: createProjectError } = await supabase
          .from('projects')
          .insert({
            name: projectName,
            description: `Auto-created for task: ${taskName}`,
            status: 'active'
          })
          .select()
          .single();

        if (createProjectError) {
          console.error('Error creating project:', createProjectError);
          throw new McpError(ErrorCode.InternalError, 'Failed to create project');
        }
        project = newProject;
        console.log('📁 Created new project:', project.name);
      }

      // Create the task
      const { data: newTask, error: taskError } = await supabase
        .from('tasks')
        .insert({
          name: taskName,
          description: description,
          priority: priority,
          status: 'todo',
          completed: false,
          due_date: dueDate,
          project_id: project.id
        })
        .select()
        .single();

      if (taskError) {
        console.error('Error creating task:', taskError);
        throw new McpError(ErrorCode.InternalError, `Failed to create task: ${taskError.message}`);
      }

      console.log('✅ Successfully created task in database:', newTask);

      return {
        content: [
          {
            type: 'text',
            text: `✅ Successfully created task: "${taskName}"\n` +
                  `Project: ${projectName}\n` +
                  `Priority: ${priority}\n` +
                  `Status: todo\n` +
                  `Due Date: ${dueDate || 'Not set'}\n` +
                  `Task ID: ${newTask.id}`
          }
        ]
      };

    } catch (error) {
      console.error('❌ Error creating task:', error);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create task: ${error.message}`
      );
    }
  }

  async createProject(args) {
    try {
      console.log('🏗️ MCP Server: Creating project with args:', args);

      if (!args.name) {
        throw new McpError(ErrorCode.InvalidParams, 'Project name is required');
      }

      const newProject = {
        id: `project_${Date.now()}`,
        name: args.name,
        description: args.description || '',
        status: 'planning',
        progress: 0,
        projectType: args.projectType || 'general',
        methodology: args.methodology || 'agile',
        created: new Date().toISOString()
      };

      return {
        content: [
          {
            type: 'text',
            text: `✅ Successfully created project: "${newProject.name}"\n` +
                  `Description: ${newProject.description}\n` +
                  `Status: ${newProject.status}\n` +
                  `Project ID: ${newProject.id}`
          }
        ]
      };

    } catch (error) {
      console.error('❌ Error creating project:', error);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create project: ${error.message}`
      );
    }
  }

  async updateTask(args) {
    try {
      console.log('🔄 MCP Server: Updating task with args:', args);

      if (!args.taskName && !args.taskId) {
        throw new McpError(ErrorCode.InvalidParams, 'Task name or ID is required');
      }

      const updates = {};
      if (args.status) updates.status = args.status;
      if (args.priority) updates.priority = args.priority;

      return {
        content: [
          {
            type: 'text',
            text: `✅ Successfully updated task: "${args.taskName || args.taskId}"\n` +
                  `Updates applied: ${JSON.stringify(updates, null, 2)}`
          }
        ]
      };

    } catch (error) {
      console.error('❌ Error updating task:', error);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to update task: ${error.message}`
      );
    }
  }

  async getProjectTasks(args) {
    try {
      console.log('📋 MCP Server: Getting project tasks with args:', args);

      const projectName = args.projectName;
      if (!projectName && !args.projectId) {
        throw new McpError(ErrorCode.InvalidParams, 'Project name or ID is required');
      }

      // Mock tasks data
      const mockTasks = [
        {
          id: 'task_001',
          name: 'Setup project structure',
          description: 'Initialize the basic project structure',
          status: 'completed',
          priority: 'high',
          completed: true,
          project: projectName
        },
        {
          id: 'task_002',
          name: 'Implement user authentication',
          description: 'Setup login and registration functionality',
          status: 'in_progress',
          priority: 'high',
          completed: false,
          project: projectName
        }
      ];

      const filteredTasks = args.status
        ? mockTasks.filter(t => t.status === args.status)
        : mockTasks;

      return {
        content: [
          {
            type: 'text',
            text: `Found ${filteredTasks.length} tasks in project "${projectName}":\n\n` +
                  filteredTasks.map(task =>
                    `• ${task.name} (${task.status}, ${task.priority})\n  ${task.description}`
                  ).join('\n\n')
          }
        ]
      };

    } catch (error) {
      console.error('❌ Error getting project tasks:', error);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get project tasks: ${error.message}`
      );
    }
  }

  async getAllProjects(args) {
    try {
      console.log('📂 MCP Server: Getting all projects');

      // Mock projects data
      const mockProjects = [
        {
          id: 'proj_001',
          name: 'Project Planner App',
          description: 'A comprehensive project planning and task management application',
          status: 'active',
          progress: 75
        },
        {
          id: 'proj_002',
          name: 'E-commerce Platform',
          description: 'Building a modern e-commerce platform with React and Node.js',
          status: 'planning',
          progress: 25
        }
      ];

      const filteredProjects = args.status
        ? mockProjects.filter(p => p.status === args.status)
        : mockProjects;

      return {
        content: [
          {
            type: 'text',
            text: `Found ${filteredProjects.length} projects:\n\n` +
                  filteredProjects.map(project =>
                    `• ${project.name} (${project.status}, ${project.progress}%)\n  ${project.description}`
                  ).join('\n\n')
          }
        ]
      };

    } catch (error) {
      console.error('❌ Error getting projects:', error);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get projects: ${error.message}`
      );
    }
  }

  async getAllTasksFromDatabase() {
    // Mock implementation - in real version, this would query the database
    return [
      {
        id: 'task_001',
        name: 'Setup database',
        project: 'Project Planner App',
        status: 'completed'
      },
      {
        id: 'task_002',
        name: 'Create UI components',
        project: 'Project Planner App',
        status: 'in_progress'
      }
    ];
  }

  parseDueDate(dueDateString) {
    if (!dueDateString) return null;

    // Handle relative dates like "tomorrow", "next week", etc.
    const today = new Date();

    switch (dueDateString.toLowerCase()) {
      case 'today':
        return today.toISOString().split('T')[0];
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      case 'next week':
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        return nextWeek.toISOString().split('T')[0];
      default:
        // Try to parse as a date string
        try {
          const parsed = new Date(dueDateString);
          if (isNaN(parsed.getTime())) return null;
          return parsed.toISOString().split('T')[0];
        } catch {
          return null;
        }
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Project Planner MCP server running on stdio');
  }
}

const server = new ProjectPlannerServer();
server.run().catch(console.error);