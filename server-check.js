// Simple script to check if your backend is accessible
// Run this with: node server-check.js

const https = require('https');
const http = require('http');

// Change this to your actual backend URL
const backendUrl = 'https://lms-backend.onrender.com';
const healthEndpoint = '/health';
const url = backendUrl + healthEndpoint;

console.log(`🔍 Checking backend server at: ${url}`);

// Determine if we need to use http or https
const client = url.startsWith('https') ? https : http;

const req = client.get(url, (res) => {
  console.log(`🔄 Status Code: ${res.statusCode}`);
  
  if (res.statusCode !== 200) {
    console.log(`❌ Server responded with error status: ${res.statusCode}`);
    process.exit(1);
  }
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`✅ Server is running and responding!`);
    console.log(`📄 Response: ${data}`);
    process.exit(0);
  });
}).on('error', (err) => {
  console.log(`❌ Error reaching server: ${err.message}`);
  
  if (err.code === 'ENOTFOUND') {
    console.log('🔎 DNS lookup failed. The server domain may not be registered or DNS might not be resolving.');
  } else if (err.code === 'ECONNREFUSED') {
    console.log('🔎 Connection refused. The server may not be running or is blocking connections.');
  } else if (err.code === 'ETIMEDOUT') {
    console.log('🔎 Connection timed out. The server might be overloaded or behind a firewall.');
  }
  
  process.exit(1);
});

// Set a timeout of 10 seconds
req.setTimeout(10000, () => {
  console.log('❌ Request timed out after 10 seconds');
  req.destroy();
  process.exit(1);
}); 