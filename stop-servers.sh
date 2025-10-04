#!/bin/bash

# Enhanced Project Planner - Server Stop Script
# This script safely stops all development servers

echo "🛑 Stopping Project Planner Servers..."
echo "========================================"

# Function to display colored output
print_status() {
    local color=$1
    local message=$2
    case $color in
        "green") echo -e "\033[32m✅ $message\033[0m" ;;
        "yellow") echo -e "\033[33m⚠️  $message\033[0m" ;;
        "red") echo -e "\033[31m❌ $message\033[0m" ;;
        "blue") echo -e "\033[34mℹ️  $message\033[0m" ;;
    esac
}

# Kill processes on port 5173 (Vite dev server)
if lsof -ti:5173 >/dev/null 2>&1; then
    print_status "yellow" "Stopping Vite server on port 5173..."
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    print_status "green" "Vite server stopped"
else
    print_status "blue" "Vite server was not running"
fi

# Kill processes on port 3001 (MCP bridge server)
if lsof -ti:3001 >/dev/null 2>&1; then
    print_status "yellow" "Stopping MCP bridge server on port 3001..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    print_status "green" "MCP bridge server stopped"
else
    print_status "blue" "MCP bridge server was not running"
fi

# Kill any npm/node processes related to our project
print_status "yellow" "Cleaning up project processes..."
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "npm run mcp-bridge" 2>/dev/null || true
pkill -f "mcp-bridge-server.js" 2>/dev/null || true

# Wait for processes to fully terminate
sleep 1

print_status "green" "All servers stopped successfully!"
echo ""