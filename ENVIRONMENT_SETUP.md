# Environment Variables Setup Guide

This guide covers all environment variables required for the ProjectFlow application, including AI features, database connections, and external services.

## Required Environment Variables

### Core Application Settings

```bash
# Database Configuration (Supabase)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Development Database (Optional - for local development)
VITE_LOCAL_DB=false  # Set to true to use local JSON storage instead of Supabase
```

### AI Services Configuration

```bash
# Claude AI Integration (REQUIRED for AI features)
VITE_ANTHROPIC_API_KEY=sk-ant-your-api-key-here

# MCP Bridge Server (Optional - defaults to localhost:3001)
VITE_MCP_BRIDGE_URL=http://localhost:3001
```

### Optional Service Configurations

```bash
# Feature Flags
VITE_ENABLE_AI_FEATURES=true          # Enable/disable AI features globally
VITE_ENABLE_VOICE_ASSISTANT=false     # Enable/disable voice features
VITE_ENABLE_MCP_BRIDGE=true           # Enable/disable MCP bridge integration

# Performance Settings
VITE_AI_TIMEOUT=120000                # API timeout in milliseconds (default: 120000)
VITE_HEALTH_CHECK_INTERVAL=30000      # Health check interval in milliseconds

# Development Settings
VITE_DEBUG_AI=false                   # Enable detailed AI logging
VITE_SKIP_TS_CHECK=false             # Skip TypeScript checks in development
```

## Environment File Setup

### 1. Create `.env` File

Create a `.env` file in your project root:

```bash
# Copy the example file
cp .env.example .env

# Edit with your actual values
nano .env  # or use your preferred editor
```

### 2. Basic `.env` Template

```bash
# ===================
# CORE CONFIGURATION
# ===================

# Supabase Database
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Claude AI (Required for AI features)
VITE_ANTHROPIC_API_KEY=sk-ant-your-api-key-here

# ===================
# OPTIONAL SETTINGS
# ===================

# MCP Bridge
VITE_MCP_BRIDGE_URL=http://localhost:3001

# Feature Flags
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_VOICE_ASSISTANT=false
VITE_ENABLE_MCP_BRIDGE=true

# Performance
VITE_AI_TIMEOUT=120000
VITE_HEALTH_CHECK_INTERVAL=30000

# Development
VITE_DEBUG_AI=false
VITE_SKIP_TS_CHECK=false
```

## Getting API Keys and Credentials

### Anthropic Claude API Key

