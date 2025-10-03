// Test Voice Assistant Commands
// Open browser console and run these commands to test functionality

console.log('🎤 Testing Voice Assistant Commands...');

// Test 1: Check if voice handler is available
if (typeof window.handleVoiceCommand === 'function') {
  console.log('✅ Voice command handler is available');
} else {
  console.log('❌ Voice command handler not found');
}

// Test 2: Test task analytics
async function testTaskAnalytics() {
  console.log('\n📊 Testing Task Analytics...');
  try {
    const result = await window.handleVoiceCommand('get_task_analytics', {});
    console.log('Task Analytics Result:', result);
  } catch (error) {
    console.error('Task Analytics Error:', error);
  }
}

// Test 3: Test overdue tasks
async function testOverdueTasks() {
  console.log('\n⚠️ Testing Overdue Tasks...');
  try {
    const result = await window.handleVoiceCommand('get_overdue_tasks', {});
    console.log('Overdue Tasks Result:', result);
  } catch (error) {
    console.error('Overdue Tasks Error:', error);
  }
}

// Test 4: Test upcoming tasks
async function testUpcomingTasks() {
  console.log('\n📅 Testing Upcoming Tasks...');
  try {
    const result = await window.handleVoiceCommand('get_upcoming_tasks', { days: 7 });
    console.log('Upcoming Tasks Result:', result);
  } catch (error) {
    console.error('Upcoming Tasks Error:', error);
  }
}

// Test 5: Test task prioritization
async function testTaskPrioritization() {
  console.log('\n🎯 Testing Task Prioritization...');
  try {
    const result = await window.handleVoiceCommand('prioritize_tasks', { criteria: 'priority' });
    console.log('Task Prioritization Result:', result);
  } catch (error) {
    console.error('Task Prioritization Error:', error);
  }
}

// Test 6: Test task details search
async function testTaskDetails() {
  console.log('\n🔍 Testing Task Details...');
  try {
    const result = await window.handleVoiceCommand('get_task_details', { taskName: 'test' });
    console.log('Task Details Result:', result);
  } catch (error) {
    console.error('Task Details Error:', error);
  }
}

// Run all tests
async function runAllTests() {
  await testTaskAnalytics();
  await testOverdueTasks();
  await testUpcomingTasks();
  await testTaskPrioritization();
  await testTaskDetails();
  console.log('\n✨ All tests completed!');
}

// Auto-run tests after 2 seconds
setTimeout(runAllTests, 2000);

console.log('Test script loaded. Tests will run automatically in 2 seconds...');
console.log('You can also run individual tests: testTaskAnalytics(), testOverdueTasks(), etc.');