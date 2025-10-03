#!/usr/bin/env node

/**
 * Simple test script to verify MCP server functionality
 */

import { spawn } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';

console.log('🧪 Testing Claude Projects MCP Server...\n');

// Test the MCP server
async function testMCPServer() {
  try {
    console.log('1. Starting MCP server...');

    const server = spawn('node', ['mcp-servers/claude-projects-server.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Send MCP initialization message
    const initMessage = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
          name: "test-client",
          version: "0.1.0"
        }
      }
    };

    console.log('2. Sending initialization message...');
    server.stdin.write(JSON.stringify(initMessage) + '\n');

    let response = '';
    server.stdout.on('data', (data) => {
      response += data.toString();
      console.log('📦 Server response:', data.toString().trim());
    });

    server.stderr.on('data', (data) => {
      console.log('⚠️  Server stderr:', data.toString().trim());
    });

    // Test tools list
    setTimeout(() => {
      const toolsMessage = {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list"
      };

      console.log('\n3. Requesting tools list...');
      server.stdin.write(JSON.stringify(toolsMessage) + '\n');
    }, 1000);

    // Test get projects
    setTimeout(() => {
      const projectsMessage = {
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: {
          name: "get_claude_projects",
          arguments: { limit: 3 }
        }
      };

      console.log('\n4. Getting Claude projects...');
      server.stdin.write(JSON.stringify(projectsMessage) + '\n');
    }, 2000);

    // Clean up after 5 seconds
    setTimeout(() => {
      console.log('\n✅ MCP server test completed!');
      server.kill();
      process.exit(0);
    }, 5000);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testMCPServer();