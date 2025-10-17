// Test task creation with valid UUIDs after schema migration
console.log('🧪 Testing task creation with proper UUIDs...');

async function testTaskCreationWithValidData() {
  // Use proper UUID format for project_id
  const validProjectUUID = '57fdae24-68cb-4000-9a4d-a1abfb5e4430'; // Same as mock user for testing
  const validUserUUID = '57fdae24-68cb-4000-9a4d-a1abfb5e4430';

  const testTask = {
    project_id: validProjectUUID,
    name: 'Test Task with Valid UUIDs',
    description: 'Testing task creation after schema fix',
    priority: 'medium',
    status: 'todo',
    completed: false,
    user_id: validUserUUID,
    ai_suggested: false,
    order_index: 0,
    assigned_to: null
  };

  console.log('📤 Sending test task:', JSON.stringify(testTask, null, 2));

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
      console.log('✅ SUCCESS! Task created successfully:');
      console.log(JSON.parse(responseText));
      console.log('\n🎉 The database schema is fixed!');
      console.log('   The issue in your app might be with project ID validation or data flow.');
    } else {
      console.log('❌ FAILED. Still having issues:');
      console.log('   Status:', response.status, response.statusText);
      console.log('   Response:', responseText);

      try {
        const errorData = JSON.parse(responseText);
        console.log('   Error details:', errorData);

        if (errorData.message) {
          if (errorData.message.includes('Could not find')) {
            console.log('\n🔧 DIAGNOSIS: Database schema still needs the migration!');
            console.log('   Please run the SQL migration in your Supabase dashboard.');
          } else if (errorData.message.includes('foreign key')) {
            console.log('\n🔧 DIAGNOSIS: Project or user doesn\'t exist in database!');
            console.log('   Need to create a valid project first.');
          } else {
            console.log('\n🔧 DIAGNOSIS: Other database issue:', errorData.message);
          }
        }
      } catch (e) {
        console.log('   Could not parse error response');
      }
    }
  } catch (error) {
    console.error('💥 Network error:', error);
  }
}

testTaskCreationWithValidData();