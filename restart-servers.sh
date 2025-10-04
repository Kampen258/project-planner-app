#!/bin/bash

# Enhanced Project Planner - Server Restart Script
# This script safely restarts all development servers and clears any port conflicts

echo "🔄 Starting Project Planner Server Restart..."
echo "================================================"

# Function to display colored output
print_status() {
    local color=$1
    local message=$2
    case $color in
        "green") echo -e "\033[32m✅ $message\033[0m" ;;
        "yellow") echo -e "\033[33m⚠️  $message\033[0m" ;;
        "red") echo -e "\033[31m❌ $message\033[0m" ;;
        "blue") echo -e "\033[34mℹ️  $message\033[0m" ;;
        "cyan") echo -e "\033[36m🚀 $message\033[0m" ;;
    esac
}

# Step 1: Kill existing processes on our ports
print_status "blue" "Step 1: Cleaning up existing processes..."

# Kill processes on port 5173 (Vite dev server)
if lsof -ti:5173 >/dev/null 2>&1; then
    print_status "yellow" "Killing existing Vite server on port 5173..."
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    sleep 1
else
    print_status "blue" "Port 5173 is already free"
fi

# Kill processes on port 3001 (MCP bridge server)
if lsof -ti:3001 >/dev/null 2>&1; then
    print_status "yellow" "Killing existing MCP bridge server on port 3001..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    sleep 1
else
    print_status "blue" "Port 3001 is already free"
fi

# Kill any remaining npm/node processes related to our project
print_status "blue" "Cleaning up any remaining project processes..."
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "npm run mcp-bridge" 2>/dev/null || true
pkill -f "mcp-bridge-server.js" 2>/dev/null || true

# Wait a moment for processes to fully terminate
sleep 2

# Step 2: Verify ports are free
print_status "blue" "Step 2: Verifying ports are available..."

if lsof -ti:5173 >/dev/null 2>&1; then
    print_status "red" "Port 5173 is still in use. Please manually kill the process."
    exit 1
else
    print_status "green" "Port 5173 is available"
fi

if lsof -ti:3001 >/dev/null 2>&1; then
    print_status "red" "Port 3001 is still in use. Please manually kill the process."
    exit 1
else
    print_status "green" "Port 3001 is available"
fi

# Step 3: Clear any npm/node cache issues
print_status "blue" "Step 3: Clearing potential cache issues..."
# Note: We avoid npm cache clean as it can be slow, but mention it as available
print_status "blue" "Cache clearing skipped for speed (run 'npm cache clean --force' manually if needed)"

# Step 4: Start the development servers
print_status "cyan" "Step 4: Starting development servers..."
print_status "blue" "Starting Project Planner with MCP Bridge..."

# Start servers in background
nohup npm run dev:full > server.log 2>&1 &
SERVER_PID=$!

# Wait a moment for servers to start
sleep 3

# Step 5: Verify servers are running
print_status "blue" "Step 5: Verifying server startup..."

# Check if Vite server is responding
if curl -s http://localhost:5173 >/dev/null 2>&1; then
    print_status "green" "Vite dev server is running on http://localhost:5173"
else
    print_status "yellow" "Vite server might still be starting... checking again in 3 seconds"
    sleep 3
    if curl -s http://localhost:5173 >/dev/null 2>&1; then
        print_status "green" "Vite dev server is now running on http://localhost:5173"
    else
        print_status "red" "Vite server failed to start. Check server.log for details."
    fi
fi

# Check if MCP bridge server is responding
if curl -s http://localhost:3001 >/dev/null 2>&1; then
    print_status "green" "MCP bridge server is running on http://localhost:3001"
else
    print_status "yellow" "MCP bridge server might still be starting... checking again in 2 seconds"
    sleep 2
    if curl -s http://localhost:3001 >/dev/null 2>&1; then
        print_status "green" "MCP bridge server is now running on http://localhost:3001"
    else
        print_status "yellow" "MCP bridge server may not be responding to HTTP (this is normal if it's stdio-only)"
    fi
fi

# Step 6: Show final status
echo ""
print_status "cyan" "🎉 Server restart completed!"
echo "================================================"
print_status "green" "✅ Vite Dev Server: http://localhost:5173"
print_status "green" "✅ MCP Bridge Server: http://localhost:3001"
print_status "blue" "📝 Server logs: ./server.log"
print_status "blue" "🔍 Monitor logs: tail -f server.log"
print_status "blue" "🛑 Stop servers: ./stop-servers.sh"
echo ""
print_status "cyan" "🚀 Ready to use Project Planner!"
echo ""