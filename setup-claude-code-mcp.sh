#!/bin/bash

echo "🔧 Setting up MCP integration with Claude Code..."

# Add the Claude Projects MCP server to Claude Code
echo "Adding Claude Projects MCP server..."

# Get the absolute path
PROJECT_PATH="$(pwd)"
MCP_SERVER_PATH="$PROJECT_PATH/mcp-servers/claude-projects-server.js"

echo "Project path: $PROJECT_PATH"
echo "MCP server path: $MCP_SERVER_PATH"

# Add MCP server to Claude Code (project scope)
echo "Configuring MCP server for Claude Code..."

# Create or update .mcp.json
cat > .mcp.json << EOF
{
  "mcpServers": {
    "claude-projects": {
      "type": "stdio",
      "command": "node",
      "args": ["$MCP_SERVER_PATH"],
      "description": "Access Claude Projects data via MCP",
      "enabled": true
    },
    "filesystem": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "$PROJECT_PATH"],
      "description": "Local filesystem access for project management",
      "enabled": true
    }
  }
}
EOF

echo "✅ MCP configuration updated in .mcp.json"
echo ""
echo "🎉 MCP Integration Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Restart Claude Code if it's running"
echo "2. The MCP servers should now be available"
echo "3. Use /mcp command in Claude Code to verify connection"
echo "4. Run 'npm run dev' to start your React app"
echo ""
echo "Your project planner now has:"
echo "- ✅ Glass morphism design"
echo "- ✅ MCP integration"
echo "- ✅ Claude Projects import"
echo "- ✅ Real-time project management"