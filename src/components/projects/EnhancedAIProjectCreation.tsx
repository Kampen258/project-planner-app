import React, { useState, useEffect, useRef } from 'react';
import { ModernClaudeService } from '../../services/modern-claude-service';
import { EnhancedSpeechToTextService } from '../../services/speech-to-text-service';
import { debugLogger } from '../../utils/debug-logger';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase.client';

interface EnhancedAIProjectCreationProps {
  onComplete: (projectData: any) => void;
  onCancel: () => void;
}

interface Message {
  id: number;
  type: 'ai' | 'user' | 'system';
  content: string;
  suggestions?: string[];
  timestamp: Date;
  isStreaming?: boolean;
}

interface ProjectContext {
  name: string;
  description: string;
  type: string;
  timeline: string;
  team: string;
  goals: string[];
  additionalContext?: string;
}

const COMPONENT_NAME = 'EnhancedAIProjectCreation';

const EnhancedAIProjectCreation: React.FC<EnhancedAIProjectCreationProps> = ({
  onComplete,
  onCancel
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [projectContext, setProjectContext] = useState<Partial<ProjectContext>>({});
  const [sessionId] = useState(`project-creation-${Date.now()}`);

  // Services
  const [claudeService] = useState(() => new ModernClaudeService());
  const [speechService] = useState(() => new EnhancedSpeechToTextService());

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingMessageRef = useRef<HTMLDivElement>(null);

  // Component lifecycle logging
  useEffect(() => {
    debugLogger.componentMount(COMPONENT_NAME, { sessionId, userId: user?.id });
    initializeConversation();

    return () => {
      debugLogger.componentUnmount(COMPONENT_NAME);
    };
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeConversation = () => {
    const welcomeMessage: Message = {
      id: 1,
      type: 'ai',
      content: "👋 Welcome to AI-Powered Project Creation! I'm your intelligent project assistant, enhanced with Claude 3.5 Sonnet. I'll help you create a detailed project plan through natural conversation. You can type or use voice input (click the microphone). What kind of project would you like to create?",
      suggestions: [
        '🌐 Web Application',
        '📱 Mobile App',
        '🤖 AI/ML Project',
        '📚 Learning Project',
        '💼 Business Initiative',
        '🎨 Creative Project'
      ],
      timestamp: new Date()
    };

    setMessages([welcomeMessage]);
    debugLogger.info('Conversation', 'AI conversation initialized', { sessionId }, COMPONENT_NAME);
  };

  const handleSendMessage = async (content: string, isVoiceInput = false) => {
    if (!content.trim() || isLoading) return;

    debugLogger.userAction('Message Sent', COMPONENT_NAME, {
      step: currentStep,
      isVoiceInput,
      contentLength: content.length
    });

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsLoading(true);

    try {
      // Update project context based on current step
      const updatedContext = updateProjectContext(currentStep, content);
      setProjectContext(updatedContext);

      // Create streaming AI message
      const streamingMessage: Message = {
        id: messages.length + 2,
        type: 'ai',
        content: '',
        timestamp: new Date(),
        isStreaming: true
      };

      setMessages(prev => [...prev, streamingMessage]);

      // Generate AI response with streaming
      let fullResponse = '';

      if (currentStep <= 6) {
        // Continue conversation for project context gathering
        fullResponse = await claudeService.generateConversationalResponse(
          {
            step: currentStep,
            userInput: content,
            projectContext: updatedContext,
            sessionId
          },
          (chunk) => {
            fullResponse += chunk;
            // Update streaming message
            setMessages(prev => prev.map(msg =>
              msg.id === streamingMessage.id
                ? { ...msg, content: fullResponse }
                : msg
            ));
          }
        );

        // Add suggestions based on step
        const suggestions = getSuggestionsForStep(currentStep + 1, updatedContext);

        // Finalize streaming message
        setMessages(prev => prev.map(msg =>
          msg.id === streamingMessage.id
            ? { ...msg, content: fullResponse, suggestions, isStreaming: false }
            : msg
        ));

        setCurrentStep(prev => prev + 1);
      } else {
        // Generate final project with tasks
        fullResponse = await generateCompleteProject(updatedContext, streamingMessage.id);
      }

      debugLogger.info('AI Response', 'Generated response', {
        step: currentStep,
        responseLength: fullResponse.length,
        sessionId
      }, COMPONENT_NAME);

    } catch (error) {
      debugLogger.error('AI Response', 'Failed to generate response', { error }, COMPONENT_NAME);

      const errorMessage: Message = {
        id: messages.length + 2,
        type: 'ai',
        content: "I encountered an issue generating a response. Let's try a different approach, or you can continue with manual project creation.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProjectContext = (step: number, userInput: string): Partial<ProjectContext> => {
    const updated = { ...projectContext };

    switch (step) {
      case 1:
        updated.type = userInput;
        updated.name = extractProjectName(userInput);
        break;
      case 2:
        updated.description = userInput;
        break;
      case 3:
        updated.timeline = userInput;
        break;
      case 4:
        updated.team = userInput;
        break;
      case 5:
        updated.goals = extractGoals(userInput);
        break;
      case 6:
        updated.additionalContext = userInput;
        break;
    }

    return updated;
  };

  const getSuggestionsForStep = (step: number, context: Partial<ProjectContext>): string[] => {
    const suggestions = {
      2: ['Build a solution for users', 'Learn new technologies', 'Solve a specific problem', 'Create something innovative'],
      3: ['1-2 weeks', '1 month', '3 months', '6+ months', 'Ongoing project'],
      4: ['Solo project', 'Small team (2-3)', 'Medium team (4-8)', 'Large team (9+)'],
      5: ['Launch MVP', 'Learn skills', 'Generate revenue', 'Solve user problems', 'Build portfolio'],
      6: ['Add technical details', 'Specify constraints', 'Mention preferences', 'Include inspiration']
    };

    return suggestions[step as keyof typeof suggestions] || [];
  };

  const generateCompleteProject = async (context: Partial<ProjectContext>, streamingMessageId: number): Promise<string> => {
    debugLogger.info('Project Generation', 'Starting complete project generation', context, COMPONENT_NAME);

    // Generate project with tasks using Claude 3.5 Sonnet
    let fullResponse = '';

    const projectData = await claudeService.generateProjectWithTasks(
      {
        name: context.name || 'AI Generated Project',
        description: context.description || 'Generated with AI assistance',
        type: context.type || 'General',
        timeline: context.timeline || 'Flexible',
        team: context.team || 'Solo',
        goals: context.goals || [],
        additionalContext: context.additionalContext
      },
      (chunk) => {
        fullResponse += chunk;
        // Update streaming message
        setMessages(prev => prev.map(msg =>
          msg.id === streamingMessageId
            ? { ...msg, content: fullResponse }
            : msg
        ));
      },
      sessionId
    );

    // Finalize the streaming message
    const finalMessage = `🎉 **Project Created Successfully!**

**${projectData.name}**

${projectData.description}

**Generated Tasks:**
${projectData.tasks?.map((task, index) => `${index + 1}. ${task.name}`).join('\n') || 'Tasks will be generated...'}

**Timeline:** ${context.timeline}
**Team:** ${context.team}

I'll now save this project to your workspace. You can review and modify all details after creation.`;

    setMessages(prev => prev.map(msg =>
      msg.id === streamingMessageId
        ? { ...msg, content: finalMessage, isStreaming: false }
        : msg
    ));

    // Auto-complete after delay
    setTimeout(() => {
      onComplete({
        ...projectData,
        ai_generated: true,
        context: {
          sessionId,
          generatedBy: 'claude-3.5-sonnet',
          userInputs: context
        }
      });
    }, 3000);

    return finalMessage;
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      debugLogger.userAction('Voice Input Stopped', COMPONENT_NAME);
      return;
    }

    try {
      debugLogger.userAction('Voice Input Started', COMPONENT_NAME);
      setIsListening(true);

      const result = await speechService.startListening({
        continuous: false,
        language: 'en-US',
        timeout: 10000
      });

      if (result && result.trim()) {
        setCurrentInput(result);
        await handleSendMessage(result, true);
      }
    } catch (error) {
      debugLogger.error('Voice Input', 'Failed to process speech', { error }, COMPONENT_NAME);
    } finally {
      setIsListening(false);
    }
  };

  const extractProjectName = (input: string): string => {
    const words = input.toLowerCase().split(' ').filter(word =>
      !['i', 'want', 'to', 'a', 'the', 'an', 'create', 'build', 'make', 'develop'].includes(word)
    );
    return words.slice(0, 3).map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') || 'AI Generated Project';
  };

  const extractGoals = (input: string): string[] => {
    // Simple goal extraction - could be enhanced with NLP
    return input.split(/[,.;]/).map(goal => goal.trim()).filter(Boolean);
  };

  const handleSuggestionClick = (suggestion: string) => {
    debugLogger.userAction('Suggestion Clicked', COMPONENT_NAME, { suggestion, step: currentStep });
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(currentInput);
    }
  };

  const getStepTitle = (step: number): string => {
    const titles = {
      1: 'Project Type',
      2: 'Description & Goals',
      3: 'Timeline',
      4: 'Team Structure',
      5: 'Success Criteria',
      6: 'Additional Context',
      7: 'Generating Project...'
    };
    return titles[step as keyof typeof titles] || 'Project Creation';
  };

  const progressPercentage = Math.min(((currentStep - 1) / 6) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl">
          {/* Enhanced Header */}
          <div className="px-8 py-6 border-b border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
                  <span className="text-4xl">🤖</span>
                  <span>AI Project Creator</span>
                </h1>
                <p className="text-white/80 mt-2 text-lg">Powered by Claude 3.5 Sonnet</p>
              </div>
              <div className="text-right">
                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md px-6 py-3 rounded-xl border border-blue-400/30">
                  <div className="text-blue-200 text-sm font-medium mb-1">{getStepTitle(currentStep)}</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-white/20 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <span className="text-blue-200 text-xs">{Math.round(progressPercentage)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="p-8 h-96 overflow-y-auto space-y-6" style={{ scrollBehavior: 'smooth' }}>
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-2xl rounded-2xl px-6 py-4 ${
                  message.type === 'user'
                    ? 'bg-white/20 text-white border border-white/30'
                    : message.type === 'ai'
                    ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border border-blue-400/30'
                    : 'bg-green-500/20 text-green-100 border border-green-400/30'
                }`}>
                  {/* Message content with markdown-like formatting */}
                  <div className="prose prose-invert max-w-none">
                    {message.content.split('\n').map((line, index) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <h3 key={index} className="text-lg font-bold mb-2">{line.slice(2, -2)}</h3>;
                      }
                      if (line.startsWith('*') && line.endsWith('*')) {
                        return <h4 key={index} className="font-semibold mb-1">{line.slice(1, -1)}</h4>;
                      }
                      return <p key={index} className="mb-1 leading-relaxed">{line}</p>;
                    })}
                  </div>

                  {/* Streaming indicator */}
                  {message.isStreaming && (
                    <div className="flex items-center space-x-2 mt-2 text-blue-300">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm">Generating...</span>
                    </div>
                  )}

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && !message.isStreaming && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          disabled={isLoading}
                          className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm border border-white/20 transition-all duration-200 disabled:opacity-50 flex items-center space-x-1"
                        >
                          <span>{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border border-blue-400/30 rounded-2xl px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-blue-300 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-3 h-3 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-blue-200">Claude is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Input Area */}
          <div className="px-8 py-6 border-t border-white/20">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading || currentStep > 6}
                  placeholder={
                    isListening
                      ? "🎤 Listening..."
                      : currentStep > 6
                      ? "Project generation complete!"
                      : "Type your response or use voice input..."
                  }
                  className="w-full pl-4 pr-12 py-4 bg-white/20 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/60 backdrop-blur-md disabled:opacity-50 text-lg"
                />

                {/* Voice input button */}
                <button
                  onClick={handleVoiceInput}
                  disabled={isLoading || currentStep > 6}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${
                    isListening
                      ? 'bg-red-500/30 text-red-200 animate-pulse'
                      : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
                  } disabled:opacity-50`}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              </div>

              <button
                onClick={() => handleSendMessage(currentInput)}
                disabled={!currentInput.trim() || isLoading || currentStep > 6}
                className="px-8 py-4 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 hover:from-blue-500/40 hover:to-cyan-500/40 disabled:bg-white/10 text-white rounded-xl font-medium transition-all duration-300 border border-blue-400/30 backdrop-blur-md disabled:opacity-50 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Send</span>
              </button>
            </div>

            <div className="flex justify-between items-center mt-6">
              <button
                onClick={onCancel}
                className="px-6 py-2 text-white/70 hover:text-white transition-colors text-sm flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to manual creation</span>
              </button>

              <div className="flex items-center space-x-4 text-xs text-white/50">
                {isListening && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <span>Voice input active</span>
                  </div>
                )}
                <span>Press Enter to send • Powered by Claude 3.5 Sonnet</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAIProjectCreation;