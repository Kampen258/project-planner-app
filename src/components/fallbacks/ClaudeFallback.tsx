/**
 * Claude Integration Fallback Component
 * Provides safe fallback when Claude AI service is unavailable
 */

import React, { useState } from 'react';

interface ClaudeFallbackProps {
  reason?: string;
  onRetry?: () => void;
}

export default function ClaudeFallback({ reason, onRetry }: ClaudeFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div style={{
      background: 'rgba(255, 193, 7, 0.1)',
      border: '2px solid rgba(255, 193, 7, 0.3)',
      borderRadius: '10px',
      padding: '20px',
      margin: '20px 0',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '15px' }}>🤖</div>
      <h3 style={{ margin: '0 0 10px 0', color: '#FFA726' }}>
        Claude AI Integration Unavailable
      </h3>

      <p style={{ margin: '10px 0', opacity: '0.8' }}>
        The Claude AI assistant is currently not available. Using fallback mode.
      </p>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '10px 20px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔄 Retry Connection
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
          <h4>🔍 Fallback Information:</h4>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>Reason: {reason || 'Service initialization failed'}</li>
            <li>Impact: AI-powered features are disabled</li>
            <li>Workaround: Manual operations are still available</li>
            <li>Status: Monitoring for recovery</li>
          </ul>

          <h4>📋 Available Actions:</h4>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>Use manual text input instead of AI suggestions</li>
            <li>Check AI Features page for service status</li>
            <li>Enable test mode to try loading again</li>
            <li>Contact support if issue persists</li>
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
        ✅ <strong>Good news:</strong> All core ProjectFlow features remain fully functional!
      </div>
    </div>
  );
}

// Alternative lightweight component for inline usage
export function ClaudeFallbackInline({ message = 'Claude AI unavailable' }: { message?: string }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      background: 'rgba(255, 193, 7, 0.2)',
      borderRadius: '6px',
      fontSize: '14px',
      color: '#FFA726'
    }}>
      <span>⚠️</span>
      <span>{message}</span>
    </div>
  );
}