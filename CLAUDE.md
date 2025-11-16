# CLAUDE.md - AI Assistant Guide for ProjectFlow

> **Purpose**: This document provides comprehensive guidance for AI assistants (like Claude) working with the ProjectFlow codebase. It covers architecture, conventions, workflows, and critical patterns to follow.

**Last Updated**: 2025-11-16
**Project**: ProjectFlow - AI-Powered Project Management with New Agile Methodology
**Version**: 0.0.0

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Project Overview](#project-overview)
3. [Architecture & Tech Stack](#architecture--tech-stack)
4. [Codebase Structure](#codebase-structure)
5. [Development Workflows](#development-workflows)
6. [Code Conventions & Standards](#code-conventions--standards)
7. [Critical Patterns to Follow](#critical-patterns-to-follow)
8. [Common Tasks](#common-tasks)
9. [Testing Strategy](#testing-strategy)
10. [Deployment & CI/CD](#deployment--cicd)
11. [Troubleshooting](#troubleshooting)
12. [Resources](#resources)

---

## Quick Start

### Prerequisites Check
```bash
# Verify environment setup
cat .env.example  # Check required environment variables
npm run type-check  # Verify TypeScript configuration
```

### Essential Environment Variables
```bash
VITE_ANTHROPIC_API_KEY=sk-ant-...      # Required for AI features
VITE_SUPABASE_URL=https://...          # Required for database
VITE_SUPABASE_ANON_KEY=...             # Required for auth
VITE_MCP_BRIDGE_URL=http://localhost:3001  # Optional for MCP features
VITE_ENABLE_VOICE_FEATURES=true        # Optional feature flags
VITE_ENABLE_CLAUDE_STREAMING=true
```

### Development Commands
```bash
npm run dev           # Start Vite dev server (localhost:5173)
npm run dev:full      # Start MCP bridge + Vite concurrently
npm run build         # TypeScript compile + Vite production build
npm run lint          # ESLint check
npm run type-check    # TypeScript type checking only
```

### Project Health Check
```bash
npm run debug:blank-page  # Quick server health check
node health-check.cjs     # Comprehensive system diagnostics
```

---

## Project Overview

### What is ProjectFlow?

ProjectFlow is a **sophisticated, AI-powered project management application** implementing a **New Agile methodology** that emphasizes:

- **Outcome-driven development** with OKR integration
- **Hypothesis-driven experiments** over fixed feature lists
- **Dual-board system**: Discovery Pipeline + Delivery Flow
- **Voice-first AI integration** using Claude 3.5 Sonnet
- **Real-time collaboration** via Supabase
- **Flow metrics** with WIP limits and cycle time tracking

### Core Philosophy (New Agile)

From `docs/PROJECT_INSTRUCTIONS.md`:

- **North Star**: Improve user activation and retention through fast, validated iterations
- **Priorities**: Outcomes over output; small bets over big bets; flow over ceremony; evidence over opinions
- **Decision Making**: Use hypotheses with success criteria; record rationale in Decision Log
- **Work Policies**: Limit WIP; visualize flow; unblock fast; measure cycle/lead time

### Target Users (Personas)

1. **Starter**: First-time solo creator (needs simple onboarding)
2. **Switcher**: Small business owner migrating from spreadsheets
3. **Operator**: Team coordinator (3-15 people, needs permissions)
4. **Advisor**: External collaborator (read-only/limited edit)

---

## Architecture & Tech Stack

### Frontend Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | React | 19.1.1 | UI library with latest features |
| Language | TypeScript | 5.9.3 | Type-safe development |
| Build Tool | Vite | 7.1.7 | Fast HMR and optimized builds |
| Routing | React Router DOM | 6.30.1 | Client-side routing |
| Styling | Tailwind CSS | 4.1.14 | Utility-first CSS framework |
| State | React Context | Built-in | Auth and voice command state |
| Drag & Drop | @dnd-kit | 6.3.1 | Accessible drag & drop |

### Backend & Data

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Database | Supabase (PostgreSQL) | 2.58.0 | Database + Auth + Real-time |
| API SDK | @supabase/supabase-js | 2.58.0 | Database client |
| Migrations | SQL files | - | Version-controlled schema |

### AI Integration

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| AI SDK | @anthropic-ai/sdk | 0.65.0 | Claude API integration |
| Model | Claude 3.5 Sonnet | - | Primary AI model |
| MCP | @modelcontextprotocol/sdk | 1.18.2 | Extended AI tooling |
| Voice | Web Speech API | Browser native | Voice commands |
| MCP Bridge | Express | 5.1.0 | MCP server (port 3001) |

### Development Tools

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Linting | ESLint | 9.36.0 | Code quality enforcement |
| Type Checking | TypeScript | 5.9.3 | Static type analysis |
| Formatting | Prettier | - | Code formatting |
| Concurrency | Concurrently | 8.2.2 | Run multiple dev servers |

---

## Codebase Structure

### Directory Tree

```
/home/user/project-planner-app/
├── .claude/                    # Claude Code configuration
├── .github/workflows/          # CI/CD automation
├── database/                   # Database schema docs
├── docs/                       # Comprehensive documentation
│   ├── PROJECT_INSTRUCTIONS.md # New Agile product principles
│   ├── FEATURE_REQUIREMENTS.md # Feature specifications
│   ├── IMPLEMENTATION_PLAN.md  # 8-week roadmap
│   ├── GAP_ANALYSIS.md         # Feature gap analysis
│   ├── DESIGN_SYSTEM.md        # Design guidelines
│   └── USER_MANUAL.md          # End-user documentation
├── mcp-servers/                # Model Context Protocol servers
├── public/                     # Static assets
├── scripts/                    # Build and utility scripts
├── src/                        # Main source code
│   ├── assets/                # Images, icons, static files
│   ├── components/            # React components (91 .tsx files)
│   │   ├── admin/            # Admin panel components
│   │   ├── braindump/        # Braindump feature
│   │   ├── common/           # Shared/reusable components
│   │   ├── fallbacks/        # Error boundaries
│   │   ├── layout/           # Layout components
│   │   ├── newAgile/         # New Agile methodology (16 files)
│   │   ├── okr/              # OKR management
│   │   ├── pages/            # Page-level components (27 files)
│   │   ├── projects/         # Project-specific components
│   │   └── tasks/            # Task management
│   ├── contexts/             # React Context providers (5 files)
│   ├── lib/                  # Core libraries and utilities
│   ├── pages/                # Route page components
│   ├── services/             # Business logic services (20+ files)
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Utility functions
├── supabase/                  # Supabase configuration
│   ├── migrations/           # Database migrations (5 files)
│   └── templates/            # SQL templates
└── [Root files]              # Config, tests, docs (50+ files)
```

### Key Statistics

- **Total Code**: ~18,165 lines of TypeScript/React
- **React Components**: 91 .tsx files
- **Services**: 20+ service files
- **Pages**: 27 page components
- **Documentation**: 20+ markdown files

### Component Categories

#### 1. Pages (`src/components/pages/` - 27 files)

**Core Pages**:
- `LandingPage.tsx` - Marketing landing page
- `LoginPage.tsx` - Authentication
- `HomePage.tsx` - Main dashboard
- `Dashboard.tsx` - Project overview

**Project Management**:
- `ProjectsPage.tsx` - Project list (with enhanced/minimal/debug variants)
- `ProjectDetailsPage.tsx` - Single project view
- `ProjectCreatePage.tsx` - New project wizard

**Other Features**:
- `ProfilePage.tsx` - User settings
- `TeamPage.tsx` - Team collaboration
- `TaskPage.tsx` - Task management
- `ClaudeIntegrationTestPage.tsx` - AI testing
- `DebugTestingPage.tsx` - Debug utilities

#### 2. New Agile Components (`src/components/newAgile/` - 16 files)

**Discovery Pipeline**:
- `DiscoveryPipeline.tsx` - Opportunity → Hypothesis → Experiment flow
- `DiscoveryLog.tsx` - Research artifacts and insights
- `OpportunityModal.tsx` - Problem-first opportunity cards
- `HypothesisModal.tsx` - Testable hypothesis creation
- `ExperimentModal.tsx` - Experiment design and tracking

**Delivery Flow**:
- `DeliveryFlow.tsx` - Kanban board (Ready → In Progress → Review → Released → Measuring)
- `TasksManagement.tsx` - Task board with WIP limits
- `TaskModal.tsx` - Task creation/editing

**Supporting Components**:
- `OKRManagement.tsx` - Objectives and Key Results
- `DecisionLog.tsx` - Decision tracking
- `UserPersonas.tsx` - User persona management
- `ProjectDocuments.tsx` - Document management
- `PhaseSelector.tsx` - Project phase navigation

#### 3. Services Layer (`src/services/` - 20+ files)

**AI Services** (Critical - See [AI Architecture](#ai-architecture)):
- `safeClaudeService.ts` - **Primary AI service** with safety measures
- `modern-claude-service.ts` - Claude 3.5 Sonnet integration
- `safeMCPService.ts` - Model Context Protocol integration
- `safeAILoader.ts` - Progressive AI feature loading
- `aiService.ts`, `aiContextService.ts`, `metadataAIService.ts`

**Voice Services**:
- `voiceAssistantService.ts` - Voice command processing
- `speech-to-text-service.ts` - Browser speech recognition
- `automated-task-creation-service.ts` - Voice → task automation

**Business Logic**:
- `projectService.ts` - Project CRUD operations
- `supabaseProjectService.ts` - Supabase project integration
- `taskService.ts` - Task management
- `newAgileService.ts` - New Agile methodology logic
- `documentService.ts` - Document management
- `braindumpService.ts` - Braindump functionality
- `teamService.ts` - Team collaboration
- `syncService.ts` - Data synchronization
- `okr/okrService.ts` - OKR management

**Infrastructure**:
- `safeSupabaseService.ts` - Safe Supabase wrapper with error handling

---

## Development Workflows

### Standard Development Workflow

```bash
# 1. Start development environment
npm run dev:full  # Starts MCP bridge (port 3001) + Vite (port 5173)

# 2. Make changes to code
# - Edit components in src/components/
# - Edit services in src/services/
# - HMR will auto-reload changes

# 3. Type check before committing
npm run type-check

# 4. Lint code
npm run lint

# 5. Build for production
npm run build
```

### Database Development Workflow

```bash
# 1. Start local Supabase
npm run supabase:start

# 2. Create new migration
cd supabase/migrations
# Create new SQL file with timestamp: YYYYMMDD_description.sql

# 3. Test migration locally
npm run supabase:migrate

# 4. Generate TypeScript types from schema
npm run generate-types
# This creates src/types/supabase.ts

# 5. Reset database if needed
npm run supabase:reset
```

### AI Feature Development Workflow

```bash
# 1. Test AI integration
# Navigate to: http://localhost:5173/claude-integration-test

# 2. Check service health
node health-check.cjs

# 3. Monitor MCP bridge logs
# MCP bridge runs on port 3001
# Check console for connection status

# 4. Test voice features (if enabled)
# Ensure VITE_ENABLE_VOICE_FEATURES=true
# Navigate to pages with voice assistant
```

### Component Development Workflow

When creating new components:

1. **Choose the right location**:
   - Page-level: `src/components/pages/`
   - New Agile feature: `src/components/newAgile/`
   - Shared/reusable: `src/components/common/`
   - Domain-specific: `src/components/{domain}/`

2. **Follow naming conventions**:
   - PascalCase for component files: `MyComponent.tsx`
   - Descriptive names: `OpportunityModal.tsx` not `Modal.tsx`

3. **Use path aliases**:
   ```typescript
   import { Button } from '@components/common/Button';
   import { projectService } from '@services/projectService';
   import type { Project } from '@types/index';
   ```

4. **Create variants for experimentation**:
   - If refactoring existing component, create `ComponentName-enhanced.tsx`
   - Keep original as `ComponentName.tsx` for comparison
   - Create `ComponentName-minimal.tsx` for simplified version

---

## Code Conventions & Standards

### TypeScript Configuration

**Extremely Strict Type Checking** (`tsconfig.app.json:18-31`):

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUncheckedIndexedAccess": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true
}
```

**Key Rules for AI Assistants**:
- ✅ ALWAYS define explicit types - never use `any`
- ✅ ALWAYS check for undefined/null before accessing array elements
- ✅ ALWAYS return values from all code paths
- ✅ ALWAYS handle all switch cases
- ✅ NEVER leave unused variables or parameters

### Path Aliases (`tsconfig.app.json:50-59`)

```typescript
// Available aliases:
import X from '@/...'           // src/
import X from '@components/...' // src/components/
import X from '@services/...'   // src/services/
import X from '@types/...'      // src/types/
import X from '@utils/...'      // src/utils/
import X from '@contexts/...'   // src/contexts/
import X from '@hooks/...'      // src/hooks/
import X from '@lib/...'        // src/lib/
import X from '@assets/...'     // src/assets/
```

### Prettier Configuration (`.prettierrc.json`)

```json
{
  "semi": true,                  // Use semicolons
  "singleQuote": true,           // Single quotes
  "tabWidth": 2,                 // 2-space indentation
  "printWidth": 100,             // Max line length
  "trailingComma": "es5",        // Trailing commas where valid
  "arrowParens": "avoid"         // Omit parens for single-arg arrows
}
```

### ESLint Rules

From `eslint.config.js`:
- TypeScript ESLint with type-checked rules
- React Hooks plugin (strict dependency checking)
- React Refresh plugin (HMR support)
- Console logs allowed in config files, discouraged in source

### Naming Conventions

From `docs/PROJECT_INSTRUCTIONS.md:85`:

- **Intent-revealing names**: Use descriptive, meaningful names
- **Domain language**: Use New Agile terminology (Opportunity, Hypothesis, Experiment, Insight)
- **No abbreviations**: `opportunity` not `opp`, `hypothesis` not `hyp`
- **File naming**:
  - Components: PascalCase (`OpportunityModal.tsx`)
  - Services: camelCase (`projectService.ts`)
  - Types: PascalCase for interfaces (`Project.ts`)

### Import Order Convention

```typescript
// 1. External dependencies
import React from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Internal path aliases (alphabetically)
import { Button } from '@components/common/Button';
import { useAuth } from '@contexts/AuthContext';
import { projectService } from '@services/projectService';
import type { Project } from '@types/index';

// 3. Relative imports
import './styles.css';
```

### Component Structure Pattern

```typescript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '@types/index';

// 2. Type definitions
interface ComponentProps {
  projectId: string;
  onUpdate?: (project: Project) => void;
}

// 3. Component definition
export const MyComponent: React.FC<ComponentProps> = ({ projectId, onUpdate }) => {
  // 4. Hooks (useState, useEffect, custom hooks)
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Effect logic
  }, [projectId]);

  // 5. Event handlers
  const handleSubmit = async () => {
    // Handler logic
  };

  // 6. Render helpers (optional)
  const renderStatus = () => {
    // Render logic
  };

  // 7. Return JSX
  return (
    <div className="glass-card p-6">
      {/* Component content */}
    </div>
  );
};
```

### Service Pattern

From `src/services/safeClaudeService.ts:37-48`:

```typescript
class MyService {
  private client: any = null;
  private initialized = false;
  private config: ServiceConfig = { /* defaults */ };
  private cache = new Map();

  // Safe initialization - only when needed
  private async ensureInitialized(): Promise<boolean> {
    if (this.initialized) return true;
    // Dynamic import with timeout protection
    // Initialize client
    // Handle errors gracefully
  }

  // Public methods check initialization first
  public async doSomething(): Promise<Result> {
    const ready = await this.ensureInitialized();
    if (!ready) return { success: false, error: 'Not initialized' };
    // Actual logic
  }
}

export const myService = new MyService(); // Singleton export
```

---

## Critical Patterns to Follow

### 1. Progressive AI Loading Architecture

**Problem**: AI imports can cause blank page issues if Anthropic SDK fails to load.

**Solution**: Safe imports with timeout protection (`src/services/safeClaudeService.ts:64-70`):

```typescript
// Dynamic import with timeout protection
const importPromise = import('@anthropic-ai/sdk');
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Import timeout after 10 seconds')), 10000)
);

const { Anthropic } = await Promise.race([importPromise, timeoutPromise]) as any;
```

**Key Principles**:
- ✅ ALWAYS use dynamic imports for AI dependencies
- ✅ ALWAYS add timeout protection (10 seconds max)
- ✅ ALWAYS provide fallback UI components
- ✅ ALWAYS check environment variables before initialization
- ❌ NEVER use static imports for `@anthropic-ai/sdk`

### 2. Error Boundaries for Resilience

**Pattern**: Wrap AI features in error boundaries with fallback UI.

```typescript
import { ErrorBoundary } from '@components/fallbacks/ErrorBoundary';

<ErrorBoundary fallback={<SimpleFallback />}>
  <AIFeatureComponent />
</ErrorBoundary>
```

### 3. Glass Morphism Design System

**Consistent CSS Classes** (from `DESIGN_SYSTEM_TEMPLATE.md`):

```css
/* Glass card with blur and border */
.glass-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
}

/* Glass button */
.btn-glass {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.btn-glass:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}
```

**Custom Animations** (Tailwind config):

```css
/* Fade in */
.animate-fade-in {
  animation: fadeIn 0.5s ease-in;
}

/* Slide up */
.animate-slide-up {
  animation: slideUp 0.5s ease-out;
}

/* Scale in */
.animate-scale-in {
  animation: scaleIn 0.3s ease-out;
}
```

**Usage**:
- ✅ ALWAYS use `glass-card` for containers
- ✅ ALWAYS use `btn-glass` for secondary actions
- ✅ ALWAYS use primary color buttons for main actions
- ✅ ALWAYS apply `animate-fade-in` to new content

### 4. Type Safety with Supabase

**Auto-Generated Types**:

```typescript
// Import generated types
import type { Database } from '@/types/supabase';

// Use specific table types
type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];
```

**Regenerate Types After Schema Changes**:
```bash
npm run generate-types  # Creates src/types/supabase.ts
```

### 5. Component Variant Pattern

**Purpose**: Allow experimentation and gradual migration.

**Pattern**:
```
ProjectsPage.tsx          # Original version
ProjectsPage-enhanced.tsx # Enhanced with new features
ProjectsPage-minimal.tsx  # Simplified version
ProjectsPage-debug.tsx    # Debug version
```

**Usage**:
- Keep original as fallback
- Test enhanced version with subset of users
- Compare performance and UX
- Migrate when confident

### 6. Service Layer Abstraction

**Principles**:
- ✅ Business logic lives in services, not components
- ✅ Services are singletons (export instance, not class)
- ✅ Services handle errors internally and return result objects
- ✅ Services use TypeScript interfaces for contracts

**Example**:

```typescript
// projectService.ts
interface ProjectResult {
  success: boolean;
  data?: Project;
  error?: string;
}

class ProjectService {
  async getProject(id: string): Promise<ProjectResult> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (err) {
      return { success: false, error: 'Unexpected error' };
    }
  }
}

export const projectService = new ProjectService();
```

### 7. Context-Based State Management

**Available Contexts**:
- `AuthContext` - User authentication state
- `SupabaseAuthContext` - Supabase auth wrapper
- `VoiceCommandsContext` - Voice command state

**Usage Pattern**:

```typescript
import { useAuth } from '@contexts/AuthContext';

const MyComponent = () => {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <LoginPrompt />;

  return <AuthenticatedView user={user} />;
};
```

### 8. Database Schema Patterns

**Standard Table Structure**:

```sql
CREATE TABLE table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Table-specific columns
  name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Constraints
  CONSTRAINT valid_name CHECK (LENGTH(name) > 0)
);

-- Row Level Security
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own data"
  ON table_name
  FOR ALL
  USING (auth.uid() = user_id);

-- Updated timestamp trigger
CREATE TRIGGER update_table_name_updated_at
  BEFORE UPDATE ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Key Patterns**:
- UUID primary keys (not auto-increment)
- `created_at` and `updated_at` timestamps
- JSONB for flexible metadata
- Row Level Security (RLS) policies
- Foreign keys with CASCADE deletes
- Constraints for data validation

---

## Common Tasks

### Adding a New Page

```bash
# 1. Create page component
touch src/components/pages/MyNewPage.tsx

# 2. Create page route wrapper
touch src/pages/MyNewPage.tsx

# 3. Add route in main App
# Edit src/App.tsx or routing file
```

Example page component:

```typescript
// src/components/pages/MyNewPage.tsx
import React from 'react';
import { useAuth } from '@contexts/AuthContext';

export const MyNewPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 animate-fade-in">
          My New Page
        </h1>

        <div className="glass-card p-6">
          {/* Page content */}
        </div>
      </div>
    </div>
  );
};
```

### Adding a New Service

```bash
# 1. Create service file
touch src/services/myNewService.ts

# 2. Define interfaces and class
# 3. Export singleton instance
# 4. Import in components
```

Example service:

```typescript
// src/services/myNewService.ts
interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class MyNewService {
  private initialized = false;

  async doSomething(param: string): Promise<ServiceResult<any>> {
    try {
      // Service logic
      return { success: true, data: result };
    } catch (error) {
      console.error('MyNewService error:', error);
      return { success: false, error: 'Operation failed' };
    }
  }
}

export const myNewService = new MyNewService();
```

### Adding a Database Table

```bash
# 1. Create migration file
cd supabase/migrations
touch $(date +%Y%m%d%H%M)_add_my_table.sql

# 2. Write SQL schema
# 3. Apply migration
npm run supabase:migrate

# 4. Generate TypeScript types
npm run generate-types

# 5. Use types in code
```

Example migration:

```sql
-- supabase/migrations/20251116_add_my_table.sql

-- Create table
CREATE TABLE my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_name CHECK (LENGTH(name) > 0)
);

-- Enable RLS
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own data"
  ON my_table FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data"
  ON my_table FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data"
  ON my_table FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own data"
  ON my_table FOR DELETE
  USING (auth.uid() = user_id);

-- Updated timestamp trigger
CREATE TRIGGER update_my_table_updated_at
  BEFORE UPDATE ON my_table
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_my_table_user_id ON my_table(user_id);
CREATE INDEX idx_my_table_created_at ON my_table(created_at DESC);
```

### Adding AI Features

```typescript
// 1. Import safe service
import { safeClaudeService } from '@services/safeClaudeService';

// 2. Check service status
const status = await safeClaudeService.getStatus();
if (!status.initialized) {
  console.warn('AI features not available');
  return;
}

// 3. Send message
const response = await safeClaudeService.sendMessage([
  { role: 'user', content: 'Your prompt here' }
]);

if (response.success) {
  console.log('AI response:', response.content);
} else {
  console.error('AI error:', response.error);
}
```

### Adding Voice Commands

```typescript
// 1. Use voice context
import { useVoiceCommands } from '@contexts/VoiceCommandsContext';

const MyComponent = () => {
  const { isListening, startListening, stopListening } = useVoiceCommands();

  return (
    <button onClick={isListening ? stopListening : startListening}>
      {isListening ? '🎤 Listening...' : '🎤 Start Voice'}
    </button>
  );
};
```

---

## Testing Strategy

### Current Testing Setup

⚠️ **Note**: No formal test framework (Jest/Vitest) is currently configured.

**Manual Testing Scripts**:
- `test-app-functionality.cjs` - App functionality tests
- `test-app.cjs` - General app tests
- `test-mcp-dependencies.cjs` - MCP dependency tests
- `health-check.cjs` - System health diagnostics
- `circular-dep-analyzer.js` - Dependency analysis

### Running Tests

```bash
# Manual test scripts
node test-app-functionality.cjs
node health-check.cjs
node circular-dep-analyzer.js

# Browser tests
open http://localhost:5173/test.html
open http://localhost:5173/test-component.html

# Health check
npm run debug:blank-page
```

### Testing Best Practices

When adding new features:

1. **Manual Testing Checklist**:
   - ✅ Test in browser with dev tools open
   - ✅ Check console for errors/warnings
   - ✅ Test with network throttling (slow 3G)
   - ✅ Test authentication flows
   - ✅ Test error states (disconnect Supabase, invalid API key)

2. **Component Isolation**:
   - Create test HTML files in root for isolated component testing
   - Use debug variants of components for troubleshooting

3. **Service Testing**:
   - Use dedicated test pages (e.g., `ClaudeIntegrationTestPage.tsx`)
   - Log service calls and responses
   - Test error handling explicitly

4. **Database Testing**:
   ```bash
   npm run supabase:reset  # Reset to clean state
   npm run db:seed         # Seed test data
   ```

---

## Deployment & CI/CD

### GitHub Actions

**Automated Type Generation** (`.github/workflows/supabase-types.yml`):

- **Triggers**:
  - Daily at 2 AM UTC
  - Manual workflow dispatch
  - On database migration changes

- **Actions**:
  1. Generates TypeScript types from Supabase schema
  2. Commits changes to repository
  3. Creates PR for scheduled runs

### Build Process

```bash
npm run build
# Executes: tsc -b && vite build
# Output: /dist directory
```

**Build Steps**:
1. TypeScript compilation (`tsc -b`)
2. Vite production build (minification, tree-shaking)
3. Static assets optimization

### Environment Management

**Development**:
```bash
cp .env.example .env
# Edit .env with your credentials
npm run dev:full
```

**Production**:
- Set environment variables in hosting platform
- Ensure all `VITE_*` variables are set at build time
- Never commit `.env` file (in `.gitignore`)

### Server Management

```bash
# Start servers
npm run dev:full  # MCP bridge + Vite

# Restart servers
npm run restart
# Or: ./restart-servers.sh

# Stop servers
npm run stop
# Or: ./stop-servers.sh
```

### Database Deployment

```bash
# Local development
npm run supabase:start   # Start local instance
npm run supabase:migrate # Apply migrations

# Production
# Migrations applied via Supabase dashboard or CLI
npx supabase db push --project-ref <ref>
```

---

## Troubleshooting

### Common Issues

#### 1. Blank Page / White Screen

**Symptoms**: Application shows blank page, no console errors.

**Causes**:
- AI service import failure
- Circular dependency
- Component error boundary triggered

**Solutions**:
```bash
# 1. Check health
node health-check.cjs

# 2. Check circular dependencies
node circular-dep-analyzer.js

# 3. Check browser console
# Look for import errors or React errors

# 4. Test minimal version
# Navigate to pages with -minimal suffix

# 5. Disable AI features temporarily
# Remove VITE_ANTHROPIC_API_KEY from .env
```

#### 2. TypeScript Errors After Database Changes

**Symptoms**: TypeScript errors referencing database types.

**Solution**:
```bash
# Regenerate types from Supabase schema
npm run generate-types

# If still issues, check migration was applied
npm run supabase:status
```

#### 3. MCP Bridge Not Connecting

**Symptoms**: AI features not working, console shows connection errors.

**Solutions**:
```bash
# 1. Check MCP bridge is running
# Should see: "MCP Bridge Server running on port 3001"

# 2. Restart servers
npm run restart

# 3. Check environment variable
echo $VITE_MCP_BRIDGE_URL  # Should be http://localhost:3001

# 4. Test bridge manually
curl http://localhost:3001/health
```

#### 4. Voice Commands Not Working

**Symptoms**: Microphone icon visible but not responding.

**Solutions**:
1. Check browser permissions (microphone access)
2. Use HTTPS or localhost (required for Web Speech API)
3. Check `VITE_ENABLE_VOICE_FEATURES=true` in `.env`
4. Test in Chrome/Edge (best browser support)

#### 5. Supabase Connection Errors

**Symptoms**: "Failed to fetch", authentication errors.

**Solutions**:
```bash
# 1. Verify environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# 2. Check Supabase project status
npm run supabase:status

# 3. Check RLS policies
# Ensure user has proper permissions

# 4. Check browser network tab
# Look for failed requests to Supabase
```

### Debug Tools

**Health Check**:
```bash
node health-check.cjs
```
- Checks all system dependencies
- Validates environment variables
- Tests service connections

**Circular Dependency Analyzer**:
```bash
node circular-dep-analyzer.js
```
- Detects circular import chains
- Helps prevent runtime errors

**Debug Pages**:
- `http://localhost:5173/debug.html` - Basic debug page
- `http://localhost:5173/debug-testing` - Debug testing page
- `http://localhost:5173/claude-integration-test` - AI integration test

### Performance Issues

**Symptoms**: Slow page loads, laggy interactions.

**Solutions**:

1. **Check bundle size**:
   ```bash
   npm run build
   # Check dist/ folder size
   ```

2. **Analyze dependencies**:
   ```bash
   node circular-dep-analyzer.js
   ```

3. **Optimize imports**:
   - Use path aliases
   - Avoid importing entire libraries
   - Lazy load heavy components

4. **Check render performance**:
   - Use React DevTools Profiler
   - Look for unnecessary re-renders
   - Add `React.memo()` where appropriate

---

## Resources

### Internal Documentation

**Essential Reading**:
- `docs/PROJECT_INSTRUCTIONS.md` - New Agile principles and product guidelines
- `DESIGN_SYSTEM_TEMPLATE.md` - Complete design system reference
- `COMPONENT_LIBRARY.md` - Component library documentation
- `AI_ARCHITECTURE.md` - AI system architecture
- `CLAUDE_INTEGRATION.md` - Claude AI integration guide

**Feature Documentation**:
- `docs/FEATURE_REQUIREMENTS.md` - Detailed feature specifications
- `docs/IMPLEMENTATION_PLAN.md` - 8-week implementation roadmap
- `docs/GAP_ANALYSIS.md` - Feature gap analysis
- `docs/USER_MANUAL.md` - End-user manual

**Technical Guides**:
- `ENVIRONMENT_SETUP.md` - Environment variables guide
- `SUPABASE_SETUP.md` - Supabase configuration
- `SERVER-MANAGEMENT.md` - Server management guide
- `IMPLEMENTATION_GUIDE.md` - Implementation instructions
- `database/README.md` - Database schema documentation

**Debugging**:
- `DEBUGGING_STRATEGY.md` - Debugging approaches
- `DEBUGGING_SUMMARY.md` - Common debug scenarios
- `DEBUGGING-SOLUTION.md` - Debug solutions
- `test-system.md` - Testing documentation

### External Resources

**Technologies**:
- [React 19 Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [React Router](https://reactrouter.com/)

**Best Practices**:
- [New Agile Methodology](https://www.producttalk.org/) - Continuous Discovery
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/) - Accessibility
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

### Quick Reference Commands

```bash
# Development
npm run dev              # Vite only
npm run dev:full         # MCP + Vite
npm run build           # Production build
npm run lint            # ESLint
npm run type-check      # TypeScript check

# Database
npm run supabase:start   # Start local Supabase
npm run supabase:migrate # Apply migrations
npm run supabase:reset   # Reset database
npm run generate-types   # Generate TS types

# Testing & Debug
node health-check.cjs           # System health
node circular-dep-analyzer.js   # Dependency analysis
npm run debug:blank-page        # Quick server check

# Server Management
npm run restart          # Restart all servers
npm run stop            # Stop all servers
```

---

## AI Assistant Guidelines

### When Working with This Codebase

1. **ALWAYS check environment setup first**:
   - Verify `.env` has required variables
   - Run `npm run type-check` before major changes
   - Use `node health-check.cjs` for diagnostics

2. **ALWAYS follow TypeScript strict mode**:
   - Never use `any` type
   - Check for undefined/null before array access
   - Define explicit return types
   - Handle all error cases

3. **ALWAYS use safe AI patterns**:
   - Dynamic imports with timeout protection
   - Error boundaries around AI features
   - Fallback UI components
   - Check service initialization before use

4. **ALWAYS maintain design consistency**:
   - Use `glass-card` for containers
   - Use `btn-glass` for secondary actions
   - Apply animations (`animate-fade-in`)
   - Follow color palette from design system

5. **ALWAYS update types after database changes**:
   ```bash
   npm run generate-types
   ```

6. **ALWAYS create component variants for major changes**:
   - Keep original as fallback
   - Create `-enhanced` version for new features
   - Test thoroughly before replacing

7. **ALWAYS write services for business logic**:
   - Don't put complex logic in components
   - Use singleton pattern (export instance)
   - Return result objects with `success` flag
   - Handle errors gracefully

8. **ALWAYS follow New Agile principles**:
   - Outcomes over output
   - Hypotheses with success criteria
   - Record decisions in Decision Log
   - Use domain language (Opportunity, Hypothesis, Experiment)

### Code Review Checklist

Before committing code, verify:

- [ ] TypeScript strict mode compliance (no `any`, proper null checks)
- [ ] Prettier formatting applied
- [ ] ESLint warnings addressed
- [ ] Path aliases used (not relative imports)
- [ ] Error handling in place
- [ ] Loading states for async operations
- [ ] Accessibility attributes (ARIA, semantic HTML)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Glass morphism design system followed
- [ ] Documentation updated if needed

---

## Changelog

**2025-11-16**: Initial creation
- Comprehensive codebase analysis
- Architecture documentation
- Development workflows
- Code conventions and patterns
- Common tasks and troubleshooting

---

**End of CLAUDE.md**

For questions or updates, modify this file and commit to the repository.
