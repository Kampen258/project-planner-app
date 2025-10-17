import Anthropic from '@anthropic-ai/sdk';
import { aiContextService, UserContext } from './aiContextService';
// import { documentService } from './documentService'; // Temporarily disabled until DB migration
import { supabase } from '../lib/supabase';
import { Task, Project } from '../types';

// Tool definitions for Claude
const TOOLS = [
  {
    name: 'create_task',
    description: 'Creates a new task in a project',
    input_schema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'The ID of the project to add the task to'
        },
        title: {
          type: 'string',
          description: 'The title of the task'
        },
        description: {
          type: 'string',
          description: 'Detailed description of the task'
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Task priority level'
        },
        due_date: {
          type: 'string',
          description: 'Due date in YYYY-MM-DD format'
        }
      },
      required: ['project_id', 'title']
    }
  },
  {
    name: 'update_task',
    description: 'Updates an existing task',
    input_schema: {
      type: 'object',
      properties: {
        task_id: {
          type: 'string',
          description: 'The ID of the task to update'
        },
        title: {
          type: 'string',
          description: 'New task title'
        },
        description: {
          type: 'string',
          description: 'New task description'
        },
        status: {
          type: 'string',
          enum: ['todo', 'in_progress', 'done'],
          description: 'New task status'
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'New task priority'
        },
        due_date: {
          type: 'string',
          description: 'New due date in YYYY-MM-DD format'
        }
      },
      required: ['task_id']
    }
  },
  {
    name: 'get_project_details',
    description: 'Gets detailed information about a specific project including all its tasks',
    input_schema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'The ID of the project'
        }
      },
      required: ['project_id']
    }
  },
  {
    name: 'analyze_workload',
    description: 'Analyzes the user\'s current workload and provides recommendations',
    input_schema: {
      type: 'object',
      properties: {
        timeframe_days: {
          type: 'integer',
          description: 'Number of days to analyze (default: 7)',
          default: 7
        }
      }
    }
  },
  {
    name: 'create_project',
    description: 'Creates a new project',
    input_schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Project title'
        },
        description: {
          type: 'string',
          description: 'Project description'
        },
        due_date: {
          type: 'string',
          description: 'Project due date in YYYY-MM-DD format'
        },
        status: {
          type: 'string',
          enum: ['planning', 'in_progress', 'completed', 'on_hold'],
          description: 'Initial project status',
          default: 'planning'
        }
      },
      required: ['title']
    }
  },
  {
    name: 'create_document_from_template',
    description: 'Create a new document based on a template (DoD, DoR, project charter, etc.)',
    input_schema: {
      type: 'object',
      properties: {
        template_type: {
          type: 'string',
          enum: ['dod', 'dor', 'project_charter', 'sprint_plan'],
          description: 'Type of document to create'
        },
        project_id: {
          type: 'string',
          description: 'Project this document belongs to'
        },
        title: {
          type: 'string',
          description: 'Custom title for the document'
        },
        customizations: {
          type: 'object',
          description: 'Customizations to apply to the template'
        }
      },
      required: ['template_type', 'project_id']
    }
  },
  {
    name: 'update_document_section',
    description: 'Update a specific section of a document',
    input_schema: {
      type: 'object',
      properties: {
        document_id: {
          type: 'string',
          description: 'ID of the document to update'
        },
        section_name: {
          type: 'string',
          description: 'Name of the section to update'
        },
        action: {
          type: 'string',
          enum: ['add_item', 'remove_item', 'update_item', 'reorder'],
          description: 'What to do with the section'
        },
        content: {
          type: 'object',
          description: 'The content to add/update'
        }
      },
      required: ['document_id', 'section_name', 'action']
    }
  },
  {
    name: 'generate_document_suggestions',
    description: 'Generate contextual suggestions for document content based on project type',
    input_schema: {
      type: 'object',
      properties: {
        document_type: {
          type: 'string',
          description: 'Type of document (dod, dor, project_charter)'
        },
        project_context: {
          type: 'string',
          description: 'Information about the project (type, technology, industry, etc.)'
        }
      },
      required: ['document_type', 'project_context']
    }
  },
  {
    name: 'check_task_against_dod',
    description: 'Check if a task meets the Definition of Done criteria',
    input_schema: {
      type: 'object',
      properties: {
        task_id: {
          type: 'string',
          description: 'ID of the task to check'
        },
        dod_document_id: {
          type: 'string',
          description: 'ID of the Definition of Done document'
        }
      },
      required: ['task_id', 'dod_document_id']
    }
  },
  {
    name: 'list_project_documents',
    description: 'List all documents for a project',
    input_schema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'ID of the project'
        },
        document_type: {
          type: 'string',
          description: 'Filter by document type (optional)'
        }
      },
      required: ['project_id']
    }
  }
];

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export class ClaudeService {
  private client: Anthropic;
  private conversationHistory: Anthropic.Messages.MessageParam[] = [];

  constructor() {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn('Anthropic API key not found. Using mock responses.');
      this.client = null as any;
    } else {
      this.client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
    }
  }

  async handleToolCall(toolName: string, toolInput: any, userId: string): Promise<any> {
    try {
      switch (toolName) {
        case 'create_task':
          return await this.createTask(toolInput, userId);

        case 'update_task':
          return await this.updateTask(toolInput, userId);

        case 'get_project_details':
          return await this.getProjectDetails(toolInput.project_id);

        case 'analyze_workload':
          return await this.analyzeWorkload(userId, toolInput.timeframe_days || 7);

        case 'create_project':
          return await this.createProject(toolInput, userId);

        case 'create_document_from_template':
        case 'update_document_section':
        case 'generate_document_suggestions':
        case 'check_task_against_dod':
        case 'list_project_documents':
          return { error: 'Document features temporarily disabled until database migration is complete' };

        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    } catch (error) {
      console.error(`Tool ${toolName} error:`, error);
      return { error: `Failed to execute ${toolName}: ${error.message}` };
    }
  }

  private async createTask(input: any, userId: string): Promise<any> {
    try {
      // Get the next order_index for this project
      const { data: maxOrderTask } = await supabase
        .from('tasks')
        .select('order_index')
        .eq('project_id', input.project_id)
        .order('order_index', { ascending: false })
        .limit(1)
        .single();

      const newOrderIndex = (maxOrderTask?.order_index || 0) + 1;

      const { data: task, error } = await supabase
        .from('tasks')
        .insert({
          project_id: input.project_id,
          user_id: userId,
          title: input.title,
          description: input.description || '',
          priority: input.priority || 'medium',
          due_date: input.due_date || null,
          status: 'todo',
          ai_suggested: true,
          order_index: newOrderIndex
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        task,
        message: `Task "${input.title}" created successfully`
      };
    } catch (error) {
      console.error('Create task error:', error);
      return { error: error.message };
    }
  }

  private async updateTask(input: any, userId: string): Promise<any> {
    try {
      const updateData: any = {};

      if (input.title) updateData.title = input.title;
      if (input.description) updateData.description = input.description;
      if (input.status) updateData.status = input.status;
      if (input.priority) updateData.priority = input.priority;
      if (input.due_date) updateData.due_date = input.due_date;

      // Set completed_at if status is being changed to done
      if (input.status === 'done') {
        updateData.completed_at = new Date().toISOString();
      } else if (input.status && input.status !== 'done') {
        updateData.completed_at = null;
      }

      const { data: task, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', input.task_id)
        .eq('user_id', userId) // Ensure user can only update their own tasks
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        task,
        message: `Task updated successfully`
      };
    } catch (error) {
      console.error('Update task error:', error);
      return { error: error.message };
    }
  }

  private async getProjectDetails(projectId: string): Promise<any> {
    const result = await aiContextService.getProjectDetails(projectId);
    if (!result) {
      return { error: 'Project not found' };
    }
    return { success: true, ...result };
  }

  private async analyzeWorkload(userId: string, timeframeDays: number): Promise<any> {
    const analysis = await aiContextService.analyzeWorkload(userId, timeframeDays);
    return { success: true, ...analysis };
  }

  private async createProject(input: any, userId: string): Promise<any> {
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          title: input.title,
          description: input.description || '',
          status: input.status || 'planning',
          due_date: input.due_date || null,
          progress: 0,
          ai_generated: true,
          tags: [],
          team_members: []
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        project,
        message: `Project "${input.title}" created successfully`
      };
    } catch (error) {
      console.error('Create project error:', error);
      return { error: error.message };
    }
  }

  async sendMessage(message: string, userId: string): Promise<ChatMessage> {
    // If no API key, return a mock response
    if (!this.client) {
      return {
        id: Date.now().toString(),
        text: "I'm currently in demo mode. To enable full AI capabilities, please add your Anthropic API key to the environment variables.",
        isUser: false,
        timestamp: new Date()
      };
    }

    try {
      // Build user context
      const context = await aiContextService.buildUserContext(userId);
      const systemPrompt = aiContextService.formatContextForAI(context);

      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: message
      });

      // Make API call to Claude
      let response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        tools: TOOLS,
        messages: this.conversationHistory
      });

      // Handle tool use if needed
      if (response.stop_reason === 'tool_use') {
        const toolResults = [];

        for (const block of response.content) {
          if (block.type === 'tool_use') {
            const result = await this.handleToolCall(block.name, block.input, userId);
            toolResults.push({
              type: 'tool_result' as const,
              tool_use_id: block.id,
              content: JSON.stringify(result)
            });
          }
        }

        // Add assistant response and tool results to history
        this.conversationHistory.push({
          role: 'assistant',
          content: response.content
        });

        this.conversationHistory.push({
          role: 'user',
          content: toolResults
        });

        // Get final response after tool use
        response = await this.client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: systemPrompt,
          tools: TOOLS,
          messages: this.conversationHistory
        });
      }

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response.content
      });

      // Keep conversation history manageable (last 20 messages)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      // Extract text from response
      const responseText = response.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n');

      return {
        id: Date.now().toString(),
        text: responseText,
        isUser: false,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Claude API error:', error);
      return {
        id: Date.now().toString(),
        text: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        isUser: false,
        timestamp: new Date()
      };
    }
  }

  // Document management methods
  private async createDocumentFromTemplate(input: any, userId: string): Promise<any> {
    try {
      const result = await documentService.createDocumentFromTemplate(
        userId,
        input.project_id,
        input.template_type,
        input.title,
        input.customizations
      );
      return result;
    } catch (error) {
      console.error('Create document from template error:', error);
      return { error: error.message };
    }
  }

  private async updateDocumentSection(input: any, userId: string): Promise<any> {
    try {
      const result = await documentService.updateDocumentSection(
        input.document_id,
        input.section_name,
        input.action,
        input.content
      );
      return result;
    } catch (error) {
      console.error('Update document section error:', error);
      return { error: error.message };
    }
  }

  private async generateDocumentSuggestions(input: any): Promise<any> {
    try {
      const result = documentService.generateDocumentSuggestions(
        input.document_type,
        input.project_context
      );
      return { success: true, ...result };
    } catch (error) {
      console.error('Generate document suggestions error:', error);
      return { error: error.message };
    }
  }

  private async checkTaskAgainstDoD(input: any): Promise<any> {
    try {
      const result = await documentService.checkTaskAgainstDoD(
        input.task_id,
        input.dod_document_id
      );

      if (!result) {
        return { error: 'Task or DoD document not found' };
      }

      return { success: true, ...result };
    } catch (error) {
      console.error('Check task against DoD error:', error);
      return { error: error.message };
    }
  }

  private async listProjectDocuments(input: any): Promise<any> {
    try {
      const documents = await documentService.getProjectDocuments(
        input.project_id,
        input.document_type
      );

      return {
        success: true,
        documents,
        message: `Found ${documents.length} document(s) for the project`
      };
    } catch (error) {
      console.error('List project documents error:', error);
      return { error: error.message };
    }
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

export const claudeService = new ClaudeService();