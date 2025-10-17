// Create a test project for task creation
console.log('🏗️ Creating a test project...');

async function createTestProject() {
  const testProject = {
    id: '57fdae24-68cb-4000-9a4d-a1abfb5e4430', // Same UUID for simplicity
    name: 'Test Project for Tasks',
    description: 'A test project to verify task creation works',
    status: 'planning',
    progress: 0,
    user_id: '57fdae24-68cb-4000-9a4d-a1abfb5e4430'
  };

  console.log('📤 Creating project:', JSON.stringify(testProject, null, 2));

  try {
    const response = await fetch('https://msuqglhbfritslvytexf.supabase.co/rest/v1/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zdXFnbGhiZnJpdHNsdnl0ZXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTY5MzMsImV4cCI6MjA3NDk5MjkzM30.Cminxmv3KjNiYWQHHEFtUzRNzjRjrmx_YUCc7IRhNR0',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zdXFnbGhiZnJpdHNsdnl0ZXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTY5MzMsImV4cCI6MjA3NDk5MjkzM30.Cminxmv3KjNiYWQHHEFtUzRNzjRjrmx_YUCc7IRhNR0',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testProject)
    });

    const responseText = await response.text();

    if (response.ok) {
      console.log('✅ Project created successfully!');
      console.log(JSON.parse(responseText));

      // Now test task creation
      console.log('\n🧪 Now testing task creation...');
      await testTaskCreation();
    } else {
      console.log('❌ Failed to create project:');
      console.log('   Status:', response.status, response.statusText);
      console.log('   Response:', responseText);
    }
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

async function testTaskCreation() {
  const testTask = {
    project_id: '57fdae24-68cb-4000-9a4d-a1abfb5e4430',
    name: 'My First Task',
    description: 'Testing task creation',
    priority: 'medium',
    status: 'todo',
    completed: false,
    user_id: '57fdae24-68cb-4000-9a4d-a1abfb5e4430',
    ai_suggested: false,
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
      console.log('🎉 SUCCESS! Task created successfully!');
      console.log(JSON.parse(responseText));
    } else {
      console.log('❌ Task creation still failed:');
      console.log('   Status:', response.status, response.statusText);
      console.log('   Response:', responseText);
    }
  } catch (error) {
    console.error('💥 Task creation error:', error);
  }
}

createTestProject();