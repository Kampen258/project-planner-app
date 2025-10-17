# Weekly Goals Migration Instructions

Since the migration script cannot execute raw SQL through the client SDK, you'll need to run this migration manually through the Supabase Dashboard.

## Manual Migration Steps:

### 1. Open Supabase Dashboard
Go to your Supabase project dashboard:
**🔗 https://supabase.com/dashboard/project/msuqglhbfritslvytexf/editor**

### 2. Open SQL Editor
- Click on "SQL Editor" in the left sidebar
- Click "New Query" to create a new SQL query

### 3. Copy Migration SQL
Copy the entire contents of the file:
`database/migrations/add_weekly_goals.sql`

Or use this direct path:
`/Users/edovankampen/Documents/Project planner/project-planner-app/database/migrations/add_weekly_goals.sql`

### 4. Execute Migration
- Paste the SQL into the editor
- Click "Run" button to execute the migration

### 5. Verify Success
After running the migration, you should see:
- ✅ New table `weekly_goals` created
- ✅ Proper indexes and constraints
- ✅ Row Level Security policies enabled
- ✅ Helper views created

## What the Migration Creates:

1. **`weekly_goals` table** - Main table for storing weekly goals
2. **Indexes** for performance optimization
3. **Row Level Security (RLS)** policies for data protection
4. **Views** for statistics and reporting:
   - `weekly_goal_stats` - Goal completion statistics by day/week
   - `user_weekly_overview` - Overall weekly completion rates
5. **Triggers** for automatic timestamp updates

## After Migration Success:

1. The Weekly Goals card in your Dashboard will start working
2. You can click "View all" to open the full weekly planner modal
3. Goals will be organized by days (Monday-Sunday)
4. Progress tracking and statistics will be available

## Troubleshooting:

If you encounter any errors:
1. Make sure you're logged into the correct Supabase project
2. Check that your user has admin permissions
3. Try running smaller sections of the SQL if needed

## Alternative: CLI Migration (if you have Docker)

If you prefer to use the CLI and have Docker Desktop running:

```bash
# Start Docker Desktop first, then:
cd "/Users/edovankampen/Documents/Project planner/project-planner-app"

# Start Supabase locally
npx supabase start

# Apply migrations
npx supabase db push

# Or link to remote and push
npx supabase login
npx supabase link --project-ref msuqglhbfritslvytexf
npx supabase db push
```

---

**🎯 Goal:** Get the `weekly_goals` table created so you can start using the Weekly Goals feature in your ProjectFlow app!