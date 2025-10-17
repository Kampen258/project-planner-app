/**
 * MCP Bridge Fallback Component
 * Provides safe fallback when MCP Bridge service is unavailable
 */

import React, { useState } from 'react';

interface MCPBridgeFallbackProps {
  reason?: string;
  onRetry?: () => void;
  bridgeUrl?: string;
}

export default function MCPBridgeFallback({ reason, onRetry, bridgeUrl = 'http://localhost:3001' }: MCPBridgeFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  return (
    <div style={{
      background: 'rgba(63, 81, 181, 0.1)',
      border: '2px solid rgba(63, 81, 181, 0.3)',
      borderRadius: '10px',
      padding: '20px',
      margin: '20px 0',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '15px' }}>🌉</div>
      <h3 style={{ margin: '0 0 10px 0', color: '#5C6BC0' }}>
        MCP Bridge Unavailable
      </h3>

      <p style={{ margin: '10px 0', opacity: '0.8' }}>
        The Model Context Protocol bridge service is not responding.
      </p>

      <div style={{
        margin: '15px 0',
        padding: '12px',
        background: 'rgba(33, 150, 243, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(33, 150, 243, 0.3)'
      }}>
        <strong>🔗 Bridge Status:</strong> {bridgeUrl} - Connection failed
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '10px 20px',
              background: '#3F51B5',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔄 Test Connection
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

        <button
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          style={{
            padding: '10px 20px',
            background: 'rgba(255, 152, 0, 0.2)',
            color: 'white',
            border: '1px solid rgba(255, 152, 0, 0.3)',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🔍 Diagnostics
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
          <h4>🔍 MCP Bridge Status:</h4>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>Service: Model Context Protocol Bridge</li>
            <li>Expected URL: {bridgeUrl}</li>
            <li>Reason: {reason || 'Service not responding'}</li>
            <li>Impact: Advanced AI features unavailable</li>
          </ul>

          <h4>🛠️ What MCP Bridge Provides:</h4>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>Communication between React app and MCP server</li>
            <li>Safe handling of AI service requests</li>
            <li>Protocol translation and error handling</li>
            <li>Connection management for AI agents</li>
          </ul>

          <h4>🔧 Manual Alternatives:</h4>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>Use direct project and task management</li>
            <li>Access all features through standard UI</li>
            <li>Save work locally until bridge is restored</li>
            <li>Check server status in terminal/logs</li>
          </ul>
        </div>
      )}

      {showDiagnostics && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: 'rgba(255, 152, 0, 0.1)',
          borderRadius: '8px',
          textAlign: 'left',
          fontSize: '14px'
        }}>
          <h4>🩺 Connection Diagnostics:</h4>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li><strong>Bridge Server:</strong> Check if mcp-bridge-server.js is running</li>
            <li><strong>Port:</strong> Verify port 3001 is available and not blocked</li>
            <li><strong>MCP Server:</strong> Confirm MCP server is responding on stdio</li>
            <li><strong>CORS:</strong> Check cross-origin request permissions</li>
          </ul>

          <h4>🚀 Quick Start Commands:</h4>
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '10px',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '12px',
            marginTop: '10px'
          }}>
            <div>npm run mcp-bridge</div>
            <div>curl {bridgeUrl}/health</div>
            <div>npm run dev:full</div>
          </div>

          <h4>📊 Expected Services:</h4>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>✅ Vite Dev Server (port 5173)</li>
            <li>❓ MCP Bridge Server (port 3001)</li>
            <li>❓ MCP Server (stdio communication)</li>
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
        💡 <strong>Good News:</strong> ProjectFlow core functionality works independently of MCP bridge!
      </div>
    </div>
  );
}

// Status indicator component
export function MCPConnectionStatus({ isConnected, onTest }: { isConnected?: boolean; onTest?: () => void }) {
  const getStatusColor = () => {
    if (isConnected === null) return '#FFA726'; // checking
    return isConnected ? '#4CAF50' : '#f44336';
  };

  const getStatusText = () => {
    if (isConnected === null) return 'Checking...';
    return isConnected ? 'Connected' : 'Disconnected';
  };

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 12px',
      background: `rgba(${isConnected ? '76, 175, 80' : '244, 67, 54'}, 0.1)`,
      border: `1px solid rgba(${isConnected ? '76, 175, 80' : '244, 67, 54'}, 0.3)`,
      borderRadius: '6px',
      fontSize: '14px'
    }}>
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: getStatusColor()
        }}
      />
      <span>MCP Bridge: {getStatusText()}</span>
      {onTest && (
        <button
          onClick={onTest}
          style={{
            marginLeft: '8px',
            padding: '2px 6px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Test
        </button>
      )}
    </div>
  );
}