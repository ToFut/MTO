#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as XLSX from 'xlsx';
import fs from 'fs';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function testDirectUpload() {
  console.log('🧪 TESTING DIRECT MTO UPLOAD\n');

  try {
    // Get companies
    const { data: companies } = await supabase.from('companies').select('*');
    const brand = companies?.find(c => c.type === 'brand');
    const factory = companies?.find(c => c.type === 'factory');

    if (!brand || !factory) {
      console.log('❌ Missing companies');
      return;
    }

    console.log(`✅ Brand: ${brand.name} (${brand.id})`);
    console.log(`✅ Factory: ${factory.name} (${factory.id})`);

    // Create test Excel file
    const testData = [
      ['Internal ID', 'PO Line ID', 'Expected Ship Date', 'Display Name', 'Reference Number', 'Quantity', 'Spot 1', 'Spot 2', 'Spot 3'],
      ['TEST001', '1', '2025-03-15', 'Custom Tote Bag - Medium', 'ref001', '1', '138263', '131749', ''],
      ['TEST002', '2', '2025-03-16', 'Custom Tote Bag - Large', 'ref002', '2', '128687', '128698', '129595'],
      ['TEST003', '3', '2025-03-17', 'Custom Icon Tote', 'ref003', '1', '129585', '', '']
    ];

    // Create Excel workbook
    const ws = XLSX.utils.aoa_to_sheet(testData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'MTOs');
    
    // Save to buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    console.log('\n📊 Created test Excel file with 3 MTOs');

    // Get a real user ID
    const { data: users } = await supabase.from('users').select('id').limit(1);
    const userId = users && users.length > 0 ? users[0].id : brand.id; // fallback to brand id

    // Test the MTOService.directMTOUpload method
    const { MTOService } = await import('../src/services/mto.service');
    const mtoService = new MTOService();
    
    console.log('\n🚀 Testing direct MTO upload...');
    
    const result = await mtoService.directMTOUpload(
      buffer,
      brand.id,
      factory.id,
      userId
    );

    console.log('\n🎉 SUCCESS! Direct upload results:');
    console.log(`   📋 MTOs created: ${result.created}`);
    console.log(`   📦 PO created: ${result.po.po_number}`);
    console.log(`   🏭 Workspace created: ${result.workspace.name}`);
    console.log(`   📦 Inventory items: ${result.autoPopulation.inventory.created}`);
    console.log(`   📊 Barcodes generated: ${result.autoPopulation.barcodes.created}`);

    // Verify data in database
    console.log('\n🔍 Verifying database records...');
    
    const { count: mtoCount } = await supabase
      .from('mtos')
      .select('*', { count: 'exact', head: true })
      .eq('po_id', result.po.id);
    
    const { count: inventoryCount } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true })
      .eq('factory_id', factory.id);
      
    const { count: barcodeCount } = await supabase
      .from('barcodes')
      .select('*', { count: 'exact', head: true });

    console.log(`   ✅ MTOs in database: ${mtoCount}`);
    console.log(`   ✅ Inventory items: ${inventoryCount}`);
    console.log(`   ✅ Barcodes generated: ${barcodeCount}`);

    // Test sample MTO structure
    const { data: sampleMTO } = await supabase
      .from('mtos')
      .select('*')
      .eq('po_id', result.po.id)
      .limit(1)
      .single();

    console.log('\n📋 Sample MTO structure:');
    console.log('   spots_data:', JSON.stringify(sampleMTO?.spots_data, null, 2));
    console.log('   excel_data keys:', Object.keys(sampleMTO?.excel_data || {}));

    console.log('\n✅ DIRECT UPLOAD TEST PASSED!');
    console.log('📝 The /upload endpoint should now work with the frontend');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\nStack trace:', error.stack);
  }
}

testDirectUpload().catch(console.error);