#!/usr/bin/env node

/**
 * Debug script to test ProjectService and identify blank page issues
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

// Test the exact same configuration as frontend
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const MOCK_USER_ID = '57fdae24-68cb-4000-9a4d-a1abfb5e4430';

console.log('🐛 Debugging Projects Page Issues...');
console.log('Configuration:');
console.log('  - Supabase URL:', SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('  - Supabase Key:', SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
console.log('  - Mock User ID:', MOCK_USER_ID);

async function debugProjectsPage() {
  try {
    console.log('\n🔧 Testing Supabase Connection...');

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Test 1: Basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('projects')
      .select('id')
      .limit(1);

    if (connectionError) {
      console.error('❌ Connection Error:', connectionError.message);
      console.error('Details:', connectionError);
      return;
    }

    console.log('✅ Basic Supabase connection works');

    // Test 2: Query with user ID filter (exactly like frontend)
    console.log('\n📂 Testing user-specific project query...');

    const { data: userProjects, error: userProjectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', MOCK_USER_ID)
      .order('created_at', { ascending: false });

    if (userProjectsError) {
      console.error('❌ User Projects Query Error:', userProjectsError.message);
      console.error('Details:', userProjectsError);
      return;
    }

    console.log(`✅ Found ${userProjects.length} projects for user ${MOCK_USER_ID}:`);
    userProjects.forEach(project => {
      console.log(`   • ${project.name} (${project.id})`);
      console.log(`     Status: ${project.status}`);
      console.log(`     Progress: ${project.progress}%`);
      console.log(`     Created: ${project.created_at}`);
      console.log('');
    });

    // Test 3: Simulate the ProjectService mapping
    console.log('\n🔄 Testing data transformation...');

    const transformedProjects = userProjects.map(project => ({
      id: project.id,
      name: project.name,
      title: project.name, // Map name -> title
      description: project.description,
      status: project.status,
      progress: project.progress || 0,
      dueDate: project.end_date || '',
      priority: project.priority || 'medium',
      tags: project.tags || [],
      teamSize: project.team_members ? project.team_members.length : 1,
      lastUpdate: 'Recently',
      budget: 0,
      tasksCompleted: Math.floor((project.progress || 0) / 100 * 10),
      totalTasks: 10
    }));

    console.log('✅ Data transformation successful:');
    transformedProjects.forEach(project => {
      console.log(`   • Title: ${project.title}`);
      console.log(`     Description: ${project.description || 'No description'}`);
      console.log(`     Status: ${project.status}`);
      console.log(`     Progress: ${project.progress}%`);
      console.log(`     Due Date: ${project.dueDate || 'Not set'}`);
      console.log(`     Tags: ${project.tags.join(', ') || 'None'}`);
      console.log('');
    });

    // Test 4: Check for potential null/undefined issues
    console.log('\n🔍 Checking for potential null/undefined issues...');

    let hasIssues = false;
    transformedProjects.forEach((project, index) => {
      if (!project.name && !project.title) {
        console.error(`❌ Project ${index}: Missing name/title`);
        hasIssues = true;
      }
      if (project.status === null || project.status === undefined) {
        console.error(`❌ Project ${index}: Missing status`);
        hasIssues = true;
      }
      if (typeof project.progress !== 'number') {
        console.error(`❌ Project ${index}: Invalid progress type:`, typeof project.progress);
        hasIssues = true;
      }
    });

    if (!hasIssues) {
      console.log('✅ No data issues found');
    }

    console.log('\n✅ Debug completed - Projects should load in frontend');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugProjectsPage().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});