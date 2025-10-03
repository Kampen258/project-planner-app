import Anthropic from '@anthropic-ai/sdk';
import type { Project, Task } from '../types';

// Modern Claude AI Service with 2025 best practices
export class ModernClaudeService {
  private client: Anthropic;
  private conversationMemory: Map<string, Anthropic.Messages.MessageParam[]> = new Map();

  constructor() {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn('Anthropic API key not found. Claude integration will use mock responses.');
    }

    this.client = new Anthropic({
      apiKey: apiKey || 'mock-key',
      dangerouslyAllowBrowser: true, // Enable browser usage
    });
  }

  /**
   * Generate tasks using Claude 3.5 Sonnet with streaming
   */
  async generateTasksWithStreaming(
    projectContext: {
      name: string;
      description: string;
      additionalContext?: string;
    },
    onChunk: (chunk: string) => void,
    sessionId?: string
  ): Promise<string> {
    try {
      const messages = this.buildTaskGenerationMessages(projectContext);

      if (sessionId) {
        const history = this.conversationMemory.get(sessionId) || [];
        messages.unshift(...history);
      }

      const stream = this.client.messages.stream({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        temperature: 0.7,
        messages,
        system: this.getSystemPrompt(),
      });

      let fullResponse = '';

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          const text = chunk.delta.text;
          fullResponse += text;
          onChunk(text);
        }
      }

      // Store conversation in memory
      if (sessionId) {
        this.updateConversationMemory(sessionId, messages, fullResponse);
      }

      return fullResponse;

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Claude API error:', error);
      }

      // Fallback to mock response
      return this.getMockTaskResponse(projectContext);
    }
  }

  /**
   * Generate conversational response for project creation
   */
  async generateConversationalResponse(
    context: {
      step: number;
      userInput: string;
      projectContext: any;
      sessionId: string;
    },
    onChunk: (chunk: string) => void
  ): Promise<string> {
    try {
      const messages = this.buildConversationalMessages(context);

      const stream = this.client.messages.stream({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        temperature: 0.8,
        messages,
        system: this.getConversationalSystemPrompt(),
      });

      let fullResponse = '';

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          const text = chunk.delta.text;
          fullResponse += text;
          onChunk(text);
        }
      }

      // Store conversation in memory
      this.updateConversationMemory(context.sessionId, messages, fullResponse);

      return fullResponse;

    } catch (error) {
      console.error('Conversational response error:', error);
      return this.getMockConversationalResponse(context);
    }
  }

  /**
   * Generate complete project with tasks
   */
  async generateProjectWithTasks(
    projectData: {
      name: string;
      description: string;
      type: string;
      timeline: string;
      team: string;
      goals: string[];
      additionalContext?: string;
    },
    onChunk: (chunk: string) => void,
    sessionId: string
  ): Promise<{
    name: string;
    description: string;
    tasks: Array<{
      name: string;
      description: string;
      priority: 'low' | 'medium' | 'high' | 'urgent';
      status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
      estimated_effort: string;
    }>;
    tags: string[];
    timeline: { start?: string; end?: string };
  }> {
    try {
      const messages = this.buildProjectGenerationMessages(projectData);

      const stream = this.client.messages.stream({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        temperature: 0.7,
        messages,
        system: this.getProjectGenerationSystemPrompt(),
      });

      let fullResponse = '';

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          const text = chunk.delta.text;
          fullResponse += text;
          onChunk(text);
        }
      }

      // Parse the response and extract structured data
      const structuredProject = this.parseProjectResponse(fullResponse, projectData);

      return structuredProject;

    } catch (error) {
      console.error('Project generation error:', error);
      return this.getMockProjectWithTasks(projectData);
    }
  }

  /**
   * Generate tasks with single response (non-streaming)
   */
  async generateTasks(
    projectContext: {
      name: string;
      description: string;
      additionalContext?: string;
    },
    sessionId?: string
  ): Promise<{
    tasks: Array<{
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
      estimated_effort: string;
      category?: string;
    }>;
    suggestions: string[];
  }> {
    try {
      const messages = this.buildTaskGenerationMessages(projectContext);

      if (sessionId) {
        const history = this.conversationMemory.get(sessionId) || [];
        messages.unshift(...history);
      }

      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        temperature: 0.7,
        messages,
        system: this.getSystemPrompt(),
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Store conversation in memory
      if (sessionId) {
        this.updateConversationMemory(sessionId, messages, content.text);
      }

      return this.parseTaskResponse(content.text);

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Claude API error:', error);
      }

      // Fallback to mock response
      const mockResponse = this.getMockTaskResponse(projectContext);
      return this.parseTaskResponse(mockResponse);
    }
  }

  /**
   * Analyze project and suggest improvements
   */
  async analyzeProject(project: Project, tasks: Task[]): Promise<{
    insights: string[];
    recommendations: string[];
    riskAssessment: {
      level: 'low' | 'medium' | 'high';
      factors: string[];
    };
  }> {
    try {
      const messages: Anthropic.Messages.MessageParam[] = [
        {
          role: 'user',
          content: `Analyze this project and its tasks:

Project: ${project.title}
Description: ${project.description}
Status: ${project.status}
Progress: ${project.progress}%

Tasks (${tasks.length} total):
${tasks.map(task => `- ${task.title} (${task.status}, Priority: ${task.priority})`).join('\n')}

Provide insights, recommendations, and risk assessment.`
        }
      ];

      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 3000,
        temperature: 0.3,
        messages,
        system: `You are an expert project manager and analyst. Provide structured analysis in JSON format:
{
  "insights": ["insight1", "insight2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "riskAssessment": {
    "level": "low|medium|high",
    "factors": ["factor1", "factor2", ...]
  }
}`,
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return JSON.parse(content.text);

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Claude analysis error:', error);
      }

      return {
        insights: [
          'Project appears to be well-structured',
          'Task distribution looks balanced',
        ],
        recommendations: [
          'Consider breaking down larger tasks',
          'Add more detailed descriptions to tasks',
        ],
        riskAssessment: {
          level: 'low' as const,
          factors: ['Limited information available for detailed analysis'],
        },
      };
    }
  }

  /**
   * Process speech input and convert to task creation
   */
  async processVoiceInput(
    speechText: string,
    projectContext?: {
      projectId: string;
      projectName: string;
    }
  ): Promise<{
    intent: 'create_task' | 'create_project' | 'query' | 'unknown';
    data?: {
      title?: string;
      description?: string;
      priority?: 'low' | 'medium' | 'high';
      project_id?: string;
    };
    clarification?: string;
  }> {
    try {
      const messages: Anthropic.Messages.MessageParam[] = [
        {
          role: 'user',
          content: `Analyze this voice input and determine the user's intent: "${speechText}"

${projectContext ? `Context: Currently in project "${projectContext.projectName}" (ID: ${projectContext.projectId})` : ''}

Return JSON with:
{
  "intent": "create_task|create_project|query|unknown",
  "data": {
    "title": "extracted title",
    "description": "extracted description",
    "priority": "low|medium|high",
    "project_id": "${projectContext?.projectId || ''}"
  },
  "clarification": "question if more info needed"
}`
        }
      ];

      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.1,
        messages,
        system: `You are a voice command parser for a project management app. Extract structured data from natural language voice commands. Be precise and only extract clear information.`,
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return JSON.parse(content.text);

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Voice processing error:', error);
      }

      return {
        intent: 'unknown' as const,
        clarification: 'I couldn\'t understand that command. Could you try again?',
      };
    }
  }

  /**
   * Clear conversation memory for a session
   */
  clearConversationMemory(sessionId: string): void {
    this.conversationMemory.delete(sessionId);
  }

  /**
   * Get conversation history for a session
   */
  getConversationHistory(sessionId: string): Anthropic.Messages.MessageParam[] {
    return this.conversationMemory.get(sessionId) || [];
  }

  // Private methods
  private buildTaskGenerationMessages(projectContext: {
    name: string;
    description: string;
    additionalContext?: string;
  }): Anthropic.Messages.MessageParam[] {
    return [
      {
        role: 'user',
        content: `Generate tasks for this project:

Project Name: ${projectContext.name}
Description: ${projectContext.description}
${projectContext.additionalContext ? `Additional Context: ${projectContext.additionalContext}` : ''}

Please provide a comprehensive list of tasks with realistic priorities and effort estimates.`
      }
    ];
  }

  private getSystemPrompt(): string {
    return `You are an expert project management assistant specializing in task breakdown and project planning.

For task generation:
- Create specific, actionable tasks
- Estimate effort realistically (hours/days/weeks)
- Set appropriate priorities (high/medium/low)
- Include dependencies where relevant
- Consider different skill levels and roles
- Break down complex tasks into smaller ones

Provide responses in a structured format that can be parsed and integrated into a project management system.

Always be practical, realistic, and helpful in your suggestions.`;
  }

  private updateConversationMemory(
    sessionId: string,
    messages: Anthropic.Messages.MessageParam[],
    response: string
  ): void {
    const history = this.conversationMemory.get(sessionId) || [];

    // Add the last user message and the assistant's response
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage) {
      history.push(lastUserMessage);
      history.push({
        role: 'assistant',
        content: response,
      });
    }

    // Keep only last 10 exchanges (20 messages) to manage memory
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    this.conversationMemory.set(sessionId, history);
  }

  private parseTaskResponse(response: string): {
    tasks: Array<{
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
      estimated_effort: string;
      category?: string;
    }>;
    suggestions: string[];
  } {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response);
      if (parsed.tasks && Array.isArray(parsed.tasks)) {
        return parsed;
      }
    } catch {
      // If JSON parsing fails, extract tasks from text
    }

    // Fallback: parse text format
    const tasks = this.extractTasksFromText(response);
    const suggestions = this.extractSuggestionsFromText(response);

    return { tasks, suggestions };
  }

  private extractTasksFromText(text: string): Array<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    estimated_effort: string;
    category?: string;
  }> {
    const tasks = [];
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.includes('Task:') || line.match(/^\d+\./)) {
        const title = line.replace(/^.*?Task:\s*/, '').replace(/^\d+\.\s*/, '').trim();
        if (title) {
          tasks.push({
            title,
            description: `Generated task: ${title}`,
            priority: 'medium' as const,
            estimated_effort: '2-4 hours',
          });
        }
      }
    }

    return tasks.length > 0 ? tasks : this.getDefaultTasks();
  }

  private extractSuggestionsFromText(text: string): string[] {
    const suggestions = [];
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.includes('Suggestion:') || line.includes('Tip:')) {
        const suggestion = line.replace(/^.*?(Suggestion|Tip):\s*/, '').trim();
        if (suggestion) {
          suggestions.push(suggestion);
        }
      }
    }

    return suggestions.length > 0 ? suggestions : [
      'Break down large tasks into smaller, manageable pieces',
      'Set realistic deadlines and priorities',
      'Regular check-ins can help track progress'
    ];
  }

  private getMockTaskResponse(projectContext: {
    name: string;
    description: string;
    additionalContext?: string;
  }): string {
    return `Based on your project "${projectContext.name}", here are suggested tasks:

1. **Project Setup** - Set up development environment and project structure
   - Priority: High
   - Effort: 4-6 hours

2. **Requirements Analysis** - Define detailed requirements and specifications
   - Priority: High
   - Effort: 1-2 days

3. **Design Phase** - Create system design and architecture
   - Priority: Medium
   - Effort: 3-5 days

4. **Implementation** - Core development work
   - Priority: Medium
   - Effort: 2-3 weeks

5. **Testing** - Unit tests, integration tests, and QA
   - Priority: Medium
   - Effort: 1 week

6. **Documentation** - User guides and technical documentation
   - Priority: Low
   - Effort: 3-5 days

**Suggestions:**
- Start with high-priority tasks first
- Consider parallel work on independent tasks
- Regular progress reviews recommended`;
  }

  private getDefaultTasks(): Array<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    estimated_effort: string;
    category?: string;
  }> {
    return [
      {
        title: 'Project Planning',
        description: 'Define project scope, requirements, and timeline',
        priority: 'high',
        estimated_effort: '1-2 days',
        category: 'Planning',
      },
      {
        title: 'Research and Analysis',
        description: 'Research best practices and analyze requirements',
        priority: 'high',
        estimated_effort: '3-5 days',
        category: 'Research',
      },
      {
        title: 'Implementation',
        description: 'Core development and implementation work',
        priority: 'medium',
        estimated_effort: '1-2 weeks',
        category: 'Development',
      },
      {
        title: 'Testing and QA',
        description: 'Comprehensive testing and quality assurance',
        priority: 'medium',
        estimated_effort: '3-5 days',
        category: 'Testing',
      },
    ];
  }

  // New methods for conversational project creation

  private buildConversationalMessages(context: {
    step: number;
    userInput: string;
    projectContext: any;
    sessionId: string;
  }): Anthropic.Messages.MessageParam[] {
    const stepPrompts = {
      1: `The user wants to create: "${context.userInput}". Ask a thoughtful follow-up question to understand their main goals or what success looks like for this project.`,
      2: `Project context: ${JSON.stringify(context.projectContext)}. User's goal: "${context.userInput}". Ask about timeline or urgency - when do they want to have this completed?`,
      3: `Project context: ${JSON.stringify(context.projectContext)}. Timeline input: "${context.userInput}". Ask about team size or if they need help from others.`,
      4: `Project context: ${JSON.stringify(context.projectContext)}. Team info: "${context.userInput}". Ask about their main success criteria or what would make this project a win.`,
      5: `Project context: ${JSON.stringify(context.projectContext)}. Success criteria: "${context.userInput}". Ask if there are any constraints, preferences, or additional context they'd like to share.`,
      6: `Project context: ${JSON.stringify(context.projectContext)}. Additional context: "${context.userInput}". Thank them and let them know you'll now generate their complete project plan.`
    };

    return [{
      role: 'user',
      content: stepPrompts[context.step as keyof typeof stepPrompts] || `Continue the conversation based on: "${context.userInput}"`
    }];
  }

  private getConversationalSystemPrompt(): string {
    return `You are an enthusiastic and helpful AI project creation assistant. Your job is to guide users through creating detailed project plans through natural conversation.

Guidelines:
- Be conversational, friendly, and encouraging
- Ask one focused question at a time
- Keep responses concise (2-3 sentences max)
- Show genuine interest in their project
- Use emojis sparingly but appropriately
- Build on their previous answers
- Make them feel excited about their project

Your goal is to gather enough information to create a comprehensive project plan with tasks, timeline, and structure.`;
  }

  private buildProjectGenerationMessages(projectData: {
    name: string;
    description: string;
    type: string;
    timeline: string;
    team: string;
    goals: string[];
    additionalContext?: string;
  }): Anthropic.Messages.MessageParam[] {
    return [{
      role: 'user',
      content: `Generate a complete project plan based on this information:

Project Name: ${projectData.name}
Type: ${projectData.type}
Description: ${projectData.description}
Timeline: ${projectData.timeline}
Team: ${projectData.team}
Goals: ${projectData.goals.join(', ')}
Additional Context: ${projectData.additionalContext || 'None'}

Please create:
1. A refined project description
2. 6-12 specific, actionable tasks
3. Appropriate tags
4. Realistic timeline estimates

Format the response for easy parsing and display.`
    }];
  }

  private getProjectGenerationSystemPrompt(): string {
    return `You are an expert project manager who creates detailed, actionable project plans.

Create comprehensive project plans that include:
- Clear, specific tasks that are actionable
- Realistic effort estimates
- Appropriate priorities based on dependencies
- Tasks that cover the full project lifecycle
- Consider the team size and timeline constraints

Always provide practical, implementable advice that helps users succeed with their projects.`;
  }

  private parseProjectResponse(response: string, originalData: any): {
    name: string;
    description: string;
    tasks: Array<{
      name: string;
      description: string;
      priority: 'low' | 'medium' | 'high' | 'urgent';
      status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
      estimated_effort: string;
    }>;
    tags: string[];
    timeline: { start?: string; end?: string };
  } {
    // Extract tasks from the response
    const tasks = this.extractTasksFromResponse(response);

    // Generate tags based on project type and content
    const tags = this.generateProjectTags(originalData);

    // Calculate timeline
    const timeline = this.calculateTimeline(originalData.timeline);

    return {
      name: originalData.name,
      description: originalData.description,
      tasks,
      tags,
      timeline
    };
  }

  private extractTasksFromResponse(response: string): Array<{
    name: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
    estimated_effort: string;
  }> {
    const tasks = [];
    const lines = response.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Look for numbered lists or bullet points
      if (line.match(/^\d+\./) || line.match(/^[-*]\s/)) {
        const taskName = line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim();

        if (taskName) {
          // Look for additional context in following lines
          let description = `Task: ${taskName}`;
          let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
          let effort = '2-4 hours';

          // Check next few lines for details
          for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
            const nextLine = lines[j].trim().toLowerCase();
            if (nextLine.includes('priority') && nextLine.includes('high')) priority = 'high';
            if (nextLine.includes('priority') && nextLine.includes('low')) priority = 'low';
            if (nextLine.includes('urgent')) priority = 'urgent';
            if (nextLine.match(/\d+\s*(hour|day|week)/)) {
              effort = nextLine.match(/\d+\s*(hour|day|week)s?/)?.[0] || effort;
            }
          }

          tasks.push({
            name: taskName,
            description,
            priority,
            status: 'todo' as const,
            estimated_effort: effort
          });
        }
      }
    }

    // Fallback to default tasks if none found
    if (tasks.length === 0) {
      return [
        {
          name: 'Project Setup',
          description: 'Initialize project structure and environment',
          priority: 'high',
          status: 'todo',
          estimated_effort: '4-6 hours'
        },
        {
          name: 'Planning and Research',
          description: 'Research requirements and create detailed plan',
          priority: 'high',
          status: 'todo',
          estimated_effort: '1-2 days'
        },
        {
          name: 'Core Implementation',
          description: 'Develop main features and functionality',
          priority: 'medium',
          status: 'todo',
          estimated_effort: '1-2 weeks'
        },
        {
          name: 'Testing and QA',
          description: 'Test functionality and ensure quality',
          priority: 'medium',
          status: 'todo',
          estimated_effort: '3-5 days'
        }
      ];
    }

    return tasks;
  }

  private generateProjectTags(projectData: any): string[] {
    const tags = ['AI Generated'];

    const type = projectData.type?.toLowerCase() || '';
    const timeline = projectData.timeline?.toLowerCase() || '';
    const team = projectData.team?.toLowerCase() || '';

    // Add type-based tags
    if (type.includes('web')) tags.push('Web Development');
    if (type.includes('mobile') || type.includes('app')) tags.push('Mobile');
    if (type.includes('ai') || type.includes('ml')) tags.push('AI/ML');
    if (type.includes('learning')) tags.push('Educational');
    if (type.includes('business')) tags.push('Business');

    // Add timeline-based tags
    if (timeline.includes('week')) tags.push('Short-term');
    if (timeline.includes('month')) tags.push('Medium-term');
    if (timeline.includes('6') || timeline.includes('long')) tags.push('Long-term');

    // Add team-based tags
    if (team.includes('solo')) tags.push('Solo');
    if (team.includes('team')) tags.push('Team Project');

    return tags;
  }

  private calculateTimeline(timelineInput: string): { start?: string; end?: string } {
    const today = new Date();
    const start = today.toISOString().split('T')[0];

    const input = timelineInput.toLowerCase();
    let endDate = new Date(today);

    if (input.includes('week')) {
      const weeks = input.includes('1-2') || input.includes('two') ? 2 : 1;
      endDate.setDate(endDate.getDate() + (weeks * 7));
    } else if (input.includes('month')) {
      const months = input.includes('3') || input.includes('three') ? 3 : 1;
      endDate.setMonth(endDate.getMonth() + months);
    } else if (input.includes('6') || input.includes('six')) {
      endDate.setMonth(endDate.getMonth() + 6);
    } else {
      // Default to 1 month
      endDate.setMonth(endDate.getMonth() + 1);
    }

    return {
      start,
      end: endDate.toISOString().split('T')[0]
    };
  }

  private getMockConversationalResponse(context: any): string {
    const responses = {
      1: `That sounds like an exciting project! 🚀 What's your main goal with this - are you looking to learn something new, solve a specific problem, or create something others will use?`,
      2: `Great! I can see the vision taking shape. When would you like to have this completed? Are you working with any specific deadlines or is this more flexible?`,
      3: `Perfect timing context! Will you be working on this solo, or do you have team members who'll be involved? This helps me structure the tasks appropriately.`,
      4: `Excellent! What would make this project a success in your eyes? What are the key outcomes you want to achieve?`,
      5: `Wonderful goals! Are there any constraints, technical preferences, or additional context that would help me create the best possible project plan for you?`,
      6: `Thank you for all that great information! I have everything I need to create a comprehensive project plan. Let me generate your personalized project with tasks, timeline, and structure. This will just take a moment...`
    };

    return responses[context.step as keyof typeof responses] || 'Let me help you with the next step of your project planning.';
  }

  private getMockProjectWithTasks(projectData: any): any {
    const mockTasks = [
      {
        name: 'Project Initialization',
        description: `Set up the foundation for ${projectData.name}`,
        priority: 'high' as const,
        status: 'todo' as const,
        estimated_effort: '4-6 hours'
      },
      {
        name: 'Requirements Analysis',
        description: 'Define detailed requirements and specifications',
        priority: 'high' as const,
        status: 'todo' as const,
        estimated_effort: '1-2 days'
      },
      {
        name: 'Design and Planning',
        description: 'Create system architecture and design',
        priority: 'medium' as const,
        status: 'todo' as const,
        estimated_effort: '3-5 days'
      },
      {
        name: 'Core Development',
        description: 'Implement main features and functionality',
        priority: 'medium' as const,
        status: 'todo' as const,
        estimated_effort: '1-2 weeks'
      },
      {
        name: 'Testing and QA',
        description: 'Comprehensive testing and quality assurance',
        priority: 'medium' as const,
        status: 'todo' as const,
        estimated_effort: '3-5 days'
      },
      {
        name: 'Documentation',
        description: 'Create user guides and technical documentation',
        priority: 'low' as const,
        status: 'todo' as const,
        estimated_effort: '2-3 days'
      }
    ];

    return {
      name: projectData.name,
      description: projectData.description,
      tasks: mockTasks,
      tags: this.generateProjectTags(projectData),
      timeline: this.calculateTimeline(projectData.timeline)
    };
  }
}

// Singleton instance
export const modernClaudeService = new ModernClaudeService();