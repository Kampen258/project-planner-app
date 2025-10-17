#!/usr/bin/env node

/**
 * Fix user IDs in existing projects to match the mock user in frontend
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Mock user ID from SimpleAuthContext
const MOCK_USER_ID = '57fdae24-68cb-4000-9a4d-a1abfb5e4430';

async function fixUserIds() {
  console.log('🔧 Fixing user IDs in existing projects...');
  console.log('Target user ID:', MOCK_USER_ID);

  try {
    // Get all projects with null user_id
    console.log('\n📂 Finding projects with null user_id...');
    const { data: projects, error: selectError } = await supabase
      .from('projects')
      .select('id, name, user_id')
      .is('user_id', null);

    if (selectError) {
      console.error('❌ Error fetching projects:', selectError);
      return;
    }

    console.log(`✅ Found ${projects.length} projects with null user_id:`);
    projects.forEach(project => {
      console.log(`   • ${project.name} (${project.id})`);
    });

    if (projects.length === 0) {
      console.log('✅ No projects need fixing!');
      return;
    }

    // Update all projects to have the mock user ID
    console.log('\n🔧 Updating user IDs...');
    const { data: updatedProjects, error: updateError } = await supabase
      .from('projects')
      .update({ user_id: MOCK_USER_ID })
      .is('user_id', null)
      .select('id, name, user_id');

    if (updateError) {
      console.error('❌ Error updating projects:', updateError);
      return;
    }

    console.log(`✅ Successfully updated ${updatedProjects.length} projects:`);
    updatedProjects.forEach(project => {
      console.log(`   • ${project.name} - User ID: ${project.user_id}`);
    });

    // Also check and fix tasks if needed
    console.log('\n📋 Checking tasks...');
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, name, user_id')
      .is('user_id', null);

    if (tasksError) {
      console.error('❌ Error fetching tasks:', tasksError);
    } else if (tasks.length > 0) {
      console.log(`Found ${tasks.length} tasks with null user_id, updating...`);

      const { error: updateTasksError } = await supabase
        .from('tasks')
        .update({ user_id: MOCK_USER_ID })
        .is('user_id', null);

      if (updateTasksError) {
        console.error('❌ Error updating tasks:', updateTasksError);
      } else {
        console.log(`✅ Updated ${tasks.length} tasks with new user ID`);
      }
    } else {
      console.log('✅ All tasks already have user IDs');
    }

    console.log('\n✅ User ID fix completed!');
    console.log('Now your frontend should be able to see the projects.');

  } catch (error) {
    console.error('❌ Failed to fix user IDs:', error);
  }
}

// Run the fix
fixUserIds().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});