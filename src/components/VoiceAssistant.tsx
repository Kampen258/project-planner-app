import { useEffect, useRef } from 'react'
import { VoiceAssistantService } from '../services/voiceAssistantService'
import type { Project } from '../mcpClient'
import type { Task } from '../services/taskService'
import '../types/global.d.ts'

interface VoiceAssistantProps {
  currentProject?: Project | null
  projects: Project[]
  currentTasks: Task[]
  user?: {
    name?: string
    preferences?: any
  }
}


export function VoiceAssistant({
  currentProject,
  projects,
  currentTasks,
  user = {}
}: VoiceAssistantProps) {
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    // Load ElevenLabs ConvAI script if not already loaded
    if (!scriptLoadedRef.current && !document.querySelector('script[src*="convai-widget-embed"]')) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed'
      script.async = true
      script.type = 'text/javascript'

      script.onload = () => {
        scriptLoadedRef.current = true
        // Initialize voice assistant service once script is loaded
        initializeVoiceAssistant()
      }

      document.head.appendChild(script)
    } else if (scriptLoadedRef.current) {
      // Script already loaded, initialize directly
      initializeVoiceAssistant()
    }

    // Cleanup function
    return () => {
      // Optional: Clean up any event listeners or subscriptions
    }
  }, [])

  // Update context whenever props change
  useEffect(() => {
    if (scriptLoadedRef.current) {
      VoiceAssistantService.updateContext({
        currentProject,
        projects,
        currentTasks,
        user
      })
    }
  }, [currentProject, projects, currentTasks, user])

  const initializeVoiceAssistant = async () => {
    try {
      // Initialize the voice assistant service with current context
      await VoiceAssistantService.initialize({
        currentProject,
        projects,
        currentTasks,
        user
      })

      // Set up global handler for voice commands
      if (typeof window !== 'undefined') {
        (window as any).handleVoiceCommand = async (command: string, parameters?: any) => {
          try {
            const result = await VoiceAssistantService.handleVoiceCommand(command, parameters)
            console.log('Voice command result:', result)

            // Optionally, you can add UI feedback here
            if (result.success) {
              // Show success notification or update UI
              console.log('✅ Voice command successful:', result.message)
            } else {
              // Show error notification
              console.error('❌ Voice command failed:', result.message)
            }

            return result
          } catch (error) {
            console.error('Error in voice command handler:', error)
            return {
              success: false,
              message: 'Sorry, I encountered an error processing your request.'
            }
          }
        }

        // Add function to manually process tool responses for testing
        (window as any).processToolResponse = async (toolResponseString: string) => {
          try {
            console.log('Processing tool response:', toolResponseString)
            const result = await VoiceAssistantService.handleVoiceCommand(toolResponseString)
            console.log('Tool response result:', result)
            return result
          } catch (error) {
            console.error('Error processing tool response:', error)
            return {
              success: false,
              message: 'Sorry, I encountered an error processing the tool response.'
            }
          }
        }
      }

      console.log('🎤 Voice Assistant initialized successfully')
    } catch (error) {
      console.error('Failed to initialize voice assistant:', error)
    }
  }

  return (
    <div className="voice-assistant-container">
      {/* ElevenLabs ConvAI Widget */}
      {/* @ts-ignore */}
      <elevenlabs-convai
        agent-id="agent_5301k6kbyj73fpnrvbcvxcv0rpte"
      />
    </div>
  )
}