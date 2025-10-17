#!/usr/bin/env node

// Browser-based test to check what's actually rendering
const puppeteer = require('puppeteer');

async function debugBlankPage() {
  console.log('🔍 Starting blank page debugging...');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Listen for console messages
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      console.log(`🌐 Browser ${type.toUpperCase()}: ${text}`);
    });

    // Listen for page errors
    page.on('pageerror', error => {
      console.error('❌ Page Error:', error.message);
    });

    // Listen for failed requests
    page.on('requestfailed', request => {
      console.error('❌ Request Failed:', request.url(), request.failure().errorText);
    });

    console.log('🔗 Navigating to http://localhost:5174/');
    await page.goto('http://localhost:5174/', {
      waitUntil: 'networkidle0',
      timeout: 10000
    });

    // Wait a moment for React to render
    await page.waitForTimeout(2000);

    // Check what's in the DOM
    const content = await page.evaluate(() => {
      const root = document.querySelector('#root');
      return {
        hasRoot: !!root,
        rootContent: root ? root.innerHTML : 'NO ROOT ELEMENT',
        rootChildrenCount: root ? root.children.length : 0,
        bodyContent: document.body.innerHTML.substring(0, 500),
        title: document.title,
        hasReactDevTools: !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__
      };
    });

    console.log('🔍 DOM Analysis:');
    console.log('  - Has #root element:', content.hasRoot);
    console.log('  - Root children count:', content.rootChildrenCount);
    console.log('  - Page title:', content.title);
    console.log('  - React DevTools available:', content.hasReactDevTools);

    if (content.rootContent && content.rootContent !== 'NO ROOT ELEMENT') {
      console.log('  - Root content preview:', content.rootContent.substring(0, 200) + '...');
    } else {
      console.log('  - ❌ ROOT IS EMPTY OR MISSING');
      console.log('  - Body content:', content.bodyContent);
    }

    // Test different routes
    const routesToTest = ['/', '/test', '/dashboard', '/projects'];

    for (const route of routesToTest) {
      console.log(`\n🧪 Testing route: ${route}`);
      await page.goto(`http://localhost:5174${route}`, {
        waitUntil: 'networkidle0',
        timeout: 5000
      });

      await page.waitForTimeout(1000);

      const routeContent = await page.evaluate(() => {
        const root = document.querySelector('#root');
        return {
          hasContent: root && root.children.length > 0,
          textContent: root ? root.textContent.substring(0, 100) : 'NO CONTENT'
        };
      });

      console.log(`  - Has content: ${routeContent.hasContent}`);
      console.log(`  - Text preview: ${routeContent.textContent}...`);
    }

    console.log('\n✅ Debugging complete. Check the browser window for visual inspection.');
    console.log('Press Ctrl+C when done inspecting...');

    // Keep browser open for manual inspection
    await new Promise(resolve => {
      process.on('SIGINT', resolve);
    });

  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
try {
  debugBlankPage();
} catch (error) {
  console.log('⚠️ Puppeteer not available. Running simple curl test instead...');

  // Fallback to simple HTTP test
  const https = require('https');
  const http = require('http');

  const options = {
    hostname: 'localhost',
    port: 5174,
    path: '/',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`🌐 HTTP Status: ${res.statusCode}`);
    console.log(`🌐 Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('🌐 Response length:', data.length);
      console.log('🌐 Contains #root:', data.includes('id="root"'));
      console.log('🌐 Contains React script:', data.includes('main.tsx'));

      if (data.length < 1000) {
        console.log('🌐 Full response:', data);
      } else {
        console.log('🌐 Response preview:', data.substring(0, 500) + '...');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ HTTP Request Error:', error);
  });

  req.end();
}