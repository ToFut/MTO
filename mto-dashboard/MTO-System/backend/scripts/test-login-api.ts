import axios from 'axios';

async function testLogin() {
  // Try different possible backend URLs
  const possibleUrls = [
    'http://localhost:5010',  // From .env PORT
    'http://localhost:4567',  // From CLAUDE.md docs
    'http://localhost:5000'   // Common default
  ];

  console.log('🧪 Testing login API...\n');

  for (const url of possibleUrls) {
    console.log(`Trying ${url}...`);
    
    try {
      // First test if server is running
      const healthResponse = await axios.get(`${url}/api/health`, {
        timeout: 3000
      });
      
      console.log(`✅ Server is running at ${url}`);
      
      // Now test login
      const loginResponse = await axios.post(`${url}/api/auth/login`, {
        email: 'brand@brand.com',
        password: 'brand123'
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      
      console.log('🎉 LOGIN SUCCESSFUL!');
      console.log('\nResponse data:');
      console.log(JSON.stringify(loginResponse.data, null, 2));
      
      if (loginResponse.data.data?.token) {
        console.log('\n🎫 JWT Token:', loginResponse.data.data.token.substring(0, 50) + '...');
        console.log('👤 User Role:', loginResponse.data.data.user.role);
        console.log('📧 User Email:', loginResponse.data.data.user.email);
      }
      
      console.log('\n✨ Login working correctly! You can now use:');
      console.log('   Email: brand@brand.com');
      console.log('   Password: brand123');
      
      return; // Success, exit
      
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ No server running at ${url}`);
      } else if (error.response) {
        console.log(`❌ Server error at ${url}:`, error.response.status, error.response.data);
        
        if (error.response.status === 401) {
          console.log('   This means the user/password is wrong or user not found');
        }
      } else {
        console.log(`❌ Error testing ${url}:`, error.message);
      }
    }
    
    console.log('');
  }
  
  console.log('🚨 No backend server found running!');
  console.log('\nTo start the backend server:');
  console.log('   cd backend && npm run dev');
  console.log('\nThe server should start on one of these ports: 5010, 4567, or 5000');
}

testLogin();