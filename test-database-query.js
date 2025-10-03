#!/usr/bin/env node

/**
 * Test script to verify database queries are working
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseQueries() {
  console.log('🧪 Testing database queries...');

  try {
    // Test 1: Get all projects
    console.log('\n📂 Fetching all projects...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectsError) {
      console.error('❌ Projects query error:', projectsError);
    } else {
      console.log(`✅ Found ${projects.length} projects:`);
      projects.forEach(project => {
        console.log(`   • ${project.name} (${project.id})`);
      });
    }

    // Test 2: Get all tasks
    console.log('\n📋 Fetching all tasks...');
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*, projects(name)')
      .order('created_at', { ascending: false });

    if (tasksError) {
      console.error('❌ Tasks query error:', tasksError);
    } else {
      console.log(`✅ Found ${tasks.length} tasks:`);
      tasks.forEach(task => {
        console.log(`   • "${task.name}" in project "${task.projects?.name || task.project_id}" (${task.status})`);
      });
    }

    // Test 3: Look for the specific test task
    console.log('\n🎯 Looking for "Database Test Task"...');
    const { data: testTasks, error: testError } = await supabase
      .from('tasks')
      .select('*, projects(name)')
      .eq('name', 'Database Test Task');

    if (testError) {
      console.error('❌ Test task query error:', testError);
    } else if (testTasks.length > 0) {
      console.log('✅ Found the test task!');
      testTasks.forEach(task => {
        console.log(`   • Name: ${task.name}`);
        console.log(`   • Project: ${task.projects?.name || task.project_id}`);
        console.log(`   • Status: ${task.status}`);
        console.log(`   • Priority: ${task.priority}`);
        console.log(`   • ID: ${task.id}`);
        console.log(`   • Created: ${task.created_at}`);
      });
    } else {
      console.log('❌ Test task not found in database');
    }

    console.log('\n✅ Database query test completed');

  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

// Run the test
testDatabaseQueries().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});