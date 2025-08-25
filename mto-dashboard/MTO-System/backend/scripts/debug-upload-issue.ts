#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { MTOService } from '../src/services/mto.service';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function debugUploadIssue() {
  console.log('🔍 DEBUGGING UPLOAD ISSUE\n');

  try {
    // Get existing data
    const { data: companies } = await supabase.from('companies').select('*');
    const brand = companies?.find(c => c.type === 'brand');
    const factory = companies?.find(c => c.type === 'factory');

    if (!brand || !factory) {
      console.log('❌ Missing companies');
      return;
    }

    console.log(`✅ Brand: ${brand.name} (${brand.id})`);
    console.log(`✅ Factory: ${factory.name} (${factory.id})`);

    // Create test Excel-like data (simulating what frontend sends)
    const testExcelData = [
      ['Internal ID', 'PO Line ID', 'Expected Ship Date', 'Display Name', 'Reference Number', 'Quantity', 'Spot 1', 'Spot 2'],
      ['TEST001', '1', '2025-03-15', 'Custom Tote Bag - Medium', 'ref001', '1', '138263', '131749'],
      ['TEST002', '2', '2025-03-16', 'Custom Tote Bag - Large', 'ref002', '2', '128687', '128698'],
      ['TEST003', '3', '', 'Missing Display Name Tote', 'ref003', '1', '129595', ''], // This should fail
      ['TEST004', '4', 'invalid-date', 'Invalid Date Tote', 'ref004', '1', '129585', '129568'] // This should fail
    ];

    console.log('\n📊 Test Data Preview:');
    console.log('Row 1 (header):', testExcelData[0]);
    console.log('Row 2 (valid):', testExcelData[1]);
    console.log('Row 3 (valid):', testExcelData[2]);
    console.log('Row 4 (missing display_name):', testExcelData[3]);
    console.log('Row 5 (invalid date):', testExcelData[4]);

    // Check what MTOService.parseExcelData would do
    console.log('\n🧪 Testing MTO parsing logic...');
    
    const mtoService = new MTOService();
    
    // Simulate the parseExcelData method
    const validMTOs = [];
    const errors = [];
    
    for (let i = 1; i < testExcelData.length; i++) {
      const row = testExcelData[i];
      
      // Basic validation (simulating the validation that should happen)
      const mto = {
        internal_id: row[0],
        po_line_id: row[1],
        expected_ship_date: row[2],
        display_name: row[3],
        reference_number: row[4],
        quantity: parseInt(row[5]) || 1,
        spot1: row[6],
        spot2: row[7],
        brand_id: brand.id,
        factory_id: factory.id
      };
      
      // Validation logic
      if (!mto.display_name || mto.display_name.trim() === '') {
        errors.push({
          row: i + 1,
          errors: ['Missing required field "display_name"']
        });
        continue;
      }
      
      if (mto.expected_ship_date && mto.expected_ship_date !== '' && isNaN(Date.parse(mto.expected_ship_date))) {
        errors.push({
          row: i + 1,
          errors: ['Invalid date format']
        });
        continue;
      }
      
      validMTOs.push(mto);
    }
    
    console.log(`✅ Parsed ${validMTOs.length} valid MTOs`);
    console.log(`❌ Found ${errors.length} errors:`);
    errors.forEach(error => {
      console.log(`   • Row ${error.row}: ${error.errors.join(', ')}`);
    });

    // This matches what the frontend is showing!
    // Now let's see if these valid MTOs can be saved to database

    console.log('\n💾 Testing Database Save...');
    
    // First, need a PO
    const { data: testPO, error: poError } = await supabase
      .from('purchase_orders')
      .insert({
        po_number: `DEBUG-PO-${Date.now()}`,
        brand_id: brand.id,
        factory_id: factory.id,
        status: 'assigned',
        total_mtos: validMTOs.length
      })
      .select()
      .single();

    if (poError) {
      console.log('❌ PO creation failed:', poError.message);
      return;
    }

    console.log(`✅ Created PO: ${testPO.po_number}`);

    // Now try to save the MTOs
    const mtoInsertData = validMTOs.map(mto => ({
      ...mto,
      po_id: testPO.id,
      status: 'pending',
      production_stage: 'receive',
      spots_data: [
        { position: 1, sku: mto.spot1, description: `Patch ${mto.spot1}` },
        { position: 2, sku: mto.spot2, description: `Patch ${mto.spot2}` }
      ].filter(spot => spot.sku), // Remove empty spots
      excel_data: {
        original_internal_id: mto.internal_id,
        original_po_line_id: mto.po_line_id,
        original_spots: { spot1: mto.spot1, spot2: mto.spot2 }
      }
    }));

    console.log('\n📋 Attempting to insert MTOs...');
    console.log('Sample MTO data:', JSON.stringify(mtoInsertData[0], null, 2));

    const { data: savedMTOs, error: mtoError } = await supabase
      .from('mtos')
      .insert(mtoInsertData)
      .select();

    if (mtoError) {
      console.log('❌ MTO insert failed:', mtoError.message);
      console.log('Full error:', mtoError);
      
      // Try to understand what's wrong
      console.log('\n🔍 Checking table structure...');
      const { data: sampleMTO } = await supabase
        .from('mtos')
        .select('*')
        .limit(1);
      
      if (sampleMTO && sampleMTO.length > 0) {
        console.log('Available columns:', Object.keys(sampleMTO[0]));
      }
      
      return;
    }

    console.log(`✅ Successfully saved ${savedMTOs?.length} MTOs to database!`);

    // Final check
    const { count: totalMTOs } = await supabase
      .from('mtos')
      .select('*', { count: 'exact', head: true });

    console.log(`\n🎯 FINAL RESULT: ${totalMTOs} total MTOs in database`);

    if (savedMTOs && savedMTOs.length > 0) {
      console.log('\n✅ SUCCESS! The database save works.');
      console.log('🔍 The issue must be in the frontend-backend communication');
      console.log('   or in the way the upload endpoint processes the request.');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugUploadIssue().catch(console.error);