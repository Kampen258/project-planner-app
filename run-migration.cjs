// Direct SQL execution to run the migration
const fs = require('fs');

console.log('🚀 Running schema migration directly via SQL execution...');

// Read the migration SQL
const migrationSQL = fs.readFileSync('./supabase/migrations/20241008_fix_tasks_schema.sql', 'utf8');

console.log('📋 SQL to be executed:');
console.log('='.repeat(80));
console.log(migrationSQL);
console.log('='.repeat(80));

console.log('\n🔧 Instructions:');
console.log('1. Copy the SQL above');
console.log('2. Go to https://supabase.com/dashboard/project/msuqglhbfritslvytexf/sql');
console.log('3. Paste the SQL in the SQL Editor');
console.log('4. Click "Run" to execute the migration');
console.log('\n✅ After running, task creation should work correctly!');

// Test the current state first
async function testCurrentState() {
  console.log('\n🔍 Testing current database state...');

  const testTask = {
    project_id: 'test-project-123',
    name: 'Schema Test Task',
    description: 'Testing schema',
    priority: 'medium',
    status: 'todo',
    completed: false
  };

  try {
    const response = await fetch('https://msuqglhbfritslvytexf.supabase.co/rest/v1/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zdXFnbGhiZnJpdHNsdnl0ZXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTY5MzMsImV4cCI6MjA3NDk5MjkzM30.Cminxmv3KjNiYWQHHEFtUzRNzjRjrmx_YUCc7IRhNR0',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zdXFnbGhiZnJpdHNsdnl0ZXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTY5MzMsImV4cCI6MjA3NDk5MjkzM30.Cminxmv3KjNiYWQHHEFtUzRNzjRjrmx_YUCc7IRhNR0',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testTask)
    });

    const responseText = await response.text();

    if (response.ok) {
      console.log('✅ Schema appears to be already fixed! Task creation successful.');
      return true;
    } else {
      console.log('❌ Schema still needs fixing. Please run the SQL migration.');
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error:', errorData.message);
      } catch (e) {
        console.log('Response:', responseText);
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

testCurrentState();