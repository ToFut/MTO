#!/usr/bin/env node

import axios from 'axios';
import * as XLSX from 'xlsx';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

async function testUploadWithAuth() {
  console.log('🧪 TESTING UPLOAD WITH AUTHENTICATION\n');

  try {
    // Step 1: Login to get token
    console.log('1️⃣ Logging in to get auth token...');
    const loginResponse = await axios.post('http://localhost:5010/api/auth/login', {
      email: 'test@brand.com',
      password: 'test123'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Got auth token:', token.substring(0, 20) + '...');

    // Step 2: Create test Excel file
    console.log('\n2️⃣ Creating test Excel file...');
    const timestamp = Date.now();
    const testData = [
      ['Internal ID', 'PO Line ID', 'Expected Ship Date', 'Display Name', 'Reference Number', 'Quantity', 'Spot 1', 'Spot 2'],
      [`TEST${timestamp}-1`, '1', '2025-03-15', 'Test Tote Bag - Medium', `ref${timestamp}-1`, '1', '138263', '131749'],
      [`TEST${timestamp}-2`, '2', '2025-03-16', 'Test Tote Bag - Large', `ref${timestamp}-2`, '2', '128687', '128698']
    ];

    const ws = XLSX.utils.aoa_to_sheet(testData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'MTOs');
    
    const filePath = path.join(__dirname, 'test-upload.xlsx');
    XLSX.writeFile(wb, filePath);
    console.log('✅ Created test Excel file');

    // Step 3: Upload file
    console.log('\n3️⃣ Uploading file to /api/mtos/upload...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    const uploadResponse = await axios.post('http://localhost:5010/api/mtos/upload', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Upload successful!');
    console.log('Response:', JSON.stringify(uploadResponse.data, null, 2));

    // Clean up
    fs.unlinkSync(filePath);

    // Step 4: Verify data was created
    if (uploadResponse.data.data) {
      console.log('\n📊 Upload Summary:');
      console.log(`   • MTOs created: ${uploadResponse.data.data.length || uploadResponse.data.created || 0}`);
      console.log(`   • PO created: ${uploadResponse.data.po?.po_number || 'N/A'}`);
      console.log(`   • Workspace: ${uploadResponse.data.workspace?.name || 'N/A'}`);
      console.log(`   • Success: ${uploadResponse.data.success}`);
    }

    console.log('\n✅ UPLOAD TEST PASSED! The endpoint is working correctly.');

  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
    }
  }
}

testUploadWithAuth().catch(console.error);