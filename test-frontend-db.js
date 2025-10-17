// Test frontend database connection
import { ProjectService } from './src/services/projectService.js';

console.log('🧪 Testing Frontend Database Connection...');

async function testFrontendConnection() {
  try {
    console.log('1. Testing database connection...');
    const connectionOk = await ProjectService.testConnection();

    if (!connectionOk) {
      console.error('❌ Database connection failed');
      return;
    }

    console.log('2. Testing project retrieval...');
    // Test with a mock user ID that we know exists from previous test
    const projects = await ProjectService.getAllProjects('test-user-id');

    console.log('✅ Frontend DB Test Results:');
    console.log(`   - Connection: ${connectionOk ? 'OK' : 'FAILED'}`);
    console.log(`   - Projects found: ${projects.length}`);

    if (projects.length > 0) {
      console.log('   - Sample project:', {
        id: projects[0].id,
        name: projects[0].title,
        status: projects[0].status
      });
    }

  } catch (error) {
    console.error('❌ Frontend test error:', error.message);
    console.error('Full error:', error);
  }
}

testFrontendConnection();