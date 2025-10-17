const http = require('http');

console.log('🔍 Checking http://localhost:5173...');

const options = {
  hostname: 'localhost',
  port: 5173,
  path: '/',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  console.log(`📋 Headers: ${JSON.stringify(res.headers, null, 2)}`);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n📄 HTML Content Analysis:');
    console.log(`• Length: ${data.length} characters`);
    console.log(`• Contains root div: ${data.includes('<div id="root">')} `);
    console.log(`• Contains main.tsx script: ${data.includes('src="/src/main.tsx')}`);
    console.log(`• Contains ProjectFlow title: ${data.includes('ProjectFlow')}`);

    // Check for script tags
    const scriptMatches = data.match(/<script[^>]*>/g) || [];
    console.log(`• Script tags found: ${scriptMatches.length}`);

    if (data.length < 500) {
      console.log('\n📜 Full HTML content:');
      console.log(data);
    } else {
      console.log('\n📜 HTML head section:');
      const headMatch = data.match(/<head>(.*?)<\/head>/s);
      if (headMatch) {
        console.log(headMatch[1].substring(0, 1000) + '...');
      }
    }
  });
});

req.on('error', (error) => {
  console.error(`❌ Request failed: ${error.message}`);
});

req.on('timeout', () => {
  console.error('❌ Request timed out');
  req.abort();
});

req.setTimeout(5000);
req.end();