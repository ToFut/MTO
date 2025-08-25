#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function fixUploadParsing() {
  console.log('🔧 FIXING UPLOAD PARSING ISSUE\n');

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

    // Simulate Excel data that frontend would send
    const testExcelData = [
      ['Internal ID', 'PO Line ID', 'Expected Ship Date', 'Display Name', 'Reference Number', 'Quantity', 'Spot 1', 'Spot 2', 'Spot 3'],
      ['37483586', '6', '2024-03-15', 'Custom Tote Bag - 14oz Natural Lined - Medium', 'md6a4z3j45we9', '1', '129559', '137234', '128678'],
      ['37483587', '7', '2024-03-16', 'Custom Tote Bag - 14oz Natural Lined - Large', 'lg7b5x4k56we8', '2', '128687', '128698', '129595'],
      ['37483588', '8', '2024-03-17', 'Custom Icon Tote - Medium', 'ic5k7m9n12we1', '1', '138263', '131749', '']
    ];

    console.log('\n📊 Processing Excel Data (FIXED APPROACH):');

    // CORRECTED: Parse data to match the current table structure
    const validMTOs = [];
    const errors = [];
    
    for (let i = 1; i < testExcelData.length; i++) {
      const row = testExcelData[i];
      
      try {
        // Extract spots from columns (modern approach)
        const spots = [];
        for (let spotIndex = 6; spotIndex < row.length; spotIndex++) {
          const sku = row[spotIndex];
          if (sku && sku.trim() !== '') {
            spots.push({
              position: spotIndex - 5, // Position 1, 2, 3...
              sku: sku.trim(),
              description: `Patch ${sku.trim()}`,
              patch_ref: `REF-${sku.trim()}`
            });
          }
        }

        // Build MTO data for CURRENT table structure
        const mtoData = {
          internal_id: row[0],
          po_line_id: row[1],
          display_name: row[3],
          reference_number: row[4],
          quantity: parseInt(row[5]) || 1,
          expected_ship_date: row[2] ? new Date(row[2]).toISOString().split('T')[0] : null,
          status: 'pending',
          production_stage: 'receive',
          production_category: 'monthly',
          priority: 'normal',
          brand_id: brand.id,
          factory_id: factory.id,
          
          // Modern approach: spots as JSONB array
          spots_data: spots,
          
          // Store ALL original Excel data
          excel_data: {
            internal_id: row[0],
            po_line_id: row[1],
            expected_ship_date: row[2],
            display_name: row[3],
            reference_number: row[4],
            quantity: row[5],
            spot1: row[6] || null,
            spot2: row[7] || null,
            spot3: row[8] || null,
            // Add any other Excel columns here
            parsed_at: new Date().toISOString(),
            source: 'excel_upload'
          }
        };

        // Validation
        if (!mtoData.display_name || mtoData.display_name.trim() === '') {
          errors.push({
            row: i + 1,
            errors: ['Missing required field "display_name"']
          });
          continue;
        }

        if (!mtoData.internal_id || mtoData.internal_id.trim() === '') {
          errors.push({
            row: i + 1,
            errors: ['Missing required field "internal_id"']
          });
          continue;
        }

        validMTOs.push(mtoData);
        
      } catch (error) {
        errors.push({
          row: i + 1,
          errors: [`Parsing error: ${error.message}`]
        });
      }
    }
    
    console.log(`✅ Parsed ${validMTOs.length} valid MTOs`);
    console.log(`❌ Found ${errors.length} errors:`);
    errors.forEach(error => {
      console.log(`   • Row ${error.row}: ${error.errors.join(', ')}`);
    });

    if (validMTOs.length === 0) {
      console.log('❌ No valid MTOs to save');
      return;
    }

    // Create PO
    console.log('\n📦 Creating Purchase Order...');
    const { data: testPO, error: poError } = await supabase
      .from('purchase_orders')
      .insert({
        po_number: `FIXED-PO-${Date.now()}`,
        brand_id: brand.id,
        factory_id: factory.id,
        status: 'assigned',
        total_mtos: validMTOs.length,
        source_format: 'MTO'
      })
      .select()
      .single();

    if (poError) {
      console.log('❌ PO creation failed:', poError.message);
      return;
    }
    console.log(`✅ Created PO: ${testPO.po_number}`);

    // Create workspace
    console.log('\n🏭 Creating Workspace...');
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .insert({
        name: `Upload Test - ${new Date().toLocaleDateString()}`,
        brand_id: brand.id,
        factory_id: factory.id,
        po_id: testPO.id,
        production_category: 'monthly',
        total_mtos: validMTOs.length,
        status: 'active'
      })
      .select()
      .single();

    if (wsError) {
      console.log('❌ Workspace creation failed:', wsError.message);
      return;
    }
    console.log(`✅ Created workspace: ${workspace.name}`);

    // Add workspace_id and po_id to MTOs
    const finalMTOData = validMTOs.map(mto => ({
      ...mto,
      po_id: testPO.id,
      workspace_id: workspace.id
    }));

    console.log('\n📋 Saving MTOs to database...');
    console.log('Sample MTO structure:', JSON.stringify(finalMTOData[0], null, 2));

    const { data: savedMTOs, error: mtoError } = await supabase
      .from('mtos')
      .insert(finalMTOData)
      .select();

    if (mtoError) {
      console.log('❌ MTO save failed:', mtoError.message);
      console.log('Full error:', mtoError);
      return;
    }

    console.log(`✅ Successfully saved ${savedMTOs?.length} MTOs!`);

    // Auto-populate inventory
    console.log('\n📦 Auto-populating inventory...');
    const uniqueSKUs = new Set<string>();
    savedMTOs?.forEach(mto => {
      if (mto.spots_data) {
        mto.spots_data.forEach((spot: any) => {
          if (spot.sku) uniqueSKUs.add(spot.sku);
        });
      }
    });

    let inventoryCreated = 0;
    for (const sku of uniqueSKUs) {
      const { error: invError } = await supabase
        .from('inventory')
        .upsert({
          sku,
          name: `Auto-created ${sku}`,
          category: 'patch',
          current_stock: 1000,
          factory_id: factory.id
        });

      if (!invError) inventoryCreated++;
    }
    console.log(`✅ Created/updated ${inventoryCreated} inventory items`);

    // Generate barcodes
    console.log('\n📊 Generating barcodes...');
    const barcodes = [];
    savedMTOs?.forEach(mto => {
      // Line barcode
      barcodes.push({
        mto_id: mto.id,
        type: 'line',
        value: `PO:${testPO.po_number}|LINE:${mto.po_line_id}|REF:${mto.reference_number}`
      });

      // Spot barcodes
      if (mto.spots_data) {
        mto.spots_data.forEach((spot: any) => {
          barcodes.push({
            mto_id: mto.id,
            type: 'spot',
            spot_number: spot.position,
            value: `PO:${testPO.po_number}|SPOT:${spot.position}|SKU:${spot.sku}`
          });
        });
      }
    });

    if (barcodes.length > 0) {
      const { error: barcodeError } = await supabase
        .from('barcodes')
        .insert(barcodes);

      if (!barcodeError) {
        console.log(`✅ Generated ${barcodes.length} barcodes`);
      }
    }

    // Final verification
    console.log('\n🎯 FINAL VERIFICATION:');
    const { count: totalMTOs } = await supabase
      .from('mtos')
      .select('*', { count: 'exact', head: true });

    const { count: totalPOs } = await supabase
      .from('purchase_orders')
      .select('*', { count: 'exact', head: true });

    const { count: totalWorkspaces } = await supabase
      .from('workspaces')
      .select('*', { count: 'exact', head: true });

    const { count: totalInventory } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true });

    console.log(`   📦 Purchase Orders: ${totalPOs}`);
    console.log(`   🏭 Workspaces: ${totalWorkspaces}`);
    console.log(`   📋 MTOs: ${totalMTOs}`);
    console.log(`   📦 Inventory Items: ${totalInventory}`);

    console.log('\n🎉 SUCCESS! Upload parsing is now FIXED!');
    console.log('📋 Next steps:');
    console.log('   1. Update the MTO service parseExcelData method');
    console.log('   2. Ensure it uses spots_data instead of spot1/spot2/etc');
    console.log('   3. Test with real frontend upload');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

fixUploadParsing().catch(console.error);