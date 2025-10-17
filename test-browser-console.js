#!/usr/bin/env node

/**
 * Test script to check what the browser would see
 */

import puppeteer from 'puppeteer';

async function testBrowserConsole() {
  let browser = null;
  try {
    console.log('🌐 Launching browser to test projects page...');

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
      console.log(`[BROWSER ${type.toUpperCase()}]:`, text);
    });

    // Listen for errors
    page.on('error', error => {
      console.error('[BROWSER ERROR]:', error.message);
    });

    page.on('pageerror', error => {
      console.error('[BROWSER PAGE ERROR]:', error.message);
    });

    console.log('📱 Navigating to projects page...');

    // Wait longer for the page to load completely
    await page.goto('http://localhost:5173/projects', {
      waitUntil: 'networkidle2',
      timeout: 15000
    });

    // Wait for the page to render
    await page.waitForTimeout(3000);

    // Check page content
    const title = await page.title();
    console.log('📄 Page title:', title);

    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('📝 Page content length:', bodyText.length);

    if (bodyText.includes('Debug Projects Page')) {
      console.log('✅ Debug page loaded successfully');
    } else if (bodyText.length < 100) {
      console.error('❌ Page appears to be blank or minimal content');
      console.log('Page content preview:', bodyText.substring(0, 200));
    }

    // Check for specific elements
    const debugElements = await page.$$('.debug-info, .text-white, h1');
    console.log('🔍 Found elements:', debugElements.length);

    // Take a screenshot for debugging
    await page.screenshot({ path: 'projects-page-debug.png', fullPage: true });
    console.log('📸 Screenshot saved as projects-page-debug.png');

    // Keep browser open for manual inspection
    console.log('🔍 Browser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Browser test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Only run if puppeteer is available
try {
  testBrowserConsole();
} catch (error) {
  console.log('⚠️ Puppeteer not available, skipping browser test');
  console.log('Manual testing required: Open http://localhost:5173/projects in browser');
  console.log('Check browser console for errors and debug output');
}