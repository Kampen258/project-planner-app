# Supabase Database Setup for ProjectFlow

## 1. Environment Variables

Create a `.env` file in the root directory with your Supabase credentials:

```bash
# Copy .env.example to .env
cp .env.example .env
```

Then update `.env` with your actual Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 2. Database Setup

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/001_create_projects_table.sql`
4. Click **Run** to execute the migration

### Option B: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Initialize Supabase in your project
supabase init

# Link to your remote project
supabase link --project-ref your-project-ref

# Run the migration
supabase db push
```

## 3. Database Schema

The migration creates:

### Tables:
- **projects** - Main project data
- **tasks** - Tasks within projects (for future feature)

### Features:
- ✅ UUID primary keys
- ✅ Automatic timestamps (created_at, updated_at)
- ✅ Row Level Security (RLS) policies
- ✅ Proper indexes for performance
- ✅ Data validation constraints

### Permissions:
- Users can only access their own projects
- Anonymous access allowed for testing (can be restricted later)

## 4. Testing the Connection

Once your `.env` file is set up and migration is run:

1. Restart your dev server: `npm run dev`
2. Check the navigation bar - you should see "DB Connected" with a green dot
3. Try creating a new project - it should be saved to the database
4. Refresh the page - your projects should persist

## 5. Troubleshooting

### "DB Offline" Status
- Check your `.env` file has correct credentials
- Verify your Supabase project URL and anon key
- Make sure the database tables exist

### Permission Errors
- Check that RLS policies are set up correctly
- Verify your Supabase project allows anonymous access (if needed)

### Migration Issues
- Ensure the SQL script ran without errors
- Check Supabase logs in the dashboard
- Verify table structure in the Table Editor

## 6. Next Steps

Once the database is connected:
- ✅ Projects will persist between sessions
- ✅ Multiple users can have separate projects
- 🔄 Ready for task management features
- 🔄 Ready for advanced project features