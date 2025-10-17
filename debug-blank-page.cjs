#!/usr/bin/env node

// Browser-based test to check what's actually rendering
// Fallback to simple HTTP test since puppeteer might not be installed

const http = require('http');

console.log('🔍 Starting blank page debugging...');
console.log('⚠️ Using simple HTTP test (puppeteer not required)');

const options = {
  hostname: 'localhost',
  port: 5174,
  path: '/',
  method: 'GET'
};

console.log('🔗 Testing http://localhost:5174/');

const req = http.request(options, (res) => {
  console.log(`🌐 HTTP Status: ${res.statusCode}`);
  console.log(`🌐 Content-Type: ${res.headers['content-type']}`);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('🌐 Response length:', data.length);
    console.log('🌐 Contains #root element:', data.includes('id="root"'));
    console.log('🌐 Contains main.tsx script:', data.includes('main.tsx'));
    console.log('🌐 Contains React scripts:', data.includes('react'));

    if (res.statusCode === 200 && data.length > 100) {
      console.log('✅ Server is responding correctly');
      console.log('📄 HTML preview:');

      // Extract key parts
      const titleMatch = data.match(/<title>(.*?)<\/title>/);
      const hasRoot = data.includes('<div id="root">');
      const hasScript = data.includes('src="/src/main.tsx"');

      console.log('  - Title:', titleMatch ? titleMatch[1] : 'NOT FOUND');
      console.log('  - Has #root div:', hasRoot);
      console.log('  - Has main.tsx script:', hasScript);

      if (data.length < 2000) {
        console.log('  - Full HTML:', data);
      } else {
        // Show relevant parts
        const startIndex = data.indexOf('<body>');
        const endIndex = data.indexOf('</body>') + 7;
        if (startIndex > -1 && endIndex > startIndex) {
          console.log('  - Body content:', data.substring(startIndex, endIndex));
        }
      }
    } else {
      console.log('❌ Server issue - Status:', res.statusCode);
      console.log('❌ Response:', data.substring(0, 500));
    }

    // Test different routes
    testRoute('/test');
  });
});

req.on('error', (error) => {
  console.error('❌ HTTP Request Error:', error.message);
  console.error('💡 Make sure the dev server is running on http://localhost:5174');
  console.log('💡 Try running: npm run dev:full');
});

req.end();

function testRoute(path) {
  console.log(`\n🧪 Testing route: ${path}`);

  const routeOptions = {
    hostname: 'localhost',
    port: 5174,
    path: path,
    method: 'GET'
  };

  const routeReq = http.request(routeOptions, (res) => {
    console.log(`🌐 ${path} - Status: ${res.statusCode}`);

    let routeData = '';
    res.on('data', (chunk) => {
      routeData += chunk;
    });

    res.on('end', () => {
      const isSameAsRoot = routeData.includes('<div id="root">') && routeData.includes('main.tsx');
      console.log(`🌐 ${path} - Looks like React app: ${isSameAsRoot}`);
      console.log(`🌐 ${path} - Response length: ${routeData.length}`);

      if (res.statusCode !== 200) {
        console.log(`❌ ${path} - Non-200 response`);
      }
    });
  });

  routeReq.on('error', (error) => {
    console.error(`❌ ${path} - Request Error:`, error.message);
  });

  routeReq.end();
}