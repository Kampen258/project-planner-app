# 🗄️ Enhanced Database Schema for Project Planner

This directory contains SQL scripts to extend your project planner database with advanced features.

## 📋 **What's Included**

### **New Tables:**
1. **`task_dependencies`** - Task relationships and blocking dependencies
2. **`project_templates`** - Reusable project templates with metadata
3. **`task_comments`** - Threaded discussions on tasks
4. **`project_attachments`** - File uploads linked to projects/tasks
5. **`time_tracking`** - Time logging and productivity tracking
6. **`project_milestones`** - Major project checkpoints and deliverables
7. **`task_labels`** - Flexible task categorization system
8. **`task_label_assignments`** - Many-to-many task-label relationships

### **Database Functions:**
- **Auto-progress calculation** - Projects update based on completed tasks
- **Activity logging** - Automatic team activity tracking
- **Time duration calculation** - Auto-calculate time entry durations
- **Circular dependency prevention** - Prevents invalid task dependencies
- **Milestone completion tracking** - Auto-timestamps and status updates
- **Template usage tracking** - Track popular templates

### **Performance Features:**
- **Comprehensive indexing** for fast queries
- **Row Level Security (RLS)** policies for data isolation
- **Automated triggers** for business logic
- **Useful views** for reporting and analytics

## 🚀 **Installation Instructions**

### **Step 1: Run the SQL Scripts**

Execute these files in order in your Supabase SQL Editor:

```bash
# 1. Core enhanced tables
01_enhanced_tables.sql

# 2. Time tracking and milestones
02_time_and_milestones.sql

# 3. Functions and triggers
03_functions_and_triggers.sql
```

### **Step 2: Update TypeScript Types**

After running the SQL scripts, regenerate your database types:

```bash
# If you have Supabase CLI linked
npx supabase gen types typescript --local > src/lib/database.types.ts

# Or manually update database.types.ts with the new table definitions
```

### **Step 3: Verify Installation**

Run this query to verify all tables were created:

```sql
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'task_dependencies',
    'project_templates',
    'task_comments',
    'project_attachments',
    'time_tracking',
    'project_milestones',
    'task_labels',
    'task_label_assignments'
  )
ORDER BY table_name;
```

## 📊 **New Features Enabled**

### **1. Task Dependencies** 🔗
```typescript
// Create a blocking dependency
await supabase.from('task_dependencies').insert({
  task_id: 'task-uuid',
  depends_on_task_id: 'prerequisite-task-uuid',
  dependency_type: 'blocks'
});
```

### **2. Project Templates** 📋
```typescript
// Save project as template
await supabase.from('project_templates').insert({
  name: 'Website Launch Template',
  category: 'web-development',
  template_data: {
    tasks: [...],
    milestones: [...],
    defaultSettings: {...}
  },
  is_public: true
});
```

### **3. Time Tracking** ⏰
```typescript
// Start time tracking
await supabase.from('time_tracking').insert({
  task_id: 'task-uuid',
  user_id: 'user-uuid',
  start_time: new Date().toISOString(),
  is_active: true
});

// Stop time tracking (auto-calculates duration)
await supabase.from('time_tracking')
  .update({
    end_time: new Date().toISOString(),
    is_active: false
  })
  .eq('id', 'time-entry-uuid');
```

### **4. Task Comments** 💬
```typescript
// Add comment to task
await supabase.from('task_comments').insert({
  task_id: 'task-uuid',
  user_id: 'user-uuid',
  content: 'This needs to be completed before Friday',
  mentions: ['other-user-uuid']
});
```

### **5. File Attachments** 📎
```typescript
// Upload and link file to project
await supabase.from('project_attachments').insert({
  project_id: 'project-uuid',
  filename: 'requirements.pdf',
  file_path: 'uploads/requirements.pdf',
  file_size: 1024000,
  mime_type: 'application/pdf',
  uploaded_by: 'user-uuid'
});
```

### **6. Project Milestones** 🎯
```typescript
// Create milestone
await supabase.from('project_milestones').insert({
  project_id: 'project-uuid',
  name: 'Beta Release',
  due_date: '2024-12-31',
  milestone_type: 'deliverable',
  is_critical: true
});
```

### **7. Task Labels** 🏷️
```typescript
// Create label
const { data: label } = await supabase.from('task_labels').insert({
  project_id: 'project-uuid',
  name: 'Bug',
  color: '#EF4444'
}).select().single();

// Assign label to task
await supabase.from('task_label_assignments').insert({
  task_id: 'task-uuid',
  label_id: label.id
});
```

## 📈 **Analytics & Reporting**

### **Project Statistics View**
```sql
SELECT * FROM public.project_stats
WHERE id = 'your-project-uuid';
```

### **User Productivity View**
```sql
SELECT * FROM public.user_productivity
WHERE user_id = 'your-user-uuid';
```

## 🔧 **Advanced Features**

### **Automatic Progress Calculation**
Projects automatically update their progress percentage based on completed tasks.

### **Activity Logging**
All major actions (task creation, updates, comments, etc.) are automatically logged to `team_activities`.

### **Circular Dependency Prevention**
The system prevents creating task dependencies that would result in circular references.

### **Smart Time Tracking**
- Only one active timer per user per task
- Automatic duration calculation
- Support for manual time entries

## 🛡️ **Security**

All tables include:
- **Row Level Security (RLS)** policies
- **Team-based access control** - users can only access their projects
- **Audit trails** through activity logging
- **Data validation** constraints

## 🧹 **Maintenance**

### **Archive Old Projects**
```sql
SELECT public.archive_old_projects(90); -- Archive projects completed >90 days ago
```

### **Cleanup Old Time Entries**
```sql
SELECT public.cleanup_old_time_entries(365); -- Delete time entries >1 year old
```

## 🔄 **Migration Notes**

- All scripts are designed to be **safe to run multiple times**
- Existing data will **not be affected**
- New columns have **sensible defaults**
- **Indexes** are optimized for common query patterns

## 🆘 **Troubleshooting**

### **If RLS policies fail:**
Make sure you have the `auth.uid()` function available and users are properly authenticated.

### **If triggers fail:**
Check that the `auth` schema and `auth.users` table exist in your database.

### **If foreign key constraints fail:**
Ensure your existing `projects`, `tasks`, and `users` tables are properly set up.

---

## 📝 **Next Steps**

After installation:
1. Update your frontend components to use these new features
2. Add UI for time tracking, comments, and file uploads
3. Implement dependency visualization for task relationships
4. Create template marketplace functionality
5. Build reporting dashboards using the new analytics views

Happy project planning! 🚀