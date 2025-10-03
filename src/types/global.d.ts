// Global type declarations

declare global {
  interface Window {
    ElevenLabs?: {
      updateContext?: (context: any) => void
    }
    handleVoiceCommand?: (command: string, parameters?: any) => Promise<any>
  }

  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'agent-id'?: string
      }, HTMLElement>
    }
  }
}

export {}