#!/usr/bin/env node

/**
 * Claude Projects MCP Server
 * Provides access to Claude project data via Model Context Protocol
 */

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

class ClaudeProjectsServer {
  constructor() {
    this.server = new Server(
      {
        name: 'claude-projects-server',
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
          name: 'get_claude_projects',
          description: 'Get all Claude projects from your account',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Maximum number of projects to return',
                default: 10
              }
            }
          }
        },
        {
          name: 'get_project_details',
          description: 'Get detailed information about a specific Claude project',
          inputSchema: {
            type: 'object',
            properties: {
              projectId: {
                type: 'string',
                description: 'The ID of the project to get details for',
                required: true
              }
            },
            required: ['projectId']
          }
        },
        {
          name: 'create_claude_project',
          description: 'Create a new Claude project',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name of the project',
                required: true
              },
              description: {
                type: 'string',
                description: 'Description of the project'
              }
            },
            required: ['name']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'get_claude_projects':
          return await this.getClaudeProjects(request.params.arguments);

        case 'get_project_details':
          return await this.getProjectDetails(request.params.arguments);

        case 'create_claude_project':
          return await this.createClaudeProject(request.params.arguments);

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
          uri: 'claude://projects',
          mimeType: 'application/json',
          name: 'Claude Projects List',
          description: 'List of all Claude projects'
        }
      ]
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      if (request.params.uri === 'claude://projects') {
        const projects = await this.getClaudeProjects({ limit: 50 });
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

      throw new McpError(
        ErrorCode.InvalidRequest,
        `Unknown resource: ${request.params.uri}`
      );
    });
  }

  async getClaudeProjects(args) {
    try {
      // In a real implementation, this would call the Claude API
      // For now, we'll return mock data that represents Claude projects
      const mockProjects = [
        {
          id: 'proj_001',
          name: 'AI-Powered Marketing Campaign',
          description: 'Using Claude to generate creative marketing content and analyze campaign performance',
          created: '2025-09-15T10:30:00Z',
          updated: '2025-10-01T15:45:00Z',
          status: 'active',
          tags: ['marketing', 'ai', 'content-generation'],
          estimatedStartDate: '2025-10-05',
          estimatedEndDate: '2025-11-30'
        },
        {
          id: 'proj_002',
          name: 'Customer Support Automation',
          description: 'Implementing Claude-based chatbots for 24/7 customer support',
          created: '2025-09-20T14:20:00Z',
          updated: '2025-10-02T09:15:00Z',
          status: 'planning',
          tags: ['customer-support', 'automation', 'chatbot'],
          estimatedStartDate: '2025-10-15',
          estimatedEndDate: '2025-12-15'
        },
        {
          id: 'proj_003',
          name: 'Code Review Assistant',
          description: 'Building a Claude-powered tool to assist with code reviews and documentation',
          created: '2025-09-25T11:45:00Z',
          updated: '2025-10-02T13:30:00Z',
          status: 'development',
          tags: ['development', 'code-review', 'documentation'],
          estimatedStartDate: '2025-10-01',
          estimatedEndDate: '2025-11-15'
        },
        {
          id: 'proj_004',
          name: 'Educational Content Creator',
          description: 'Leveraging Claude to create personalized educational materials and assessments',
          created: '2025-09-28T16:00:00Z',
          updated: '2025-10-02T11:20:00Z',
          status: 'research',
          tags: ['education', 'content-creation', 'personalization'],
          estimatedStartDate: '2025-11-01',
          estimatedEndDate: '2025-01-30'
        }
      ];

      const limit = args?.limit || 10;
      const limitedProjects = mockProjects.slice(0, limit);

      return {
        content: [
          {
            type: 'text',
            text: `Found ${limitedProjects.length} Claude projects:\n\n${limitedProjects.map(p =>
              `• ${p.name} (${p.status})\n  ${p.description}\n  Tags: ${p.tags.join(', ')}\n`
            ).join('\n')}`
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get Claude projects: ${error.message}`
      );
    }
  }

  async getProjectDetails(args) {
    if (!args?.projectId) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'projectId is required'
      );
    }

    try {
      // Mock project details - in real implementation, fetch from Claude API
      const mockProject = {
        id: args.projectId,
        name: 'AI-Powered Marketing Campaign',
        description: 'Using Claude to generate creative marketing content and analyze campaign performance',
        created: '2025-09-15T10:30:00Z',
        updated: '2025-10-01T15:45:00Z',
        status: 'active',
        tags: ['marketing', 'ai', 'content-generation'],
        estimatedStartDate: '2025-10-05',
        estimatedEndDate: '2025-11-30',
        progress: {
          completed: 65,
          milestones: [
            { name: 'Research Phase', completed: true, date: '2025-09-25' },
            { name: 'Content Generation', completed: true, date: '2025-10-10' },
            { name: 'Campaign Testing', completed: false, date: '2025-10-25' },
            { name: 'Launch', completed: false, date: '2025-11-15' }
          ]
        },
        team: [
          { name: 'Sarah Johnson', role: 'Project Manager' },
          { name: 'Mike Chen', role: 'AI Specialist' },
          { name: 'Lisa Rodriguez', role: 'Marketing Director' }
        ]
      };

      return {
        content: [
          {
            type: 'text',
            text: `Project Details for ${mockProject.name}:\n\n` +
                  `Description: ${mockProject.description}\n` +
                  `Status: ${mockProject.status}\n` +
                  `Progress: ${mockProject.progress.completed}%\n` +
                  `Start Date: ${mockProject.estimatedStartDate}\n` +
                  `End Date: ${mockProject.estimatedEndDate}\n` +
                  `Tags: ${mockProject.tags.join(', ')}\n\n` +
                  `Team Members:\n${mockProject.team.map(m => `• ${m.name} - ${m.role}`).join('\n')}`
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get project details: ${error.message}`
      );
    }
  }

  async createClaudeProject(args) {
    if (!args?.name) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'name is required'
      );
    }

    try {
      // Mock project creation - in real implementation, call Claude API
      const newProject = {
        id: `proj_${Date.now()}`,
        name: args.name,
        description: args.description || '',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        status: 'planning',
        tags: [],
        estimatedStartDate: null,
        estimatedEndDate: null
      };

      return {
        content: [
          {
            type: 'text',
            text: `Successfully created Claude project: "${newProject.name}"\n` +
                  `Project ID: ${newProject.id}\n` +
                  `Status: ${newProject.status}\n` +
                  `Created: ${newProject.created}`
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create Claude project: ${error.message}`
      );
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Claude Projects MCP server running on stdio');
  }
}

const server = new ClaudeProjectsServer();
server.run().catch(console.error);