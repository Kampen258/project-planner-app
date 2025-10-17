// Test task creation to identify the issue
console.log('🔍 Testing task creation...');

// Test the Supabase connection first
async function testSupabaseConnection() {
  try {
    const response = await fetch('https://msuqglhbfritslvytexf.supabase.co/rest/v1/', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zdXFnbGhiZnJpdHNsdnl0ZXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTY5MzMsImV4cCI6MjA3NDk5MjkzM30.Cminxmv3KjNiYWQHHEFtUzRNzjRjrmx_YUCc7IRhNR0'
      }
    });

    if (response.ok) {
      console.log('✅ Supabase connection successful');
      return true;
    } else {
      console.error('❌ Supabase connection failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
}

// Test task creation directly
async function testTaskCreation() {
  const connected = await testSupabaseConnection();

  if (!connected) {
    console.error('❌ Cannot test task creation - Supabase connection failed');
    return;
  }

  // Test data
  const testTask = {
    project_id: 'test-project-123',
    name: 'Test Task',
    description: 'This is a test task',
    priority: 'medium',
    status: 'todo',
    completed: false,
    user_id: 'test-user',
    order_index: 0
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
      console.log('✅ Task creation successful:', JSON.parse(responseText));
    } else {
      console.error('❌ Task creation failed:', response.status, response.statusText);
      console.error('Response body:', responseText);

      try {
        const errorData = JSON.parse(responseText);
        console.error('Error details:', errorData);
      } catch (e) {
        console.error('Could not parse error response as JSON');
      }
    }
  } catch (error) {
    console.error('❌ Task creation request error:', error);
  }
}

// Run the test
testTaskCreation();