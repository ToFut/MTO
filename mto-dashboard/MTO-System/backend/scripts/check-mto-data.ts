#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  console.log('🔍 Checking database for MTOs and related data...\n');

  try {
    // 1. Check MTOs table
    console.log('📋 Checking MTOs table:');
    const { data: mtos, error: mtoError, count: mtoCount } = await supabase
      .from('mtos')
      .select('*', { count: 'exact' })
      .limit(5)
      .order('created_at', { ascending: false });

    if (mtoError) {
      console.error('Error fetching MTOs:', mtoError.message);
    } else {
      console.log(`Total MTOs in database: ${mtoCount}`);
      if (mtos && mtos.length > 0) {
        console.log('\nLatest 5 MTOs:');
        mtos.forEach((mto, index) => {
          console.log(`${index + 1}. ID: ${mto.internal_id || mto.id}`);
          console.log(`   Display Name: ${mto.display_name}`);
          console.log(`   Reference: ${mto.reference_number}`);
          console.log(`   Status: ${mto.status}`);
          console.log(`   Created: ${mto.created_at}`);
          console.log(`   Spots Data: ${mto.spots_data ? JSON.stringify(mto.spots_data).substring(0, 100) : 'None'}`);
          console.log('   ---');
        });
      } else {
        console.log('No MTOs found in database');
      }
    }

    // 2. Check Purchase Orders table
    console.log('\n📦 Checking Purchase Orders table:');
    const { data: pos, error: poError, count: poCount } = await supabase
      .from('purchase_orders')
      .select('*', { count: 'exact' })
      .limit(5)
      .order('created_at', { ascending: false });

    if (poError) {
      console.error('Error fetching POs:', poError.message);
    } else {
      console.log(`Total Purchase Orders: ${poCount}`);
      if (pos && pos.length > 0) {
        console.log('\nLatest 5 Purchase Orders:');
        pos.forEach((po, index) => {
          console.log(`${index + 1}. PO Number: ${po.po_number}`);
          console.log(`   Status: ${po.status}`);
          console.log(`   Total MTOs: ${po.total_mtos}`);
          console.log(`   Created: ${po.created_at}`);
          console.log('   ---');
        });
      } else {
        console.log('No Purchase Orders found');
      }
    }

    // 3. Check Inventory table
    console.log('\n📦 Checking Inventory table:');
    const { data: inventory, error: invError, count: invCount } = await supabase
      .from('inventory')
      .select('*', { count: 'exact' })
      .limit(5)
      .order('created_at', { ascending: false });

    if (invError) {
      console.error('Error fetching inventory:', invError.message);
    } else {
      console.log(`Total Inventory Items: ${invCount}`);
      if (inventory && inventory.length > 0) {
        console.log('\nLatest 5 Inventory Items:');
        inventory.forEach((item, index) => {
          console.log(`${index + 1}. SKU: ${item.sku}`);
          console.log(`   Name: ${item.name}`);
          console.log(`   Stock: ${item.current_stock}`);
          console.log('   ---');
        });
      }
    }

    // 4. Check Vocabulary Mappings
    console.log('\n🔤 Checking Vocabulary Mappings:');
    const { data: vocab, error: vocabError, count: vocabCount } = await supabase
      .from('vocabulary_mappings')
      .select('*', { count: 'exact' })
      .limit(5);

    if (vocabError) {
      console.error('Error fetching vocabulary mappings:', vocabError.message);
    } else {
      console.log(`Total Vocabulary Mappings: ${vocabCount || 0}`);
    }

    // 5. Check Barcodes
    console.log('\n📊 Checking Barcodes:');
    const { data: barcodes, error: barcodeError, count: barcodeCount } = await supabase
      .from('barcodes')
      .select('*', { count: 'exact' })
      .limit(5);

    if (barcodeError) {
      console.error('Error fetching barcodes:', barcodeError.message);
    } else {
      console.log(`Total Barcodes: ${barcodeCount || 0}`);
    }

    // 6. Check for recent uploads (last 24 hours)
    console.log('\n📅 Recent Upload Activity (last 24 hours):');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: recentMtos, count: recentCount } = await supabase
      .from('mtos')
      .select('*', { count: 'exact' })
      .gte('created_at', yesterday.toISOString());

    console.log(`MTOs created in last 24 hours: ${recentCount || 0}`);

    // 7. Check table structure
    console.log('\n🏗️ Checking if required columns exist in MTOs table:');
    const { data: sampleMto } = await supabase
      .from('mtos')
      .select('*')
      .limit(1)
      .single();

    if (sampleMto) {
      const columns = Object.keys(sampleMto);
      const requiredColumns = ['spots_data', 'po_customer', 'hts_code', 'fob_cost', 'ext_fob'];
      console.log('Available columns:', columns.join(', '));
      
      requiredColumns.forEach(col => {
        if (columns.includes(col)) {
          console.log(`✅ ${col} column exists`);
        } else {
          console.log(`❌ ${col} column missing - may need to run migration`);
        }
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }

  console.log('\n✅ Database check complete');
}

// Run the check
checkDatabase().catch(console.error);