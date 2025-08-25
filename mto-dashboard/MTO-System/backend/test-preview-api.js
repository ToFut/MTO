const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function testPreviewAPI() {
  try {
    console.log('Testing MTO Preview API with NextGen parser...');
    
    // Create a test Excel file path (you'll need to put your Excel file here)
    const testFilePath = '/Users/segevbin/Desktop/test.xlsx'; // Replace with actual file
    
    if (!fs.existsSync(testFilePath)) {
      console.log('No test file found at:', testFilePath);
      console.log('Please put your Excel file there and run again');
      return;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('poNumber', 'TEST-PO-001');
    formData.append('factoryId', 'test-factory-id');
    formData.append('brandId', 'test-brand-id');
    
    // Make API request
    const response = await axios.post('http://localhost:5010/api/mtos/preview', formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000
    });
    
    console.log('API Response Status:', response.status);
    console.log('Total Columns Detected:', response.data.data.analysis.totalColumns);
    console.log('Headers Found:', response.data.data.analysis.headers);
    console.log('Sample MTO:', JSON.stringify(response.data.data.mtos[0], null, 2));
    
  } catch (error) {
    console.error('API Test Failed:', error.response?.data || error.message);
  }
}

testPreviewAPI();