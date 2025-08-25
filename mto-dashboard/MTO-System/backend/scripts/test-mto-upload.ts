#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testMTOUpload() {
  console.log('🧪 Testing MTO Upload Process\n');

  try {
    // 1. First, ensure we have a factory
    console.log('1️⃣ Creating/Getting Factory...');
    const { data: factory, error: factoryError } = await supabase
      .from('companies')
      .upsert({
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Test Factory',
        type: 'factory',
        code: 'TF001'
      })
      .select()
      .single();

    if (factoryError) throw factoryError;
    console.log('✅ Factory ready:', factory.name);

    // 2. Get the brand
    console.log('\n2️⃣ Getting Brand...');
    const { data: brand } = await supabase
      .from('companies')
      .select()
      .eq('type', 'brand')
      .single();

    if (!brand) throw new Error('No brand found');
    console.log('✅ Brand found:', brand.name);

    // 3. Create brand-factory assignment
    console.log('\n3️⃣ Creating Brand-Factory Assignment...');
    await supabase
      .from('brand_factory_assignments')
      .upsert({
        brand_id: brand.id,
        factory_id: factory.id,
        active: true,
        assignment_type: 'standard'
      });
    console.log('✅ Assignment created');

    // 4. Create a test Purchase Order
    console.log('\n4️⃣ Creating Purchase Order...');
    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .insert({
        po_number: `PO-TEST-${Date.now()}`,
        brand_id: brand.id,
        factory_id: factory.id,
        status: 'assigned',
        production_category: 'monthly',
        order_date: new Date().toISOString().split('T')[0],
        requested_ship_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
      .select()
      .single();

    if (poError) throw poError;
    console.log('✅ PO created:', po.po_number);

    // 5. Create a test Workspace
    console.log('\n5️⃣ Creating Workspace...');
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .insert({
        name: 'Test Monthly Production',
        brand_id: brand.id,
        factory_id: factory.id,
        po_id: po.id,
        production_category: 'monthly',
        status: 'active',
        total_mtos: 3
      })
      .select()
      .single();

    if (wsError) throw wsError;
    console.log('✅ Workspace created:', workspace.name);

    // 6. Create test MTOs (simulating your Excel data)
    console.log('\n6️⃣ Creating MTOs...');
    const testMTOs = [
      {
        workspace_id: workspace.id,
        po_id: po.id,
        brand_id: brand.id,
        factory_id: factory.id,
        internal_id: '38591622',
        po_line_id: '7',
        display_name: 'Custom Icon Tote - 14oz Natural Lined - Large',
        reference_number: 'mekanly047h8a',
        quantity: 1,
        status: 'pending',
        production_category: 'monthly',
        expected_ship_date: '2025-08-20',
        excel_data: {
          shopify_order_date: '08/20/25 02:18 PM',
          sales_order_number: 'SO2594588',
          cpsd: '2025-09-10',
          bag_base_pid: '130559',
          spot1: '138263',
          spot2: '131749',
          spot3: '128678',
          spot4: '129595',
          spot5: '129585',
          spot6: '129568'
        },
        spots_data: [
          { position: 1, sku: '138263', patch_ref: '10019', description: 'Custom Icon Tote Name Patch - Green Script' },
          { position: 2, sku: '131749', patch_ref: 'gargy', description: 'Matcha Tote Patch' },
          { position: 3, sku: '128678', patch_ref: '136', description: 'Martini Tote Patch' },
          { position: 4, sku: '129595', patch_ref: '15', description: 'Libra Tote Patch' },
          { position: 5, sku: '129585', patch_ref: '98', description: 'Sunshine Tote Patch' },
          { position: 6, sku: '129568', patch_ref: '88', description: 'Books Tote Patch' }
        ]
      },
      {
        workspace_id: workspace.id,
        po_id: po.id,
        brand_id: brand.id,
        factory_id: factory.id,
        internal_id: '38403699',
        po_line_id: '1',
        display_name: 'Merino Wool Custom Throw - Pink/Cream',
        reference_number: '89557-Pink-Throw',
        quantity: 1,
        status: 'pending',
        production_category: 'monthly',
        expected_ship_date: '2025-08-21',
        excel_data: {
          sales_order_number: 'SO2583103',
          customization_text: 'Krulisky',
          product_size: 'Throw',
          product_color: 'Pink',
          packaging_code: 'Care+Logo Labels+CDBBPLY56.1',
          hts_code: '6301.20.0010',
          po_purchase_price: 54.25,
          po_ext_fob: 54.25
        }
      },
      {
        workspace_id: workspace.id,
        po_id: po.id,
        brand_id: brand.id,
        factory_id: factory.id,
        internal_id: '38575818',
        po_line_id: '1',
        display_name: 'Alpha Initial Custom Tote - Medium Olive/Red',
        reference_number: '90480-Green-Medium-Base',
        quantity: 1,
        status: 'pending',
        production_category: 'daily', // This one is urgent/daily
        priority: 'urgent',
        expected_ship_date: '2025-08-31',
        excel_data: {
          sales_order_number: 'SO2593681',
          customization_text: 'KM',
          vendor_mto_base_color: 'GREEN',
          vendor_mto_letter_color: 'Red',
          item_cost: 28.7,
          po_cost: 28.7,
          ext_po_cost: 28.70,
          hts_code: '4202.12.4000'
        }
      }
    ];

    const { data: mtos, error: mtoError } = await supabase
      .from('mtos')
      .insert(testMTOs)
      .select();

    if (mtoError) throw mtoError;
    console.log(`✅ Created ${mtos?.length} MTOs`);

    // 7. Auto-populate inventory from MTOs
    console.log('\n7️⃣ Auto-populating Inventory...');
    const inventoryItems = new Set<string>();
    testMTOs.forEach(mto => {
      if (mto.spots_data) {
        mto.spots_data.forEach(spot => inventoryItems.add(spot.sku));
      }
    });

    for (const sku of inventoryItems) {
      await supabase
        .from('inventory')
        .upsert({
          sku,
          name: `Patch ${sku}`,
          category: 'patch',
          current_stock: 1000,
          factory_id: factory.id
        });
    }
    console.log(`✅ Created ${inventoryItems.size} inventory items`);

    // 8. Final verification
    console.log('\n8️⃣ Verification...');
    const { count: finalMTOCount } = await supabase
      .from('mtos')
      .select('*', { count: 'exact', head: true });

    const { count: finalPOCount } = await supabase
      .from('purchase_orders')
      .select('*', { count: 'exact', head: true });

    const { count: finalWSCount } = await supabase
      .from('workspaces')
      .select('*', { count: 'exact', head: true });

    console.log('\n📊 Final Database State:');
    console.log(`   - Purchase Orders: ${finalPOCount}`);
    console.log(`   - Workspaces: ${finalWSCount}`);
    console.log(`   - MTOs: ${finalMTOCount}`);
    console.log(`   - Inventory Items: ${inventoryItems.size}`);

    console.log('\n✅ TEST SUCCESSFUL! The database can accept MTO uploads.');
    console.log('\n💡 The issue with the frontend upload might be:');
    console.log('   1. Missing factory assignment in the upload form');
    console.log('   2. Excel parsing not matching expected format');
    console.log('   3. API endpoint not properly connected');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testMTOUpload().catch(console.error);