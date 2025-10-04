# Server Management Scripts

This project includes convenient scripts to manage the development servers for the Project Planner application.

## Quick Commands

### Restart Servers
```bash
# Using npm script (recommended)
npm run restart

# Or directly
./restart-servers.sh
```

### Stop Servers
```bash
# Using npm script (recommended)
npm run stop

# Or directly
./stop-servers.sh
```

### Start Servers (Standard)
```bash
npm run dev:full
```

## What These Scripts Do

### `restart-servers.sh`
- 🔄 **Safe Restart**: Kills existing processes on ports 5173 and 3001
- 🧹 **Cleanup**: Removes any lingering npm/node processes
- ✅ **Verification**: Checks that ports are free before starting
- 🚀 **Startup**: Launches both Vite dev server and MCP bridge server
- 📊 **Health Check**: Verifies servers are responding after startup
- 📝 **Logging**: Creates `server.log` for monitoring

### `stop-servers.sh`
- 🛑 **Clean Stop**: Safely terminates all development servers
- 🧹 **Complete Cleanup**: Ensures no processes remain running
- ✅ **Verification**: Confirms all servers have stopped

## Server Architecture

The Project Planner runs two servers simultaneously:

1. **Vite Dev Server** (Port 5173)
   - React application with hot module replacement
   - Main user interface
   - Accessible at: http://localhost:5173

2. **MCP Bridge Server** (Port 3001)
   - Claude MCP (Model Context Protocol) integration
   - AI-powered features and voice commands
   - Accessible at: http://localhost:3001

## Troubleshooting

### Port Conflicts
If you get "port in use" errors:
```bash
# Check what's using the ports
lsof -i :5173
lsof -i :3001

# Kill specific processes
lsof -ti:5173 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Then restart
npm run restart
```

### Server Won't Start
1. Check `server.log` for detailed error messages:
   ```bash
   tail -f server.log
   ```

2. Verify node dependencies:
   ```bash
   npm install
   ```

3. Clear npm cache if needed:
   ```bash
   npm cache clean --force
   ```

### Monitor Server Status
```bash
# Real-time log monitoring
tail -f server.log

# Check if servers are responding
curl http://localhost:5173
curl http://localhost:3001
```

## Development Workflow

**Typical usage:**
1. Start development: `npm run restart`
2. Monitor logs: `tail -f server.log`
3. Develop your features...
4. When done: `npm run stop`

**After code changes:**
- Most changes auto-reload via HMR
- For server-side changes: `npm run restart`

## Features Available After Startup

Once servers are running, you'll have access to:
- 🌐 **Full React Application** with routing
- 🎤 **Voice Assistant** and commands
- 🤖 **AI Integration** via Claude MCP
- 📊 **Project Management** features
- 🔄 **Hot Module Replacement** for development
- 📝 **Real-time logging** and debugging

---

**Need help?** Check the main README.md or the server logs for more details.