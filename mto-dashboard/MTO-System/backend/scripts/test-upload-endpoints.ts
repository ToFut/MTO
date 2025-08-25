#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function testMTOCreation() {
  console.log('🧪 TESTING DIRECT MTO CREATION\n');

  try {
    // Get brand and factory
    const { data: companies } = await supabase.from('companies').select('*');
    const brand = companies?.find(c => c.type === 'brand');
    const factory = companies?.find(c => c.type === 'factory');

    if (!brand || !factory) {
      console.log('❌ Missing brand or factory');
      return;
    }

    console.log(`✅ Brand: ${brand.name} (${brand.id})`);
    console.log(`✅ Factory: ${factory.name} (${factory.id})`);

    // Test 1: Create a simple Purchase Order
    console.log('\n📦 Testing Purchase Order creation...');
    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .insert({
        po_number: `TEST-PO-${Date.now()}`,
        brand_id: brand.id,
        factory_id: factory.id,
        status: 'assigned',
        total_mtos: 2
      })
      .select()
      .single();

    if (poError) {
      console.log('❌ PO creation failed:', poError.message);
      return;
    }
    console.log(`✅ PO created: ${po.po_number}`);

    // Test 2: Create a workspace
    console.log('\n🏭 Testing Workspace creation...');
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .insert({
        name: `Test Workspace ${Date.now()}`,
        brand_id: brand.id,
        factory_id: factory.id,
        po_id: po.id,
        production_category: 'monthly',
        total_mtos: 2
      })
      .select()
      .single();

    if (wsError) {
      console.log('❌ Workspace creation failed:', wsError.message);
      return;
    }
    console.log(`✅ Workspace created: ${workspace.name}`);

    // Test 3: Create test MTOs directly
    console.log('\n📋 Testing MTO creation...');
    const testMTOs = [
      {
        workspace_id: workspace.id,
        po_id: po.id,
        brand_id: brand.id,
        factory_id: factory.id,
        internal_id: `TEST-${Date.now()}-1`,
        display_name: 'Test Custom Tote Bag - Large',
        reference_number: 'test-ref-001',
        quantity: 1,
        status: 'pending',
        production_category: 'monthly',
        excel_data: {
          sales_order: 'SO-TEST-001',
          customization: 'TEST PATCH'
        },
        spots_data: [
          { position: 1, sku: 'PATCH-001', description: 'Test Patch 1' },
          { position: 2, sku: 'PATCH-002', description: 'Test Patch 2' }
        ]
      },
      {
        workspace_id: workspace.id,
        po_id: po.id,
        brand_id: brand.id,
        factory_id: factory.id,
        internal_id: `TEST-${Date.now()}-2`,
        display_name: 'Test Custom Tote Bag - Medium',
        reference_number: 'test-ref-002',
        quantity: 2,
        status: 'pending',
        production_category: 'monthly',
        excel_data: {
          sales_order: 'SO-TEST-002',
          customization: 'CUSTOM TEXT'
        },
        spots_data: [
          { position: 1, sku: 'PATCH-003', description: 'Test Patch 3' }
        ]
      }
    ];

    const { data: mtos, error: mtoError } = await supabase
      .from('mtos')
      .insert(testMTOs)
      .select();

    if (mtoError) {
      console.log('❌ MTO creation failed:', mtoError.message);
      console.log('Error details:', mtoError);
      return;
    }

    console.log(`✅ Created ${mtos?.length} MTOs`);

    // Test 4: Auto-populate inventory
    console.log('\n📦 Testing Inventory auto-population...');
    const uniqueSKUs = new Set<string>();
    testMTOs.forEach(mto => {
      mto.spots_data.forEach(spot => uniqueSKUs.add(spot.sku));
    });

    for (const sku of uniqueSKUs) {
      const { error: invError } = await supabase
        .from('inventory')
        .insert({
          sku,
          name: `Auto-created ${sku}`,
          category: 'patch',
          current_stock: 100,
          factory_id: factory.id
        });

      if (invError && !invError.message.includes('duplicate')) {
        console.log(`⚠️ Inventory creation warning for ${sku}:`, invError.message);
      }
    }
    console.log(`✅ Created inventory for ${uniqueSKUs.size} SKUs`);

    // Test 5: Create barcodes
    console.log('\n📊 Testing Barcode creation...');
    const barcodes = [];
    for (const mto of mtos || []) {
      barcodes.push({
        mto_id: mto.id,
        type: 'line',
        value: `TEST-BARCODE-${mto.internal_id}`
      });
    }

    if (barcodes.length > 0) {
      const { error: barcodeError } = await supabase
        .from('barcodes')
        .insert(barcodes);

      if (barcodeError) {
        console.log('⚠️ Barcode creation warning:', barcodeError.message);
      } else {
        console.log(`✅ Created ${barcodes.length} barcodes`);
      }
    }

    // Final verification
    console.log('\n🔍 FINAL VERIFICATION:');
    const { count: finalMTOCount } = await supabase
      .from('mtos')
      .select('*', { count: 'exact', head: true });

    const { count: finalPOCount } = await supabase
      .from('purchase_orders')
      .select('*', { count: 'exact', head: true });

    const { count: finalWSCount } = await supabase
      .from('workspaces')
      .select('*', { count: 'exact', head: true });

    const { count: finalInvCount } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true });

    console.log(`   📦 Purchase Orders: ${finalPOCount}`);
    console.log(`   🏭 Workspaces: ${finalWSCount}`);
    console.log(`   📋 MTOs: ${finalMTOCount}`);
    console.log(`   📦 Inventory Items: ${finalInvCount}`);

    if (finalMTOCount && finalMTOCount > 0) {
      console.log('\n🎯 SUCCESS! Database can now store MTOs!');
      console.log('   The issue must be in the upload parsing logic.');
    } else {
      console.log('\n❌ FAILED! MTOs still not being created.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMTOCreation().catch(console.error);