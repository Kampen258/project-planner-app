# CLAUDE.md - AI Assistant Guide for ProjectFlow

**Last Updated:** 2025-11-18
**Project:** ProjectFlow - Comprehensive Project Management & Planning Application
**Version:** 0.0.0

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Design Patterns](#architecture--design-patterns)
4. [Directory Structure](#directory-structure)
5. [Key Conventions](#key-conventions)
6. [Database Schema](#database-schema)
7. [AI Integration](#ai-integration)
8. [Component Patterns](#component-patterns)
9. [Development Workflows](#development-workflows)
10. [Common Tasks](#common-tasks)
11. [Testing & Debugging](#testing--debugging)
12. [Environment Configuration](#environment-configuration)
13. [Git Workflow](#git-workflow)
14. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**ProjectFlow** is a modern, AI-enhanced project management application featuring:

- **New Agile Methodology**: Custom project management system with phases, experiments, and hypothesis-driven development
- **AI-Powered Features**: Claude 3.5 Sonnet integration for intelligent task generation, project analysis, and voice commands
- **Real-time Collaboration**: Supabase backend with real-time updates
- **Voice Control**: Speech-to-text with natural language processing for hands-free task creation
- **Glass Morphism UI**: Modern, beautiful design system with gradient backgrounds and glass effects
- **Comprehensive Features**: OKRs, braindumps, documents, weekly goals, team management

### Core Capabilities

- AI-driven project planning and task breakdown
- Voice-activated task creation and management
- Hypothesis-driven development with experiment tracking
- Document management and version control
- Team collaboration with role-based permissions
- Real-time KPI dashboards
- MCP (Model Context Protocol) integration

---

## 🛠️ Technology Stack

### Frontend

- **Framework**: React 19.1.1 with TypeScript 5.9.3
- **Build Tool**: Vite 7.1.7 (fast development server with HMR)
- **Styling**: Tailwind CSS 4.1.14 with custom glass morphism design system
- **Routing**: React Router DOM 6.30.1
- **Drag & Drop**: @dnd-kit/core for sortable lists
- **State Management**: React Context API

### Backend & Services

- **Database**: Supabase (PostgreSQL) with real-time subscriptions
- **AI/ML**: Anthropic Claude 3.5 Sonnet via @anthropic-ai/sdk
- **Speech**: Native Web Speech API (browser-based)
- **MCP**: Model Context Protocol (@modelcontextprotocol/sdk)
- **Bridge Server**: Express.js on port 3001 for MCP communication

### Development Tools

- **Linting**: ESLint 9.36.0 with TypeScript and React plugins
- **Type Checking**: TypeScript strict mode
- **Process Management**: Concurrently for running multiple services
- **Database Tools**: Supabase CLI for migrations and local development

---

## 🏗️ Architecture & Design Patterns

### Progressive Loading Architecture

The app implements a **progressive loading system** to prevent import dependency failures while maintaining performance:

```
Level 0: Core React Components (always loaded)
  ↓
Level 1: Claude Integration (basic AI)
  ↓
Level 2: Voice Assistant (advanced AI)
  ↓
Level 3: Chat Agent & MCP Bridge (full AI suite)
```

Key files:
- `/src/services/safeAILoader.ts` - Progressive loading orchestrator
- `/src/services/safeClaudeService.ts` - Protected Claude API integration
- `/src/services/safeMCPService.ts` - MCP protocol with health monitoring
- `/src/services/safeSupabaseService.ts` - Database with fallbacks

### Safety Mechanisms

1. **Import Timeouts**: All dynamic imports have 5-30 second timeouts
2. **Fallback Components**: Graceful degradation when features fail to load
3. **Health Monitoring**: Real-time service status tracking
4. **Error Boundaries**: React error boundaries prevent full app crashes
5. **Retry Logic**: Exponential backoff for network requests

### Service Layer Pattern

All major features follow the service pattern:

```typescript
// Service structure
export class FeatureService {
  private initialized = false;
  private instance?: SomeLibrary;

  async ensureInitialized(): Promise<boolean> {
    // Lazy initialization with timeout protection
  }

  async performAction(params): Promise<Result> {
    // Business logic with error handling
  }
}

export const featureService = new FeatureService();
```

---

## 📁 Directory Structure

```
project-planner-app/
├── .claude/                    # Claude Code configuration
├── .github/                    # GitHub workflows
├── database/                   # Database utilities
├── docs/                       # Additional documentation
├── mcp-servers/               # MCP server configurations
├── public/                    # Static assets
├── scripts/                   # Build and utility scripts
├── src/                       # Main source code
│   ├── assets/               # Images, fonts, etc.
│   ├── components/           # React components
│   │   ├── admin/           # Admin-only components
│   │   ├── braindump/       # Brain dump feature
│   │   ├── common/          # Shared UI components
│   │   ├── fallbacks/       # Error fallback components
│   │   ├── layout/          # Layout components (nav, sidebar)
│   │   ├── newAgile/        # New Agile methodology components
│   │   ├── okr/             # OKR (Objectives & Key Results)
│   │   ├── pages/           # Full page components
│   │   ├── projects/        # Project-specific components
│   │   └── tasks/           # Task management components
│   ├── contexts/            # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── SimpleAuthContext.tsx
│   │   └── VoiceCommandsContext.tsx
│   ├── lib/                 # Core libraries
│   │   ├── supabase.ts
│   │   └── database.types.ts
│   ├── pages/               # Route-level pages
│   ├── services/            # Business logic services
│   │   ├── okr/            # OKR services
│   │   ├── aiService.ts
│   │   ├── claudeService.ts
│   │   ├── documentService.ts
│   │   ├── modern-claude-service.ts
│   │   ├── newAgileService.ts
│   │   ├── projectService.ts
│   │   ├── safeAILoader.ts
│   │   ├── safeClaudeService.ts
│   │   ├── safeMCPService.ts
│   │   ├── speech-to-text-service.ts
│   │   └── taskService.ts
│   ├── types/               # TypeScript type definitions
│   │   ├── global.d.ts
│   │   ├── index.ts
│   │   ├── newAgile.ts
│   │   └── project.ts
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Entry point
├── supabase/
│   ├── config.toml          # Supabase local config
│   ├── migrations/          # Database migrations
│   └── seed.sql             # Seed data
├── test-*.{js,cjs,html}     # Various test files
├── .env                     # Environment variables (DO NOT COMMIT)
├── .env.example             # Environment template
├── package.json             # Dependencies and scripts
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── *.md                     # Documentation files
```

### Key Documentation Files

- `README.md` - Project setup and basic usage
- `AI_ARCHITECTURE.md` - Detailed AI system architecture
- `CLAUDE_INTEGRATION.md` - Claude AI features and usage
- `COMPONENT_LIBRARY.md` - UI component reference
- `IMPLEMENTATION_GUIDE.md` - Implementation patterns
- `ENVIRONMENT_SETUP.md` - Environment configuration
- `SUPABASE_SETUP.md` - Database setup instructions
- `DEBUGGING_STRATEGY.md` - Debugging approaches
- `SERVER-MANAGEMENT.md` - Server lifecycle management

---

## 📐 Key Conventions

### File Naming

- **Components**: PascalCase - `ProjectCard.tsx`, `TaskList.tsx`
- **Services**: camelCase - `claudeService.ts`, `projectService.ts`
- **Types**: camelCase - `project.ts`, `newAgile.ts`
- **Utils**: camelCase - `debug-logger.ts`
- **Pages**: PascalCase with suffix - `HomePage-Planner.tsx`, `Dashboard-KPI.tsx`
- **Variants**: Suffix with variant - `App-working.tsx`, `LoginPage-working.tsx`

### Code Style

#### TypeScript

```typescript
// Use interfaces for objects, types for unions/primitives
interface Project {
  id: string;
  name: string;
  description: string;
}

type Status = 'planning' | 'active' | 'completed' | 'on-hold';

// Always type function parameters and returns
async function createProject(data: ProjectData): Promise<Project> {
  // Implementation
}

// Use optional chaining and nullish coalescing
const value = data?.field ?? 'default';
```

#### React Components

```typescript
// Functional components with explicit typing
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'glass';
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  onClick,
  children
}) => {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
```

#### Error Handling

```typescript
// Always use try-catch for async operations
try {
  const result = await someAsyncOperation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error'
  };
}
```

### CSS/Tailwind Conventions

#### Glass Morphism Classes

```css
/* Pre-defined glass effect classes */
.glass-card          /* Standard glass card */
.glass-nav           /* Glass navigation bar */
.glass-sidebar       /* Glass sidebar */
.glass-modal         /* Glass modal backdrop */

/* Background gradients */
.bg-gradient-primary    /* Purple to blue gradient */
.bg-gradient-secondary  /* Pink to purple gradient */

/* Buttons */
.btn-primary         /* Primary action button */
.btn-secondary       /* Secondary button */
.btn-ghost           /* Transparent button */
.btn-glass           /* Glass effect button */

/* Form inputs */
.form-input          /* Standard input */
.form-input-glass    /* Glass effect input */
```

#### Component Styling Pattern

```tsx
// Use cn() utility for conditional classes
import { cn } from '@/utils/classnames';

<div className={cn(
  'base-classes',
  'always-applied',
  condition && 'conditional-class',
  variant === 'special' && 'special-class',
  className  // Allow override via props
)} />
```

### Import Order

```typescript
// 1. External libraries
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Internal services
import { projectService } from '@/services/projectService';
import { claudeService } from '@/services/claudeService';

// 3. Components
import Button from '@/components/common/Button';
import ProjectCard from '@/components/projects/ProjectCard';

// 4. Types
import type { Project, Task } from '@/types';

// 5. Utils and helpers
import { formatDate } from '@/utils/date';

// 6. Styles (if any)
import './styles.css';
```

---

## 🗄️ Database Schema

### Core Tables

#### `profiles`
```sql
- id: uuid (PK, references auth.users)
- username: text
- full_name: text
- avatar_url: text
- role: text ('admin', 'user')
- created_at: timestamp
- updated_at: timestamp
```

#### `projects`
```sql
- id: uuid (PK)
- name: text
- description: text
- status: text ('planning', 'active', 'completed', 'on-hold')
- user_id: uuid (FK -> profiles)
- start_date: date
- end_date: date
- progress: integer (0-100)
- project_context: jsonb (AI-generated context)
- created_at: timestamp
- updated_at: timestamp
```

#### `tasks`
```sql
- id: uuid (PK)
- project_id: uuid (FK -> projects)
- title: text
- description: text
- status: text ('todo', 'in-progress', 'review', 'done')
- priority: text ('low', 'medium', 'high', 'urgent')
- assigned_to: uuid (FK -> profiles)
- due_date: date
- estimated_effort: text
- actual_effort: text
- phase: text
- feature: text
- order_index: integer
- created_at: timestamp
- updated_at: timestamp
```

#### `new_agile_projects`
```sql
- id: uuid (PK)
- user_id: uuid (FK -> profiles)
- name: text
- vision: text
- current_phase: text
- phases: jsonb[]
- hypothesis_board: jsonb
- experiment_log: jsonb
- discovery_pipeline: jsonb
- created_at: timestamp
- updated_at: timestamp
```

#### `okrs` (Objectives and Key Results)
```sql
- id: uuid (PK)
- project_id: uuid (FK -> projects)
- objective: text
- key_results: jsonb[]
- quarter: text
- status: text
- progress: integer
- created_at: timestamp
```

#### `documents`
```sql
- id: uuid (PK)
- project_id: uuid (FK -> projects)
- title: text
- content: text
- type: text ('requirements', 'design', 'technical', 'meeting_notes')
- version: integer
- author_id: uuid (FK -> profiles)
- created_at: timestamp
- updated_at: timestamp
```

#### `braindump_ideas`
```sql
- id: uuid (PK)
- user_id: uuid (FK -> profiles)
- title: text
- content: text
- tags: text[]
- status: text ('raw', 'refined', 'converted')
- project_id: uuid (FK -> projects, nullable)
- created_at: timestamp
```

#### `weekly_goals`
```sql
- id: uuid (PK)
- user_id: uuid (FK -> profiles)
- week_start: date
- goals: jsonb[]
- reflection: text
- completed: boolean
- created_at: timestamp
```

### Row Level Security (RLS)

All tables implement RLS policies:
- Users can only access their own data
- Admin role can access all data
- Public read access for shared projects (if enabled)

---

## 🤖 AI Integration

### Claude 3.5 Sonnet Integration

#### Service Files

1. **`safeClaudeService.ts`** - Primary production service
   - Safe initialization with timeout protection
   - API key validation
   - Browser-safe configuration
   - Error handling and recovery

2. **`modern-claude-service.ts`** - Advanced features
   - Streaming responses
   - Conversation memory
   - Voice input processing
   - Project analysis

3. **`claudeService.ts`** - Legacy service (being phased out)

#### Common AI Operations

```typescript
// Generate tasks from project description
import { modernClaudeService } from '@/services/modern-claude-service';

const tasks = await modernClaudeService.generateTasksWithStreaming(
  {
    name: 'Project Name',
    description: 'Project description...'
  },
  (chunk) => {
    // Handle streaming updates
    console.log('Received chunk:', chunk);
  },
  sessionId
);

// Process voice commands
const result = await modernClaudeService.processVoiceInput(
  "Create a high priority task to implement user authentication",
  { projectId: '123', userId: 'abc' }
);

// Analyze project risk and provide insights
const analysis = await modernClaudeService.analyzeProject({
  name: 'My Project',
  description: '...',
  timeline: { start: '2025-01-01', end: '2025-12-31' }
});
```

#### Environment Configuration

```bash
# Required in .env
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...

# Optional feature flags
VITE_ENABLE_CLAUDE_STREAMING=true
VITE_ENABLE_DEBUG_MODE=true
```

### MCP (Model Context Protocol)

MCP bridge server runs on port 3001 and provides:
- Extended AI tooling
- Project data access via REST endpoints
- Health monitoring
- Tool execution capabilities

**Key Endpoints:**
- `GET /health` - Bridge status
- `GET /tools` - List available MCP tools
- `POST /tools/call` - Execute MCP tool
- `GET /api/planner-projects` - Get all projects
- `GET /api/tasks/:id` - Get task by ID

**Usage:**
```typescript
import { safeMCPService } from '@/services/safeMCPService';

// Call MCP tool
const result = await safeMCPService.callMCPTool('analyze_project', {
  projectId: '123'
});

// Generate project tasks via MCP
const tasks = await safeMCPService.generateProjectTasks(
  'project-123',
  'Build a web application...'
);
```

### Voice Commands (Speech-to-Text)

#### Supported Commands

**Task Creation:**
- "Create task [task name]"
- "Add high priority task [task name]"
- "New task due tomorrow [task name]"
- "Make urgent task [task name]"

**Project Management:**
- "Create project [project name]"
- "Start new project [project name]"

**Queries:**
- "Show my tasks"
- "List all projects"
- "What's the project status?"

#### Implementation

```typescript
import { speechToTextService } from '@/services/speech-to-text-service';

// Start listening
speechToTextService.startListening({
  onTranscript: (text) => {
    console.log('Heard:', text);
  },
  onCommand: (command) => {
    console.log('Command detected:', command);
    // Handle command
  },
  language: 'en-US',
  continuous: true
});

// Stop listening
speechToTextService.stopListening();
```

---

## 🧩 Component Patterns

### Page Components

Pages should follow this structure:

```tsx
// src/components/pages/ExamplePage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import PageLayout from '@/components/layout/PageLayout';

const ExamplePage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch data
      setData(result);
    } catch (error) {
      console.error('Failed to load:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <PageLayout
      title="Page Title"
      subtitle="Page description"
      actions={<Button onClick={handleAction}>Action</Button>}
    >
      {/* Page content */}
    </PageLayout>
  );
};

export default ExamplePage;
```

### Common Component Patterns

#### Button Component

```tsx
<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>

<Button variant="glass" icon={<PlusIcon />} loading={isLoading}>
  Add Item
</Button>
```

#### Glass Card

```tsx
<GlassCard hover padding="lg" blur="xl">
  <h3>Card Title</h3>
  <p>Card content...</p>
</GlassCard>
```

#### Form Input

```tsx
<Input
  label="Project Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder="Enter project name"
  error={errors.name}
  variant="glass"
/>
```

#### Modal Pattern

```tsx
{showModal && (
  <div className="modal-overlay" onClick={() => setShowModal(false)}>
    <div className="glass-modal" onClick={(e) => e.stopPropagation()}>
      <h2>Modal Title</h2>
      {/* Modal content */}
      <div className="modal-actions">
        <Button onClick={() => setShowModal(false)}>Cancel</Button>
        <Button variant="primary" onClick={handleSave}>Save</Button>
      </div>
    </div>
  </div>
)}
```

### Context Usage

```tsx
// Using SimpleAuthContext
import { useAuth } from '@/contexts/SimpleAuthContext';

const Component = () => {
  const { user, signIn, signOut } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return <div>Welcome, {user.username}!</div>;
};
```

---

## ⚙️ Development Workflows

### Initial Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd project-planner-app

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Configure environment variables
# Edit .env and add:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_ANTHROPIC_API_KEY

# 5. Start Supabase (local development)
npm run supabase:start

# 6. Run database migrations
npm run supabase:migrate

# 7. Start development servers
npm run dev:full
# OR run separately:
npm run dev          # Frontend only
npm run mcp-bridge   # MCP bridge server
```

### Running the Application

```bash
# Development with hot reload
npm run dev

# Development with MCP bridge
npm run dev:full

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Operations

```bash
# Start local Supabase
npm run supabase:start

# Stop Supabase
npm run supabase:stop

# Reset database (WARNING: deletes all data)
npm run supabase:reset

# Create new migration
npx supabase migration new <migration_name>

# Apply migrations
npm run supabase:migrate

# Generate TypeScript types from database
npm run db:generate-types

# Check Supabase status
npm run supabase:status
```

### Server Management

```bash
# Restart all servers
npm run restart
# OR
./restart-servers.sh

# Stop all servers
npm run stop
# OR
./stop-servers.sh
```

---

## 🧪 Common Tasks

### Adding a New Feature

1. **Plan the feature**
   - Define requirements
   - Identify affected components
   - Check for existing patterns

2. **Create types** (`src/types/`)
   ```typescript
   // src/types/newFeature.ts
   export interface NewFeature {
     id: string;
     name: string;
     // ...
   }
   ```

3. **Create service** (`src/services/`)
   ```typescript
   // src/services/newFeatureService.ts
   export class NewFeatureService {
     async createFeature(data: NewFeatureData): Promise<NewFeature> {
       // Implementation
     }
   }

   export const newFeatureService = new NewFeatureService();
   ```

4. **Create components** (`src/components/`)
   ```tsx
   // src/components/newFeature/NewFeatureCard.tsx
   const NewFeatureCard: React.FC<Props> = ({ data }) => {
     // Implementation
   };
   ```

5. **Add route** (if needed)
   ```tsx
   // src/App.tsx
   <Route path="/new-feature" element={<NewFeaturePage />} />
   ```

6. **Test the feature**
   - Manual testing
   - Check console for errors
   - Test edge cases

### Creating a Database Migration

```bash
# 1. Create migration file
npx supabase migration new add_new_feature_table

# 2. Edit migration file in supabase/migrations/
# Example: supabase/migrations/20250118_add_new_feature_table.sql
```

```sql
-- Create new table
CREATE TABLE IF NOT EXISTS new_feature (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE new_feature ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own data"
  ON new_feature FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data"
  ON new_feature FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data"
  ON new_feature FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_new_feature_user_id ON new_feature(user_id);
CREATE INDEX idx_new_feature_created_at ON new_feature(created_at);
```

```bash
# 3. Apply migration
npm run supabase:migrate

# 4. Generate new types
npm run db:generate-types
```

### Integrating Claude AI into a Feature

```typescript
// 1. Import service
import { modernClaudeService } from '@/services/modern-claude-service';

// 2. Use in component
const [aiResponse, setAiResponse] = useState('');
const [loading, setLoading] = useState(false);

const generateWithAI = async () => {
  setLoading(true);
  try {
    const response = await modernClaudeService.sendMessage(
      'Generate suggestions for this project',
      {
        context: { projectData },
        temperature: 0.7
      }
    );
    setAiResponse(response.content);
  } catch (error) {
    console.error('AI generation failed:', error);
  } finally {
    setLoading(false);
  }
};
```

### Adding Voice Commands

```typescript
// 1. Define command pattern in speech-to-text-service.ts
const commandPatterns = [
  {
    pattern: /new feature (.*)/i,
    action: 'create_feature',
    extract: (match) => ({ name: match[1] })
  }
];

// 2. Handle command in component
import { speechToTextService } from '@/services/speech-to-text-service';

useEffect(() => {
  speechToTextService.startListening({
    onCommand: handleVoiceCommand,
    continuous: true
  });

  return () => speechToTextService.stopListening();
}, []);

const handleVoiceCommand = (command) => {
  if (command.action === 'create_feature') {
    createFeature(command.data.name);
  }
};
```

---

## 🐛 Testing & Debugging

### Available Test Scripts

```bash
# Run app functionality tests
npm run test:app

# Test browser console
node test-browser-console.js

# Health check
node health-check.cjs

# Debug blank page issues
node debug-blank-page.js
npm run debug:blank-page

# Component isolation testing
npm run debug:component-isolation
```

### Debugging Tools

#### Console Logging

```typescript
// Use debug logger utility
import { debugLog } from '@/utils/debug-logger';

debugLog('component', 'Action performed', { data });
debugLog('service', 'API call successful', result);
debugLog('error', 'Operation failed', error);
```

#### Error Boundaries

All pages should be wrapped in error boundaries:

```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

#### Health Monitoring

Check service health at runtime:

```typescript
import { safeAILoader } from '@/services/safeAILoader';

const healthStatus = await safeAILoader.performHealthCheck();
console.log('Service Health:', healthStatus);
// {
//   overall: 'healthy' | 'degraded' | 'failed',
//   features: { ... },
//   services: { ... },
//   recommendations: [ ... ]
// }
```

### Common Issues

#### Blank Page

**Symptoms:** White screen, no content
**Causes:**
- Import failures
- Circular dependencies
- Missing environment variables

**Solutions:**
1. Check browser console for errors
2. Verify all environment variables are set
3. Run `node debug-blank-page.js`
4. Check for circular imports

#### API Errors

**Symptoms:** Failed API calls, timeout errors
**Causes:**
- Invalid API keys
- MCP bridge not running
- Network issues
- Rate limiting

**Solutions:**
1. Verify API keys in `.env`
2. Check MCP bridge: `curl http://localhost:3001/health`
3. Review network tab in DevTools
4. Check API rate limits

#### Supabase Connection Errors

**Symptoms:** Database queries fail
**Causes:**
- Supabase not running
- Invalid credentials
- RLS policy issues

**Solutions:**
1. Check Supabase status: `npm run supabase:status`
2. Restart Supabase: `npm run supabase:start`
3. Verify environment variables
4. Check RLS policies in Supabase dashboard

---

## 🔐 Environment Configuration

### Required Variables

```bash
# .env file structure

# ===== REQUIRED =====

# Anthropic Claude API
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
# Get from: https://console.anthropic.com/

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
# Get from: Supabase Dashboard > Settings > API

# ===== OPTIONAL =====

# Database (local development)
DATABASE_URL=postgresql://postgres:password@localhost:54322/postgres

# ElevenLabs (voice features)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
VITE_ELEVENLABS_AGENT_ID=your_agent_id

# MCP Server Ports
MCP_BRIDGE_PORT=3001
MCP_SERVER_PORT=3002

# Feature Flags
VITE_ENABLE_VOICE_FEATURES=true
VITE_ENABLE_CLAUDE_STREAMING=true
VITE_ENABLE_DEBUG_MODE=true

# Environment
NODE_ENV=development
```

### Getting API Keys

1. **Anthropic Claude**: https://console.anthropic.com/
   - Sign up/login
   - Navigate to API Keys
   - Create new key

2. **Supabase**: https://supabase.com/dashboard
   - Create new project
   - Go to Settings > API
   - Copy URL and anon key

3. **ElevenLabs** (optional): https://elevenlabs.io/
   - Sign up for account
   - Get API key from dashboard

---

## 📊 Git Workflow

### Branch Strategy

- `main` - Production branch (protected)
- `develop` - Development branch
- `feature/feature-name` - Feature branches
- `bugfix/bug-name` - Bug fix branches
- `claude/*` - AI assistant working branches

### Commit Conventions

```bash
# Format: <type>(<scope>): <description>

# Types:
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation
style:    # Code style (formatting, no logic change)
refactor: # Code refactoring
test:     # Adding/updating tests
chore:    # Maintenance tasks

# Examples:
git commit -m "feat(projects): add AI-powered task generation"
git commit -m "fix(auth): resolve login redirect issue"
git commit -m "docs(readme): update setup instructions"
```

### Standard Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "feat: implement new feature"

# 3. Push to remote
git push -u origin feature/new-feature

# 4. Create pull request (via GitHub UI)

# 5. After review and approval, merge to develop
```

### Working with Claude Branches

When working with Claude Code, branches follow pattern: `claude/<description>-<session-id>`

```bash
# Example: claude/add-claude-documentation-01458jAqzvZe92HFJkGJVT5s

# Push with retry logic (handled by Claude)
git push -u origin claude/add-claude-documentation-01458jAqzvZe92HFJkGJVT5s
```

---

## 🔧 Troubleshooting

### Service Won't Start

**Issue:** Development server fails to start

**Check:**
```bash
# Kill existing processes
pkill -f vite
pkill -f node

# Check port availability
lsof -i :5173  # Frontend
lsof -i :3001  # MCP Bridge

# Restart
npm run restart
```

### Type Errors

**Issue:** TypeScript compilation errors

**Solutions:**
```bash
# Regenerate types from database
npm run db:generate-types

# Clean and rebuild
rm -rf node_modules package-lock.json
npm install

# Check for type mismatches
npm run type-check
```

### Import Errors

**Issue:** Module not found or circular dependency

**Solutions:**
1. Check import paths (use `@/` for absolute imports)
2. Run circular dependency analyzer:
   ```bash
   node circular-dep-analyzer.js
   ```
3. Verify file exists and is exported correctly

### Supabase Issues

**Issue:** Database connection or migration problems

**Solutions:**
```bash
# Check status
npm run supabase:status

# View logs
npx supabase logs

# Reset (WARNING: deletes data)
npm run supabase:reset

# Restart
npx supabase stop
npm run supabase:start
```

### AI Features Not Working

**Issue:** Claude API calls fail or timeout

**Check:**
1. API key is valid and has credits
2. No rate limiting (check Anthropic dashboard)
3. Network connectivity
4. MCP bridge is running: `curl http://localhost:3001/health`

**Debug:**
```typescript
import { safeClaudeService } from '@/services/safeClaudeService';

// Check if initialized
const status = await safeClaudeService.checkHealth();
console.log('Claude Status:', status);
```

---

## 📚 Additional Resources

### Documentation Files

- **AI_ARCHITECTURE.md** - Comprehensive AI system documentation
- **CLAUDE_INTEGRATION.md** - Claude integration guide with examples
- **COMPONENT_LIBRARY.md** - Full UI component reference
- **IMPLEMENTATION_GUIDE.md** - Step-by-step implementation patterns
- **DEBUGGING_STRATEGY.md** - Advanced debugging techniques
- **ENVIRONMENT_SETUP.md** - Detailed environment configuration
- **SUPABASE_SETUP.md** - Database setup and configuration
- **DESIGN_SYSTEM_TEMPLATE.md** - Design system guidelines

### External Links

- **React Documentation**: https://react.dev/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Vite Guide**: https://vitejs.dev/guide/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Anthropic Claude**: https://docs.anthropic.com/
- **React Router**: https://reactrouter.com/

---

## 🎯 Quick Reference

### Most Used Commands

```bash
# Start development
npm run dev:full

# Type check
npm run type-check

# Database operations
npm run supabase:start
npm run supabase:migrate
npm run db:generate-types

# Restart servers
npm run restart

# Test application
npm run test:app
```

### Most Used Services

```typescript
// Authentication
import { useAuth } from '@/contexts/SimpleAuthContext';
const { user, signIn, signOut } = useAuth();

// Projects
import { projectService } from '@/services/projectService';
await projectService.createProject(data);

// Tasks
import { taskService } from '@/services/taskService';
await taskService.createTask(taskData);

// Claude AI
import { modernClaudeService } from '@/services/modern-claude-service';
await modernClaudeService.sendMessage(prompt);

// Voice Commands
import { speechToTextService } from '@/services/speech-to-text-service';
speechToTextService.startListening({ ... });
```

### Key File Locations

- **Main App**: `src/App.tsx`
- **Routes**: Defined in `src/App.tsx`
- **Auth Context**: `src/contexts/SimpleAuthContext.tsx`
- **Supabase Client**: `src/lib/supabase.ts`
- **Database Types**: `src/lib/database.types.ts`
- **Environment**: `.env` (not committed)
- **Migrations**: `supabase/migrations/`

---

## ✅ AI Assistant Guidelines

### When Adding Features

1. ✅ Check existing patterns in similar components
2. ✅ Follow TypeScript strict typing
3. ✅ Use existing service patterns
4. ✅ Add proper error handling
5. ✅ Update types if needed
6. ✅ Test manually before committing
7. ✅ Update relevant documentation

### When Debugging

1. ✅ Check browser console first
2. ✅ Verify environment variables
3. ✅ Check service health status
4. ✅ Review network tab for API errors
5. ✅ Use debug logger for tracing
6. ✅ Test with simplified versions
7. ✅ Check for circular dependencies

### Code Quality Standards

1. ✅ All functions have explicit return types
2. ✅ Components are properly typed
3. ✅ Error handling in all async operations
4. ✅ Consistent naming conventions
5. ✅ No console.logs in production code (use debug logger)
6. ✅ Accessibility attributes where needed
7. ✅ Responsive design considerations

### Security Considerations

1. ✅ Never commit API keys or secrets
2. ✅ Validate all user inputs
3. ✅ Use RLS policies for database access
4. ✅ Sanitize AI-generated content before display
5. ✅ Implement proper CORS policies
6. ✅ Use HTTPS in production
7. ✅ Keep dependencies updated

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-18
**Maintained By:** Development Team + Claude AI

For questions or updates to this document, please create an issue or submit a PR.
