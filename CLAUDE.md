# CLAUDE.md - AI Assistant Guide for Project Planner App

> **Purpose**: This document helps AI assistants (like Claude) understand this codebase's structure, conventions, and workflows to provide effective development assistance.

**Last Updated**: 2025-11-16
**Project Type**: React + TypeScript SPA with Supabase backend and AI integration
**Tech Stack**: React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4, Supabase, Claude AI

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Project Overview](#project-overview)
3. [Codebase Structure](#codebase-structure)
4. [Architecture Patterns](#architecture-patterns)
5. [Development Workflows](#development-workflows)
6. [Key Conventions](#key-conventions)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)
9. [Related Documentation](#related-documentation)

---

## Quick Reference

### Essential Commands

```bash
# Development
npm run dev              # Start dev server (localhost:5173)
npm run dev:full         # Start dev + MCP bridge server
npm run build            # Production build
npm run type-check       # TypeScript validation
npm run lint             # ESLint check

# Database
npm run supabase:start   # Start local Supabase
npm run supabase:reset   # Reset database
npm run db:generate-types # Generate TypeScript types from schema

# Debugging
npm run debug:blank-page # Test server response
npm run restart          # Restart all servers
npm run stop             # Stop all servers
```

### File Locations

```
Components:          /src/components/{category}/
Services:            /src/services/
Types:              /src/types/
Icons:              /src/assets/icons/
Database Schema:    /database/*.sql
Supabase Client:    /src/lib/supabase.ts
Routes:             /src/App.tsx
Entry Point:        /src/main.tsx
```

### Key Services (Singleton Pattern)

```typescript
import { safeClaudeService } from './services/safeClaudeService';
import { SupabaseProjectService } from './services/supabaseProjectService';
import { TaskService } from './services/taskService';
import { newAgileService } from './services/newAgileService';
import { modernClaudeService } from './services/modern-claude-service';
import { speechToTextService } from './services/speech-to-text-service';
```

---

## Project Overview

### What This Application Does

**Project Planner** is a comprehensive project management application combining:
- AI-powered project planning (Claude 3.5 Sonnet)
- Voice-to-text task creation (Web Speech API)
- Multiple project management methodologies (New Agile, OKR)
- Real-time collaboration (Supabase)
- Document analysis and task extraction (Braindump feature)

### Core Features

1. **AI Project Generation**: Claude analyzes descriptions and generates tasks, timelines, and recommendations
2. **Voice Commands**: Create tasks via voice using natural language
3. **New Agile Framework**: Discovery pipeline, hypothesis testing, experiment tracking
4. **OKR Management**: Objectives and Key Results tracking
5. **Braindump**: Upload documents, extract project structure via AI
6. **Real-time Sync**: Supabase real-time subscriptions
7. **Team Collaboration**: Role-based access, activity tracking

### Application Type

- **Frontend**: React 19 SPA with client-side routing
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **AI Integration**: Claude API + MCP Bridge
- **Build Tool**: Vite 7 with TypeScript

---

## Codebase Structure

### Directory Layout

```
project-planner-app/
├── src/
│   ├── components/           # React components (91 files)
│   │   ├── pages/           # Page-level components (27)
│   │   ├── newAgile/        # New Agile methodology (16)
│   │   ├── okr/             # OKR components (6)
│   │   ├── projects/        # Project creation (5)
│   │   ├── tasks/           # Task components (2)
│   │   ├── braindump/       # Document analysis (5)
│   │   ├── common/          # Reusable UI (3)
│   │   ├── layout/          # Navigation (2)
│   │   ├── admin/           # Admin setup (2)
│   │   └── fallbacks/       # Error boundaries
│   │
│   ├── services/            # Business logic (19 files)
│   │   ├── safeClaudeService.ts       # Primary Claude integration
│   │   ├── modern-claude-service.ts   # Streaming responses
│   │   ├── safeMCPService.ts          # MCP protocol bridge
│   │   ├── supabaseProjectService.ts  # Project CRUD
│   │   ├── taskService.ts             # Task management
│   │   ├── newAgileService.ts         # New Agile logic
│   │   ├── speech-to-text-service.ts  # Voice recognition
│   │   └── [other services]
│   │
│   ├── contexts/            # React Context providers
│   │   ├── SimpleAuthContext.tsx      # Primary auth
│   │   └── VoiceCommandsContext.tsx   # Voice state
│   │
│   ├── types/               # TypeScript definitions
│   │   ├── index.ts         # Core types (User, Project, Task)
│   │   ├── newAgile.ts      # New Agile types
│   │   └── project.ts       # Extended project types
│   │
│   ├── lib/                 # Library configuration
│   │   ├── supabase.ts      # Supabase wrapper
│   │   └── database.types.ts # Auto-generated DB types
│   │
│   ├── utils/               # Helper functions
│   │   ├── debug-logger.ts
│   │   └── role-permissions.tsx
│   │
│   ├── App.tsx              # Router configuration
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles + Tailwind
│
├── database/                # SQL migration scripts (8 files)
├── supabase/               # Supabase configuration
├── public/                 # Static assets
├── mcp-servers/            # MCP server implementations
├── scripts/                # Build/utility scripts
└── [config files]          # vite, tsconfig, tailwind, eslint
```

### Component Organization Principles

**Feature-based organization**: Components grouped by feature (newAgile, okr, braindump)
**Page components**: Top-level route components in `/components/pages/`
**Reusable components**: Shared UI in `/components/common/`
**Layout components**: Navigation and page structure in `/components/layout/`

---

## Architecture Patterns

### 1. Service Layer Pattern

**All business logic lives in services, not components.**

```typescript
// ❌ BAD: Logic in component
const ProjectPage = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    supabase.from('projects').select('*').then(setProjects);
  }, []);
};

// ✅ GOOD: Use service layer
const ProjectPage = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    SupabaseProjectService.getProjects(userId).then(setProjects);
  }, []);
};
```

**Service Structure** (Singleton Pattern):
```typescript
class MyService {
  private static instance: MyService;
  private cache = new Map();

  private constructor() {
    // Private constructor prevents direct instantiation
  }

  public static getInstance(): MyService {
    if (!MyService.instance) {
      MyService.instance = new MyService();
    }
    return MyService.instance;
  }

  async doSomething(): Promise<Result> {
    // Implementation
  }
}

export const myService = MyService.getInstance();
```

### 2. Safe Loading Pattern (AI Services)

**Progressive loading with timeout protection to prevent import hangs.**

```typescript
// From safeClaudeService.ts
private async ensureInitialized(): Promise<boolean> {
  if (this.initialized) return true;

  try {
    // Protected import with 10-second timeout
    const Anthropic = await Promise.race([
      import('@anthropic-ai/sdk'),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Import timeout')), 10000)
      )
    ]);

    this.client = new Anthropic.default({ apiKey: '...' });
    this.initialized = true;
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Claude:', error);
    return false;
  }
}
```

**Key Principle**: Always wrap AI service imports in try-catch with fallback behavior.

### 3. Context + Hooks Pattern

**Minimal context usage for global state only.**

```typescript
// Use Context for: Auth, Voice Commands
const AuthContext = React.createContext<AuthState | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// In components
const MyComponent = () => {
  const { user, login, logout } = useAuth();
  // ...
};
```

**What NOT to put in Context**:
- Data fetching results (use services + local state)
- Form state (use local state)
- UI state (use local state)

### 4. Type Safety Pattern

**Strict TypeScript with explicit types.**

```typescript
// ✅ GOOD: Explicit interfaces
interface CreateProjectParams {
  title: string;
  description?: string;
  userId: string;
  tags?: string[];
}

async function createProject(params: CreateProjectParams): Promise<Project> {
  return SupabaseProjectService.createProject(params);
}

// ❌ BAD: Using 'any'
async function createProject(data: any): Promise<any> {
  // ...
}
```

### 5. Error Handling Pattern

**Three-tier error handling: Service → Component → UI**

```typescript
// Service Layer
class MyService {
  async fetchData(): Promise<Result> {
    try {
      const { data, error } = await supabase.from('table').select();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('❌ Service error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Component Layer
const MyComponent = () => {
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    try {
      const result = await myService.fetchData();
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  // UI Layer
  return error ? <Alert type="error">{error}</Alert> : <DataDisplay />;
};
```

---

## Development Workflows

### Adding a New Feature

#### 1. Plan Component Structure
```bash
# Determine where component belongs
/src/components/pages/          # New page
/src/components/{feature}/      # Feature-specific
/src/components/common/         # Reusable UI
```

#### 2. Define Types
```typescript
// /src/types/myFeature.ts
export interface MyFeature {
  id: string;
  name: string;
  // ...
}
```

#### 3. Create Service (if needed)
```typescript
// /src/services/myFeatureService.ts
class MyFeatureService {
  async getData(): Promise<MyFeature[]> {
    // Implementation
  }
}

export const myFeatureService = new MyFeatureService();
```

#### 4. Build Component
```typescript
// /src/components/myFeature/MyFeatureComponent.tsx
import { myFeatureService } from '@/services/myFeatureService';

export const MyFeatureComponent: React.FC = () => {
  // Implementation
};
```

#### 5. Add Route (if needed)
```typescript
// /src/App.tsx
import { MyFeatureComponent } from './components/myFeature/MyFeatureComponent';

// In Routes
<Route path="/my-feature" element={<MyFeatureComponent />} />
```

#### 6. Add Navigation Link
```typescript
// /src/components/layout/Navigation.tsx
<Link to="/my-feature">My Feature</Link>
```

### Database Schema Changes

#### 1. Create Migration File
```bash
# Create in /database/
touch database/009_add_my_table.sql
```

#### 2. Write Migration SQL
```sql
-- database/009_add_my_table.sql
CREATE TABLE IF NOT EXISTS my_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON my_table
  FOR SELECT USING (auth.uid() = user_id);
```

#### 3. Apply Migration
```bash
# Local development
npm run supabase:reset

# Or apply manually
psql -h localhost -p 54322 -U postgres < database/009_add_my_table.sql
```

#### 4. Regenerate Types
```bash
npm run db:generate-types
```

#### 5. Update Service
```typescript
// /src/services/myService.ts
import { supabase } from '@/lib/supabase';
import type { MyTable } from '@/lib/database.types';

class MyService {
  async getAll(): Promise<MyTable[]> {
    const { data, error } = await supabase
      .from('my_table')
      .select('*');

    if (error) throw error;
    return data;
  }
}
```

### Adding AI Capabilities

#### 1. Use Existing Claude Service
```typescript
import { safeClaudeService } from '@/services/safeClaudeService';

const result = await safeClaudeService.sendMessage(
  'Generate tasks for: ' + projectDescription
);
```

#### 2. For Streaming Responses
```typescript
import { modernClaudeService } from '@/services/modern-claude-service';

await modernClaudeService.generateTasksWithStreaming(
  project,
  (chunk) => {
    // Handle each chunk of the response
    setStreamingText(prev => prev + chunk);
  },
  sessionId
);
```

#### 3. For Voice Input
```typescript
import { speechToTextService } from '@/services/speech-to-text-service';

speechToTextService.start({
  onTranscript: (text) => {
    console.log('User said:', text);
  },
  onError: (error) => {
    console.error('Speech error:', error);
  }
});
```

---

## Key Conventions

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `ProjectCard.tsx` |
| Services | camelCase + Service suffix | `taskService.ts` |
| Types/Interfaces | PascalCase | `interface User { }` |
| Functions | camelCase | `function formatDate()` |
| Constants | UPPER_SNAKE_CASE | `const MAX_RETRIES = 3` |
| CSS Classes | kebab-case (Tailwind) | `glass-card` |
| Database Tables | snake_case | `project_templates` |
| Environment Vars | VITE_UPPER_SNAKE | `VITE_SUPABASE_URL` |

### File Naming

```
✅ GOOD
HomePage.tsx              # Component
taskService.ts            # Service
index.ts                  # Types/barrel export
newAgile.ts              # Feature-specific types
modern-claude-service.ts  # Kebab-case for multi-word services

❌ BAD
homePage.tsx             # Should be PascalCase
TaskService.ts           # Service should be camelCase
types.ts                 # Too generic
new_agile.ts            # Should be camelCase
modernClaudeService.ts  # Should be kebab-case
```

### Import Organization

```typescript
// 1. External dependencies
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// 2. Internal services
import { supabaseProjectService } from '@/services/supabaseProjectService';
import { safeClaudeService } from '@/services/safeClaudeService';

// 3. Types
import type { Project, Task } from '@/types';

// 4. Components
import { Button } from '@/components/common/Button';
import { GlassCard } from '@/components/common/GlassCard';

// 5. Utilities
import { formatDate } from '@/utils/date';

// 6. Styles (if any)
import './styles.css';
```

### Component Structure

```typescript
// Imports

// Types/Interfaces
interface MyComponentProps {
  title: string;
  onSave?: (data: Data) => void;
}

// Constants
const MAX_ITEMS = 10;
const DEFAULT_STATUS = 'active';

// Main Component
export const MyComponent: React.FC<MyComponentProps> = ({ title, onSave }) => {
  // 1. State
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(false);

  // 2. Hooks
  const { user } = useAuth();
  const navigate = useNavigate();

  // 3. Effects
  useEffect(() => {
    fetchData();
  }, []);

  // 4. Handlers
  const handleSave = async () => {
    setLoading(true);
    try {
      await myService.save(data);
      onSave?.(data);
    } catch (error) {
      console.error('❌ Save failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // 5. Helper functions
  const formatItem = (item: Item) => {
    return `${item.name} - ${item.status}`;
  };

  // 6. Render conditions
  if (loading) return <LoadingSpinner />;
  if (!data.length) return <EmptyState />;

  // 7. Main render
  return (
    <div className="glass-card">
      <h2>{title}</h2>
      {/* Component JSX */}
    </div>
  );
};

// Helper components (if small and only used here)
const LoadingSpinner = () => <div>Loading...</div>;
const EmptyState = () => <div>No data</div>;
```

### Styling Conventions

**Primary approach: Tailwind utility classes**

```typescript
// ✅ GOOD: Tailwind utilities
<div className="glass-card p-6 hover:-translate-y-1 transition-all">
  <h2 className="text-xl font-semibold text-white mb-4">Title</h2>
  <p className="text-white/80">Content</p>
</div>

// ✅ ACCEPTABLE: Custom classes for complex patterns
<div className="glass-card glass-card-hover">
  {/* Pre-defined in index.css */}
</div>

// ❌ BAD: Inline styles
<div style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
  {/* Don't use inline styles */}
</div>
```

**Glass Morphism Classes** (from `/src/index.css`):
- `.glass-card` - Standard glass card
- `.glass-nav` - Navigation bar
- `.glass-sidebar` - Sidebar
- `.btn-glass` - Glass button
- `.form-input-glass` - Glass input field

### TypeScript Conventions

```typescript
// ✅ GOOD: Explicit return types
async function fetchProjects(userId: string): Promise<Project[]> {
  const result = await SupabaseProjectService.getProjects(userId);
  return result;
}

// ✅ GOOD: Use type imports for type-only imports
import type { User, Project } from '@/types';

// ✅ GOOD: Proper nullability
interface User {
  email: string;           // Required
  avatar?: string;         // Optional
  metadata: Record<string, unknown> | null;  // Explicitly nullable
}

// ❌ BAD: Missing return types
async function fetchProjects(userId) {
  // ...
}

// ❌ BAD: Using 'any'
function processData(data: any): any {
  // ...
}
```

### Error Handling Conventions

**Console logging with emoji prefixes:**

```typescript
console.log('✅ Success:', result);
console.error('❌ Error:', error);
console.warn('⚠️ Warning:', warning);
console.info('ℹ️ Info:', info);
console.debug('🔍 Debug:', data);
```

**Error boundary usage:**
```typescript
// Already in main.tsx - components automatically protected
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## Common Tasks

### Task 1: Add a New Page

```typescript
// 1. Create page component
// File: /src/components/pages/MyNewPage.tsx
import React from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';

export const MyNewPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-primary p-6">
      <div className="container-custom max-w-6xl">
        <h1 className="text-3xl font-bold text-white mb-6">
          My New Page
        </h1>
        <div className="glass-card">
          {/* Content */}
        </div>
      </div>
    </div>
  );
};

// 2. Add route
// File: /src/App.tsx
import { MyNewPage } from './components/pages/MyNewPage';

// In <Routes>
<Route path="/my-new-page" element={<MyNewPage />} />

// 3. Add navigation link
// File: /src/components/layout/Navigation.tsx
<Link
  to="/my-new-page"
  className="nav-link"
>
  My New Page
</Link>
```

### Task 2: Create a New Service

```typescript
// File: /src/services/myNewService.ts
import { supabase } from '@/lib/supabase';
import type { MyDataType } from '@/types';

class MyNewService {
  private cache: Map<string, MyDataType> = new Map();

  async fetchData(id: string): Promise<MyDataType | null> {
    // Check cache first
    if (this.cache.has(id)) {
      console.log('✅ Cache hit for:', id);
      return this.cache.get(id)!;
    }

    try {
      const { data, error } = await supabase
        .from('my_table')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Cache result
      this.cache.set(id, data);
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch data:', error);
      return null;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const myNewService = new MyNewService();
```

### Task 3: Add a Modal Component

```typescript
// File: /src/components/common/MyModal.tsx
import React from 'react';

interface MyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const MyModal: React.FC<MyModalProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="glass-card max-w-2xl w-full mx-4 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="text-white/90">
          {children}
        </div>
      </div>
    </div>
  );
};

// Usage:
const MyComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>

      <MyModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="My Modal"
      >
        <p>Modal content goes here</p>
      </MyModal>
    </>
  );
};
```

### Task 4: Add Real-time Subscription

```typescript
// Subscribe to database changes
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types';

export const useProjectSubscription = (userId: string) => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Initial fetch
    const fetchProjects = async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId);

      if (data) setProjects(data);
    };

    fetchProjects();

    // Subscribe to changes
    const subscription = supabase
      .channel('projects_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('📡 Project change:', payload);

          if (payload.eventType === 'INSERT') {
            setProjects(prev => [...prev, payload.new as Project]);
          } else if (payload.eventType === 'UPDATE') {
            setProjects(prev =>
              prev.map(p => p.id === payload.new.id ? payload.new as Project : p)
            );
          } else if (payload.eventType === 'DELETE') {
            setProjects(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return projects;
};
```

### Task 5: Add Voice Command

```typescript
// Extend voice command recognition
import { speechToTextService } from '@/services/speech-to-text-service';
import { modernClaudeService } from '@/services/modern-claude-service';

const MyVoiceComponent = () => {
  const handleVoiceCommand = async (transcript: string) => {
    console.log('🎤 Voice input:', transcript);

    // Process with Claude
    const result = await modernClaudeService.processVoiceInput(transcript);

    if (result.intent === 'create_task') {
      // Handle task creation
      await taskService.createTask({
        title: result.data.title,
        priority: result.data.priority,
        projectId: currentProjectId
      });
    }
  };

  const startListening = () => {
    speechToTextService.start({
      continuous: true,
      language: 'en-US',
      onTranscript: handleVoiceCommand,
      onError: (error) => console.error('❌ Speech error:', error)
    });
  };

  return (
    <button onClick={startListening}>
      🎤 Start Voice Commands
    </button>
  );
};
```

### Task 6: Use SVG Icons

```typescript
// Import SVG as React component (Recommended)
import PlusIcon from '@/assets/icons/plus.svg?react';
import TrashIcon from '@/assets/icons/trash.svg?react';
import EditIcon from '@/assets/icons/edit.svg?react';

// Option 1: Direct usage
const MyComponent = () => {
  return (
    <div className="glass-card p-4">
      <button className="btn-primary">
        <PlusIcon className="w-5 h-5 mr-2" />
        Add Task
      </button>

      <button className="text-error-500 hover:text-error-600">
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

// Option 2: Using Icon wrapper component
import { Icon } from '@/components/common/Icon';

const MyComponent = () => {
  return (
    <div className="glass-card p-4">
      <button className="btn-glass">
        <Icon
          component={PlusIcon}
          size="md"
          className="text-white/70"
          aria-label="Add new task"
        />
      </button>
    </div>
  );
};

// Option 3: Import as URL (for img tags)
import iconUrl from '@/assets/icons/logo.svg';

<img src={iconUrl} alt="Logo" className="w-8 h-8" />
```

**SVG Import Methods:**
- `import Icon from './icon.svg?react'` - React component (styled with CSS)
- `import icon from './icon.svg'` - URL string (for img src)
- `import icon from './icon.svg?raw'` - Raw SVG string (for innerHTML)

---

## Troubleshooting

### Common Issues

#### Issue: Blank Page on Load

**Symptoms**: White screen, no content, possible console errors

**Causes**:
1. Import failure (especially AI services)
2. Runtime error in component
3. Missing environment variables

**Solutions**:
```bash
# 1. Check browser console for errors
# 2. Verify environment variables
cat .env | grep VITE_

# 3. Test server response
npm run debug:blank-page

# 4. Check for import timeouts
# Look for: "Import timeout" in console

# 5. Restart dev server
npm run restart
```

#### Issue: Supabase Connection Failed

**Symptoms**: Database queries fail, auth doesn't work

**Solutions**:
```bash
# 1. Check Supabase is running
npm run supabase:status

# 2. Restart Supabase
npm run supabase:start

# 3. Verify environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# 4. Check database types are generated
npm run db:generate-types
```

#### Issue: Claude API Errors

**Symptoms**: AI features don't work, API errors in console

**Solutions**:
```typescript
// 1. Verify API key is set
console.log(import.meta.env.VITE_ANTHROPIC_API_KEY);

// 2. Check service initialization
import { safeClaudeService } from '@/services/safeClaudeService';
const initialized = await safeClaudeService.ensureInitialized();
console.log('Claude initialized:', initialized);

// 3. Test with simple message
const result = await safeClaudeService.sendMessage('Hello');
console.log('Claude response:', result);
```

#### Issue: TypeScript Errors

**Symptoms**: Type errors during build or in editor

**Solutions**:
```bash
# 1. Run type check
npm run type-check

# 2. Regenerate database types
npm run db:generate-types

# 3. Clear TypeScript cache (if using VS Code)
# Cmd+Shift+P > "TypeScript: Restart TS Server"

# 4. Check tsconfig.json is correct
cat tsconfig.app.json
```

#### Issue: Voice Recognition Not Working

**Symptoms**: Microphone doesn't work, no transcript generated

**Solutions**:
```typescript
// 1. Check browser support
if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
  console.error('❌ Speech recognition not supported');
  // Use text input fallback
}

// 2. Check microphone permissions
navigator.permissions.query({ name: 'microphone' })
  .then(result => console.log('🎤 Mic permission:', result.state));

// 3. Test with simple setup
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.onresult = (event) => {
  console.log('Transcript:', event.results[0][0].transcript);
};
recognition.start();
```

### Debug Tools

**Console Logging Standards**:
```typescript
// Service initialization
console.log('✅ Service initialized:', serviceName);

// Data fetching
console.log('📡 Fetching data from:', endpoint);
console.log('✅ Data received:', data.length, 'items');

// Errors
console.error('❌ Operation failed:', error);

// Warnings
console.warn('⚠️ Deprecated feature used:', featureName);

// Debug info
console.debug('🔍 Debug info:', debugData);
```

**Browser DevTools**:
- **Network Tab**: Check API calls, Supabase requests
- **Console**: View all console.log output
- **Application > Local Storage**: Check cached data
- **Sources**: Set breakpoints in code

**Testing Pages**:
- `/test` - General testing page
- Debug pages available via npm scripts

---

## Related Documentation

### Internal Documentation

- **[AI_ARCHITECTURE.md](./AI_ARCHITECTURE.md)** - SafeClaudeService, SafeMCPService, health monitoring
- **[CLAUDE_INTEGRATION.md](./CLAUDE_INTEGRATION.md)** - Claude API integration, voice features, speech-to-text
- **[COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md)** - Reusable component reference
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Detailed implementation patterns
- **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)** - Environment configuration
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Database setup and configuration
- **[SERVER-MANAGEMENT.md](./SERVER-MANAGEMENT.md)** - Server management scripts

### External Resources

- **React 19 Docs**: https://react.dev/
- **TypeScript Docs**: https://www.typescriptlang.org/docs/
- **Vite Docs**: https://vitejs.dev/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Claude API**: https://docs.anthropic.com/
- **Web Speech API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

---

## Quick Decision Tree for AI Assistants

### When User Asks to Add a Feature

```
1. Is it a new page?
   → Create in /src/components/pages/
   → Add route in App.tsx
   → Add nav link in Navigation.tsx

2. Is it a new data type?
   → Add database migration in /database/
   → Regenerate types: npm run db:generate-types
   → Create service in /src/services/

3. Is it AI-related?
   → Use existing safeClaudeService or modernClaudeService
   → Follow safe loading patterns
   → Add error handling

4. Is it UI-only?
   → Create component in appropriate /src/components/ folder
   → Use Tailwind utilities
   → Follow glass morphism design system
```

### When User Reports a Bug

```
1. Check console for errors
2. Verify environment variables
3. Test service initialization
4. Check database connection
5. Review recent code changes
6. Add debug logging
7. Test in isolation
```

### When User Asks How Something Works

```
1. Check this file (CLAUDE.md) first
2. Look at related documentation files
3. Examine the actual implementation
4. Provide code examples
5. Explain architectural patterns
```

---

## Final Notes for AI Assistants

### Best Practices

1. **Always use the service layer** - Never call Supabase directly in components
2. **Follow TypeScript strictly** - No `any` types, explicit return types
3. **Use existing patterns** - Don't introduce new patterns without justification
4. **Maintain glass morphism design** - Use established CSS classes
5. **Add error handling** - Every async operation needs try-catch
6. **Cache when appropriate** - Services should cache responses
7. **Log with emojis** - Use ✅❌⚠️ℹ️🔍 prefixes
8. **Test incrementally** - Test each change before moving on
9. **Update types** - Regenerate database types after schema changes
10. **Document complex logic** - Add comments for non-obvious code

### Red Flags

**❌ DON'T DO THESE:**
- Don't bypass service layer
- Don't use `any` type
- Don't create new global state unnecessarily
- Don't mix styling approaches (inline styles vs Tailwind)
- Don't skip error handling
- Don't forget to cleanup subscriptions/listeners
- Don't commit .env files
- Don't push directly to main branch
- Don't ignore TypeScript errors
- Don't create duplicate services/components

### Questions to Ask Before Implementing

1. Does a service/component like this already exist?
2. Where does this fit in the existing architecture?
3. What types need to be defined?
4. Does this need database changes?
5. How should errors be handled?
6. Does this affect other parts of the codebase?
7. Is this following established patterns?
8. Will this need tests?

---

**Last Updated**: 2025-11-16
**Codebase Version**: Active Development
**Total Files**: 144 TypeScript/TSX files

For questions or clarifications, refer to the related documentation files or examine the implementation directly.
