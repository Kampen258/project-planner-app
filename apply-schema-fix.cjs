// Apply schema fix to Supabase database
const fs = require('fs');
const https = require('https');

console.log('🔧 Applying schema fix to Supabase database...');

// Read the SQL migration
const sqlMigration = fs.readFileSync('./fix-tasks-schema.sql', 'utf8');

// Supabase configuration
const SUPABASE_URL = 'https://msuqglhbfritslvytexf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zdXFnbGhiZnJpdHNsdnl0ZXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTY5MzMsImV4cCI6MjA3NDk5MjkzM30.Cminxmv3KjNiYWQHHEFtUzRNzjRjrmx_YUCc7IRhNR0';

async function runMigration() {
  try {
    console.log('📝 Executing SQL migration...');

    // For direct SQL execution, we need to use the REST API or a proper Supabase SDK
    // Since we can't execute arbitrary SQL via REST API with anon key,
    // let's test if we can insert a task with the new schema

    const testTask = {
      project_id: 'test-project-123',
      name: 'Test Task After Migration',
      description: 'Testing if schema is fixed',
      priority: 'medium',
      status: 'todo',
      completed: false,
      user_id: 'test-user',
      ai_suggested: false,
      order_index: 0,
      assigned_to: null
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testTask)
    });

    const responseText = await response.text();

    if (response.ok) {
      console.log('✅ Schema appears to be fixed! Task creation successful:');
      console.log(JSON.parse(responseText));
      return true;
    } else {
      console.error('❌ Schema still needs fixing. Error:', response.status, response.statusText);
      console.error('Response:', responseText);

      try {
        const errorData = JSON.parse(responseText);
        console.error('Error details:', errorData);

        if (errorData.message && errorData.message.includes('Could not find')) {
          console.log('\n📋 SQL Migration needed:');
          console.log('Please run this SQL in your Supabase SQL Editor:');
          console.log('==========================================');
          console.log(sqlMigration);
          console.log('==========================================');
        }
      } catch (e) {
        console.error('Could not parse error response');
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Migration test failed:', error);
    return false;
  }
}

runMigration();