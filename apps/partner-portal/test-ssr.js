// Test script to verify SSR function behavior
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { handler } = require('./netlify/functions/ssr.js');

async function testSSR() {
  console.log('Testing SSR function...\n');
  
  // Test 1: Regular page request should return HTML
  console.log('Test 1: Regular page request');
  const pageResult = await handler({
    path: '/',
    headers: { 'user-agent': 'Mozilla/5.0' }
  });
  console.log('Status:', pageResult.statusCode);
  console.log('Content-Type:', pageResult.headers['Content-Type']);
  console.log('Body contains HTML:', pageResult.body.includes('<html>'));
  console.log('Body contains root div:', pageResult.body.includes('<div id="root">'));
  console.log('');
  
  // Test 2: JavaScript file request should return 404 (let Netlify handle it)
  console.log('Test 2: JavaScript file request');
  const jsResult = await handler({
    path: '/assets/main-N2i4gUyw.js',
    headers: { 'user-agent': 'Mozilla/5.0' }
  });
  console.log('Status:', jsResult.statusCode);
  console.log('Body:', jsResult.body);
  console.log('');
  
  // Test 3: CSS file request should return 404 (let Netlify handle it)
  console.log('Test 3: CSS file request');
  const cssResult = await handler({
    path: '/assets/main-BMus0RaL.css',
    headers: { 'user-agent': 'Mozilla/5.0' }
  });
  console.log('Status:', cssResult.statusCode);
  console.log('Body:', cssResult.body);
  console.log('');
  
  // Test 4: Dashboard route should return HTML
  console.log('Test 4: Dashboard route');
  const dashboardResult = await handler({
    path: '/dashboard',
    headers: { 'user-agent': 'Mozilla/5.0' }
  });
  console.log('Status:', dashboardResult.statusCode);
  console.log('Content-Type:', dashboardResult.headers['Content-Type']);
  console.log('Body contains dashboard meta:', dashboardResult.body.includes('Dashboard - GrubGate'));
  console.log('');
}

testSSR().catch(console.error);