require('dotenv').config();
const http = require('http');

function post(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: process.env.PORT || 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body || '{}') }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function testAuth() {
  console.log('Testing Authentication API...');

  try {
    // 1. Register User
    console.log('\n1. Registering test user...');
    const regRes = await post('/api/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    });
    console.log('Register Response:', regRes);

    // 2. Login User
    console.log('\n2. Logging in test user...');
    const loginRes = await post('/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Login Response:', loginRes);

  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

testAuth();
