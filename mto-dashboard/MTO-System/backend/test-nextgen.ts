import fs from 'fs';
import { NextGenExcelService } from './src/services/next-gen-excel.service';

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
    console.log('- Column Mapping Keys:', Object.keys(result.columnMapping));
    console.log('- Errors:', result.errors.length);
    
    if (result.data.length > 0) {
      console.log('- Sample MTO keys:', Object.keys(result.data[0]));
      console.log('- Sample display_name:', result.data[0].display_name);
      console.log('- Sample _rawData:', result.data[0]._rawData);
    }
    
  } catch (error: any) {
    console.error('NextGen Parser Test Failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testNextGenParser();