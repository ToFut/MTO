const fs = require('fs');
const { NextGenExcelService } = require('./dist/services/next-gen-excel.service.js');

async function testNextGenParser() {
  try {
    console.log('Testing NextGenExcelService...');
    
    // Read test file
    const fileBuffer = fs.readFileSync('test-mto.xlsx');
    
    // Create service instance
    const service = new NextGenExcelService();
    
    // Test parsing
    const result = await service.parseExcel(fileBuffer);
    
    console.log('NextGen Parser Results:');
    console.log('- Total Rows:', result.totalRows);
    console.log('- Total Columns:', result.totalColumns);
    console.log('- Headers:', result.headers);
    console.log('- Column Mapping:', Object.keys(result.columnMapping));
    console.log('- Errors:', result.errors.length);
    console.log('- Sample MTO:', JSON.stringify(result.data[0], null, 2));
    
  } catch (error) {
    console.error('NextGen Parser Test Failed:', error.message);
  }
}

testNextGenParser();