1. **Visit Console**: Go to [console.anthropic.com](https://console.anthropic.com)
2. **Sign Up/In**: Create account or sign in
3. **Create API Key**:
   - Navigate to "API Keys" section
   - Click "Create Key"
   - Copy the key (starts with `sk-ant-`)
   - Add to `.env` as `VITE_ANTHROPIC_API_KEY`

**Important**:
- Never commit API keys to version control
- Keep keys secure and don't share them
- Regenerate if compromised

### Supabase Configuration

1. **Create Project**: Go to [supabase.com](https://supabase.com)
2. **Get Credentials**:
   - Project URL: Found in project settings
   - Anon Key: Found in API settings under "Project API keys"
3. **Add to Environment**:
   ```bash
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## Service-Specific Setup

### AI Features Setup

**Minimum Required:**
```bash
VITE_ANTHROPIC_API_KEY=sk-ant-your-key
VITE_ENABLE_AI_FEATURES=true
```

**Full AI Setup:**
```bash
# Core AI
VITE_ANTHROPIC_API_KEY=sk-ant-your-key
VITE_ENABLE_AI_FEATURES=true

# MCP Bridge (for advanced AI tools)
VITE_MCP_BRIDGE_URL=http://localhost:3001
VITE_ENABLE_MCP_BRIDGE=true

# Performance tuning
VITE_AI_TIMEOUT=120000
VITE_DEBUG_AI=false
```

### Voice Assistant Setup (Optional)

```bash
# Basic voice features (uses browser APIs)
VITE_ENABLE_VOICE_ASSISTANT=true

# Advanced voice features would require additional setup
# (Currently using browser SpeechRecognition/SpeechSynthesis)
```

### Development Environment

```bash
# Local development optimizations
VITE_DEBUG_AI=true                    # Enable detailed logging
VITE_SKIP_TS_CHECK=true              # Skip TypeScript checks for faster builds
VITE_LOCAL_DB=true                   # Use local storage instead of Supabase

# Health monitoring (less frequent in development)
VITE_HEALTH_CHECK_INTERVAL=60000     # Check every minute instead of 30 seconds
```

### Production Environment

```bash
# Production optimizations
VITE_DEBUG_AI=false                  # Disable debug logging
VITE_SKIP_TS_CHECK=false             # Enable TypeScript checking
VITE_LOCAL_DB=false                  # Use Supabase in production

# More frequent health checks
VITE_HEALTH_CHECK_INTERVAL=30000     # Check every 30 seconds
VITE_AI_TIMEOUT=60000               # Shorter timeout for better UX
```

## Environment Validation

The application automatically validates environment variables on startup:

### Required Variables Check
- `VITE_ANTHROPIC_API_KEY` must start with `sk-ant-`
- `VITE_SUPABASE_URL` must be a valid URL
- `VITE_SUPABASE_ANON_KEY` must be present

### AI Services Validation
- Claude API key format validation
- MCP bridge URL accessibility check
- Feature flag consistency validation

## Troubleshooting Environment Issues

### Common Problems

**1. "AI Features Not Available"**
```bash
# Check API key format
echo $VITE_ANTHROPIC_API_KEY
# Should start with 'sk-ant-'

# Verify feature flag
echo $VITE_ENABLE_AI_FEATURES
# Should be 'true'
```

**2. "MCP Bridge Connection Failed"**
```bash
# Check if bridge server is running
curl http://localhost:3001/health

# Verify bridge URL setting
echo $VITE_MCP_BRIDGE_URL
# Should match your MCP bridge server
```

**3. "Supabase Connection Error"**
```bash
# Verify Supabase URL format
echo $VITE_SUPABASE_URL
# Should be: https://your-project-id.supabase.co

# Check anon key presence
echo $VITE_SUPABASE_ANON_KEY | wc -c
# Should be a long key (100+ characters)
```

### Debug Mode

Enable comprehensive debugging:

```bash
# Enable all debug features
VITE_DEBUG_AI=true
VITE_ENABLE_AI_FEATURES=true

# Start development server with debugging
npm run dev
```

Then check browser console for detailed AI service logs.

### Validation Commands

Run these commands to verify your setup:

```bash
# Check if all required variables are set
npm run check-env  # (if script exists)

# Or manually check:
node -e "
const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_ANTHROPIC_API_KEY'];
required.forEach(key => {
  console.log(\`\${key}: \${process.env[key] ? '✅ Set' : '❌ Missing'}\`);
});
"
```

## Environment File Security

### Best Practices

1. **Never Commit `.env`**:
   ```bash
   # Add to .gitignore
   echo ".env" >> .gitignore
   echo ".env.local" >> .gitignore
   echo ".env.*.local" >> .gitignore
   ```

2. **Use Environment-Specific Files**:
   ```bash
   .env                # Default values
   .env.local          # Local development (gitignored)
   .env.development    # Development environment
   .env.production     # Production environment
   ```

3. **Validate on Startup**:
   The application checks required variables and shows helpful error messages if any are missing.

4. **Document Changes**:
   When adding new environment variables, update this documentation and the `.env.example` file.

## Deployment Considerations

### Vercel/Netlify
Add environment variables in the platform's dashboard:
- Go to project settings
- Find "Environment Variables" section
- Add each `VITE_*` variable

### Docker
```dockerfile
# In your Dockerfile
ENV VITE_ANTHROPIC_API_KEY=${VITE_ANTHROPIC_API_KEY}
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
```

### Traditional Hosting
Ensure your build process includes environment variables:
```bash
# Build with environment variables
VITE_ANTHROPIC_API_KEY=your-key npm run build
```

## Monitoring Environment Health

The application provides built-in environment monitoring:

1. **AI Features Page** (`/ai-features`):
   - Shows service status
   - Validates environment configuration
   - Provides troubleshooting information

2. **Health Checks**:
   - Automatic validation of API keys
   - Service connectivity testing
   - Configuration consistency checks

3. **Error Messages**:
   - Clear feedback when variables are missing
   - Helpful suggestions for fixing issues
   - Links to relevant documentation

Remember to restart your development server after changing environment variables!