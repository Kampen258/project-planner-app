import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { claudeService } from '../services/claudeService';
import { useAuth } from '../contexts/SimpleAuthContext';

interface ChatDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatDropdown: React.FC<ChatDropdownProps> = ({ isOpen, onClose, buttonRef }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm your AI assistant. I can help you with project management, creating tasks, checking project status, and more. What can I help you with today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Calculate position when dropdown opens
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 384; // w-96 = 384px
      const viewportWidth = window.innerWidth;

      // Calculate centered position
      let left = rect.left + rect.width / 2 - dropdownWidth / 2;

      // Ensure dropdown doesn't go off-screen
      const padding = 16; // 16px padding from screen edge
      if (left < padding) {
        left = padding;
      } else if (left + dropdownWidth > viewportWidth - padding) {
        left = viewportWidth - dropdownWidth - padding;
      }

      setPosition({
        top: rect.bottom + 8, // 8px gap below button
        left: left,
      });
    }
  }, [isOpen, buttonRef]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]);

  // Real AI response function using Claude service
  const getAIResponse = async (userInput: string): Promise<string> => {
    if (!user?.id) {
      return "Please log in to use the AI assistant.";
    }

    try {
      const response = await claudeService.sendMessage(userInput, user.id);
      return response.text;
    } catch (error) {
      console.error('AI response error:', error);
      return "Sorry, I'm having trouble responding right now. Please try again.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Get real AI response
      const aiResponseText = await getAIResponse(userMessage.text);

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // For now, we'll just add a placeholder message since we don't have speech-to-text
        const transcriptMessage: ChatMessage = {
          id: Date.now().toString(),
          text: "🎤 Voice message recorded (speech-to-text coming soon)",
          isUser: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, transcriptMessage]);

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (!isOpen) return null;

  const dropdownElement = (
    <div
      ref={dropdownRef}
      className="fixed w-96 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl"
      style={{
        top: position.top,
        left: position.left,
        maxHeight: '500px',
        zIndex: 99999
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 1-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 1 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 1 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 1-3.09 3.09ZM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567L16.5 22.5l-.394-1.933a2.25 2.25 0 0 0-1.423-1.423L12.75 18.5l1.933-.394a2.25 2.25 0 0 0 1.423-1.423L16.5 14.75l.394 1.933a2.25 2.25 0 0 0 1.423 1.423L20.25 18.5l-1.933.394a2.25 2.25 0 0 0-1.423 1.423Z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">AI Assistant</h3>
            <p className="text-white/70 text-xs">Ask me anything</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="h-80 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                message.isUser
                  ? 'bg-blue-500/30 text-blue-100 ml-8'
                  : 'bg-white/20 text-white mr-8'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.text}</p>
              <p className={`text-xs mt-1 ${message.isUser ? 'text-blue-200' : 'text-white/60'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/20 text-white max-w-xs px-3 py-2 rounded-lg mr-8">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/20">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about projects, tasks, or anything..."
            className="flex-1 bg-white/10 border border-white/20 rounded-lg text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 placeholder-white/50"
            disabled={isTyping || isRecording}
          />
          <button
            onClick={toggleRecording}
            disabled={isTyping}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isRecording
                ? 'bg-red-500/40 text-white border-2 border-red-400/60 animate-pulse shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30 hover:text-white border-2 border-white/40 hover:border-white/60 shadow-md'
            }`}
            title={isRecording ? "Stop recording" : "Start voice recording"}
          >
            {isRecording ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5">
                <path d="M12 1a3 3 0 0 1 3 3v8a3 3 0 0 1-6 0V4a3 3 0 0 1 3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <path d="M12 19v4"/>
                <path d="M8 23h8"/>
              </svg>
            )}
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping || isRecording}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              !inputText.trim() || isTyping || isRecording
                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                : 'bg-blue-500/30 text-blue-100 hover:bg-blue-500/40 border border-blue-400/30'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            "Create new project",
            "Add task to project",
            "Check project status",
            "Help me get started"
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setInputText(suggestion);
                inputRef.current?.focus();
              }}
              className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-md transition-colors border border-white/10"
              disabled={isTyping}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return createPortal(dropdownElement, document.body);
};

export default ChatDropdown;