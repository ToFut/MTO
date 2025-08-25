import axios from 'axios';

async function testLogin() {
  const backendUrl = 'http://localhost:5010';
  
  console.log('\n🔑 Testing Login Endpoint...\n');
  
  try {
    const response = await axios.post(`${backendUrl}/api/auth/login`, {
      email: 'brand@brand.com',
      password: 'brand123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('\nResponse:', JSON.stringify(response.data, null, 2));
    
    if (response.data.data?.token) {
      console.log('\n🎫 JWT Token received:', response.data.data.token.substring(0, 50) + '...');
    }
    
  } catch (error: any) {
    if (error.response) {
      console.log('❌ Login failed');
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('\n⚠️  This likely means:');
        console.log('1. The database tables haven\'t been created yet');
        console.log('2. The demo user hasn\'t been inserted');
        console.log('\nRun: npm run setup:demo');
        console.log('Then follow the instructions to set up the database');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Cannot connect to backend server');
      console.log('\nMake sure the backend is running:');
      console.log('cd backend && npm run dev');
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }
}

// Check if axios is installed
try {
  require('axios');
  testLogin();
} catch {
  console.log('Installing axios...');
  require('child_process').execSync('npm install axios', { stdio: 'inherit' });
  testLogin();
}