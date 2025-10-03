interface ProjectData {
  name: string;
  description: string;
  tags: string[];
  startDate?: string;
  endDate?: string;
  status: string;
}

interface ConversationStep {
  id: number;
  question: string;
  response?: string;
  suggestions?: string[];
}

class AIProjectService {
  private apiKey: string = '';

  constructor() {
    this.apiKey = process.env.VITE_ANTHROPIC_API_KEY || '';
  }

  async askQuestion(step: number, userInput: string, previousAnswers: Record<number, string>): Promise<{response: string, suggestions?: string[]}> {
    try {
      if (!this.apiKey) {
        return this.getMockResponse(step, userInput);
      }

      const prompt = this.buildPrompt(step, userInput, previousAnswers);

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      const data = await response.json();
      return {
        response: data.content[0].text,
        suggestions: this.getSuggestionsForStep(step)
      };
    } catch (error) {
      console.error('AI service error:', error);
      return this.getMockResponse(step, userInput);
    }
  }

  private buildPrompt(step: number, userInput: string, previousAnswers: Record<number, string>): string {
    const context = Object.entries(previousAnswers)
      .map(([stepId, answer]) => `Step ${stepId}: ${answer}`)
      .join('\n');

    const prompts = {
      1: `You're helping create a project. The user wants to work on: "${userInput}".
         Ask a follow-up question to understand their main goal or objective. Keep it conversational and brief (2-3 sentences max).`,

      2: `Project context: ${context}
         Current input: "${userInput}"
         Ask about timeline or urgency. Keep response brief and friendly.`,

      3: `Project context: ${context}
         Current input: "${userInput}"
         Ask about team size or resources needed. Keep response brief and encouraging.`
    };

    return prompts[step as keyof typeof prompts] || 'Please clarify your project needs.';
  }

  private getMockResponse(step: number, userInput: string): {response: string, suggestions?: string[]} {
    const mockResponses = {
      1: {
        response: `Great! "${userInput}" sounds like an interesting project. What's your main goal with this? Are you looking to learn something new, solve a specific problem, or build something for others to use?`,
        suggestions: ['Learn new skills', 'Solve a problem', 'Build for others', 'Personal project']
      },
      2: {
        response: `Perfect! That gives me a clear picture of what you want to achieve. When would you like to have this completed? Are you working with any specific deadlines or is this more flexible?`,
        suggestions: ['1-2 weeks', '1 month', '3 months', 'No rush']
      },
      3: {
        response: `Excellent! Now I have a good understanding of your project. One last question: will you be working on this solo, or do you have team members who'll be involved?`,
        suggestions: ['Solo project', 'Small team (2-3)', 'Larger team', 'Need to find collaborators']
      }
    };

    return mockResponses[step as keyof typeof mockResponses] || {
      response: 'Thank you for the information! Let me help you create this project.',
      suggestions: []
    };
  }

  private getSuggestionsForStep(step: number): string[] {
    const suggestions = {
      1: ['Learn new skills', 'Solve a problem', 'Build for others', 'Personal project'],
      2: ['1-2 weeks', '1 month', '3 months', 'No rush'],
      3: ['Solo project', 'Small team', 'Need collaborators']
    };
    return suggestions[step as keyof typeof suggestions] || [];
  }

  generateProjectData(answers: Record<number, string>): ProjectData {
    const projectName = this.extractProjectName(answers[1] || 'New Project');
    const description = this.generateDescription(answers);
    const tags = this.generateTags(answers);
    const timeline = this.extractTimeline(answers[2] || '');

    return {
      name: projectName,
      description,
      tags,
      startDate: timeline.start,
      endDate: timeline.end,
      status: 'planning'
    };
  }

  private extractProjectName(input: string): string {
    const words = input.toLowerCase().split(' ').filter(word =>
      !['i', 'want', 'to', 'a', 'the', 'an', 'create', 'build', 'make'].includes(word)
    );
    return words.slice(0, 3).map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') || 'AI Generated Project';
  }

  private generateDescription(answers: Record<number, string>): string {
    const parts = [
      answers[1] ? `Project focus: ${answers[1]}` : '',
      answers[2] ? `Timeline: ${answers[2]}` : '',
      answers[3] ? `Team: ${answers[3]}` : ''
    ].filter(Boolean);

    return parts.join('. ') + '.';
  }

  private generateTags(answers: Record<number, string>): string[] {
    const tags = ['AI Generated'];

    if (answers[2]?.toLowerCase().includes('week')) tags.push('Short-term');
    if (answers[2]?.toLowerCase().includes('month')) tags.push('Medium-term');
    if (answers[3]?.toLowerCase().includes('solo')) tags.push('Solo');
    if (answers[3]?.toLowerCase().includes('team')) tags.push('Team');

    return tags;
  }

  private extractTimeline(timelineAnswer: string): {start?: string, end?: string} {
    const today = new Date();
    const start = today.toISOString().split('T')[0];

    let end;
    if (timelineAnswer.toLowerCase().includes('week')) {
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 14);
      end = endDate.toISOString().split('T')[0];
    } else if (timelineAnswer.toLowerCase().includes('month')) {
      const endDate = new Date(today);
      endDate.setMonth(endDate.getMonth() + 1);
      end = endDate.toISOString().split('T')[0];
    }

    return { start, end };
  }
}

export const aiProjectService = new AIProjectService();