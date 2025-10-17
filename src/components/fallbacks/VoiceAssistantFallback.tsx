/**
 * Voice Assistant Fallback Component
 * Provides safe fallback when Voice Assistant service is unavailable
 */

import React, { useState } from 'react';

interface VoiceAssistantFallbackProps {
  reason?: string;
  onRetry?: () => void;
}

export default function VoiceAssistantFallback({ reason, onRetry }: VoiceAssistantFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div style={{
      background: 'rgba(156, 39, 176, 0.1)',
      border: '2px solid rgba(156, 39, 176, 0.3)',
      borderRadius: '10px',
      padding: '20px',
      margin: '20px 0',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎤</div>
      <h3 style={{ margin: '0 0 10px 0', color: '#AB47BC' }}>
        Voice Assistant Unavailable
      </h3>

      <p style={{ margin: '10px 0', opacity: '0.8' }}>
        Voice commands and speech recognition are currently not available.
      </p>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '10px 20px',
              background: '#9C27B0',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔄 Test Microphone Access
          </button>
        )}

        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          {showDetails ? '▼ Hide Details' : '▶ Show Details'}
        </button>
      </div>

      {showDetails && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
          textAlign: 'left'
        }}>
          <h4>🔍 Voice Assistant Status:</h4>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>Reason: {reason || 'Speech recognition service unavailable'}</li>
            <li>Microphone: Permissions may be required</li>
            <li>Browser: Check if WebRTC is supported</li>
            <li>Alternative: Use keyboard input instead</li>
          </ul>

          <h4>🎯 Manual Alternatives:</h4>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>Type commands directly in text fields</li>
            <li>Use keyboard shortcuts for quick actions</li>
            <li>Access all features through the UI interface</li>
            <li>Enable voice assistant when ready</li>
          </ul>

          <h4>🔧 Troubleshooting:</h4>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>Check microphone permissions in browser settings</li>
            <li>Ensure microphone is connected and working</li>
            <li>Try refreshing the page</li>
            <li>Check if HTTPS is required for microphone access</li>
          </ul>
        </div>
      )}

      <div style={{
        marginTop: '15px',
        padding: '10px',
        background: 'rgba(76, 175, 80, 0.1)',
        borderRadius: '6px',
        fontSize: '14px'
      }}>
        ⌨️ <strong>Alternative:</strong> All voice features are accessible through keyboard input!
      </div>
    </div>
  );
}

// Compact fallback for voice button states
export function VoiceButtonFallback({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      style={{
        padding: '10px',
        background: 'rgba(156, 39, 176, 0.3)',
        border: '2px dashed rgba(156, 39, 176, 0.5)',
        borderRadius: '6px',
        cursor: onClick ? 'pointer' : 'not-allowed',
        color: '#AB47BC'
      }}
      title="Voice assistant unavailable - click for details"
    >
      🎤❌
    </button>
  );
}