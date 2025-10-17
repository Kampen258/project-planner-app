#!/usr/bin/env node

// Test if React app is actually loading by checking specific routes

const http = require('http');

console.log('🔍 Testing React app loading...');

function makeRequest(path, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 Testing ${description} (${path})`);

    const options = {
      hostname: 'localhost',
      port: 5174,
      path: path,
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const result = {
          path,
          status: res.statusCode,
          contentType: res.headers['content-type'] || '',
          length: data.length,
          hasRoot: data.includes('<div id="root">'),
          hasReactScript: data.includes('src="/src/main.tsx'),
          hasViteClient: data.includes('/@vite/client'),
          hasReactRefresh: data.includes('react-refresh'),
          isStaticFile: data.includes('<!DOCTYPE html>') && !data.includes('/@vite/client'),
          content: data
        };

        console.log(`  Status: ${result.status}`);
        console.log(`  Content-Type: ${result.contentType}`);
        console.log(`  Length: ${result.length} bytes`);
        console.log(`  Has #root: ${result.hasRoot}`);
        console.log(`  Has React script: ${result.hasReactScript}`);
        console.log(`  Has Vite client: ${result.hasViteClient}`);
        console.log(`  Is static file: ${result.isStaticFile}`);

        if (result.isStaticFile) {
          console.log('  ⚠️ This appears to be a static HTML file, not the React app');
        } else if (result.hasViteClient) {
          console.log('  ✅ This appears to be the Vite-served React app');
        } else {
          console.log('  ❓ Unknown response type');
        }

        resolve(result);
      });
    });

    req.on('error', (error) => {
      console.error(`  ❌ Request failed: ${error.message}`);
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testRoutes() {
  const routes = [
    { path: '/', description: 'root route' },
    { path: '/dashboard', description: 'dashboard route' },
    { path: '/projects', description: 'projects route' },
    { path: '/nonexistent', description: 'non-existent route (should show React 404)' }
  ];

  const results = [];

  for (const route of routes) {
    try {
      const result = await makeRequest(route.path, route.description);
      results.push(result);
    } catch (error) {
      console.error(`❌ Failed to test ${route.path}:`, error.message);
    }
  }

  console.log('\n📊 SUMMARY');
  console.log('==================');

  let reactAppWorking = false;
  let hasStaticFiles = false;

  for (const result of results) {
    const isReactApp = result.hasViteClient && result.hasReactScript;
    const isStatic = result.isStaticFile;

    if (isReactApp) reactAppWorking = true;
    if (isStatic) hasStaticFiles = true;

    console.log(`${result.path}: ${isReactApp ? '✅ React App' : isStatic ? '📄 Static File' : '❓ Unknown'} (${result.length}b)`);
  }

  console.log('\n🎯 DIAGNOSIS');
  console.log('==================');

  if (reactAppWorking) {
    console.log('✅ React app is loading correctly on some routes');
    console.log('💡 If you see blank pages, the issue might be:');
    console.log('   - JavaScript errors in browser console');
    console.log('   - Component rendering issues');
    console.log('   - Context provider issues');
    console.log('   - Missing dependencies');
  } else {
    console.log('❌ React app does not appear to be loading properly');
    console.log('💡 Possible issues:');
    console.log('   - main.tsx is not loading');
    console.log('   - JavaScript build errors');
    console.log('   - Module import failures');
    console.log('   - Vite configuration issues');
  }

  if (hasStaticFiles) {
    console.log('⚠️ Some routes are serving static HTML files instead of React app');
    console.log('💡 This suggests Vite is serving files from public/ or root directory');
  }

  console.log('\n📋 NEXT STEPS:');
  console.log('1. Open browser to http://localhost:5174/');
  console.log('2. Open Developer Tools (F12)');
  console.log('3. Check Console tab for JavaScript errors');
  console.log('4. Check Network tab for failed requests');
  console.log('5. Look for any failed imports or 404s');
}

testRoutes().catch(console.error);