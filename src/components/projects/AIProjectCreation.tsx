import React, { useState } from 'react';
import { aiProjectService } from '../../services/aiService';

interface AIProjectCreationProps {
  onComplete: (projectData: any) => void;
  onCancel: () => void;
}

interface Message {
  id: number;
  type: 'ai' | 'user';
  content: string;
  suggestions?: string[];
  timestamp: Date;
}

const AIProjectCreation: React.FC<AIProjectCreationProps> = ({ onComplete, onCancel }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: "Hi! I'll help you create your project with just a few questions. What would you like to work on?",
      suggestions: ['Web app', 'Mobile app', 'Learning project', 'Business idea'],
      timestamp: new Date()
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setAnswers(prev => ({ ...prev, [currentStep]: content }));
    setCurrentInput('');
    setIsLoading(true);

    try {
      if (currentStep >= 3) {
        // Generate project after 3 questions
        const finalAnswers = { ...answers, [currentStep]: content };
        const projectData = aiProjectService.generateProjectData(finalAnswers);

        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing

        const completionMessage: Message = {
          id: messages.length + 2,
          type: 'ai',
          content: `Perfect! I've created your project "${projectData.name}". You can review and modify the details before saving.`,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, completionMessage]);
        setTimeout(() => onComplete(projectData), 2000);
      } else {
        // Continue conversation
        const response = await aiProjectService.askQuestion(currentStep + 1, content, answers);

        const aiMessage: Message = {
          id: messages.length + 2,
          type: 'ai',
          content: response.response,
          suggestions: response.suggestions,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
        setCurrentStep(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error in AI conversation:', error);
      const errorMessage: Message = {
        id: messages.length + 2,
        type: 'ai',
        content: "I encountered an error. Let's try a different approach or you can create the project manually.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(currentInput);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
          {/* Header */}
          <div className="px-8 py-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">AI Project Creation</h1>
                <p className="text-white/80 mt-2 text-lg">Let's create your project together</p>
              </div>
              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md px-4 py-2 rounded-xl border border-blue-400/30">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-blue-200 text-sm font-medium">Step {currentStep} of 3</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="p-8 h-96 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-sm rounded-2xl px-6 py-4 ${
                  message.type === 'user'
                    ? 'bg-white/20 text-white border border-white/30'
                    : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border border-blue-400/30'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          disabled={isLoading}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-xs border border-white/20 transition-all duration-200 disabled:opacity-50"
                        >
                          {suggestion}
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
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-blue-200">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="px-8 py-6 border-t border-white/20">
            <div className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  placeholder="Type your response..."
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/60 backdrop-blur-md disabled:opacity-50"
                />
              </div>
              <button
                onClick={() => handleSendMessage(currentInput)}
                disabled={!currentInput.trim() || isLoading}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white rounded-xl font-medium transition-all duration-300 border border-white/30 backdrop-blur-md disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-white/70 hover:text-white transition-colors text-sm"
              >
                ← Back to manual creation
              </button>
              <div className="text-xs text-white/50">
                Press Enter to send • {3 - currentStep + 1} questions remaining
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIProjectCreation;