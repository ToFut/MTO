#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function checkPOTable() {
  console.log('🔍 CHECKING PURCHASE ORDERS TABLE STRUCTURE\n');

  try {
    // Try to get one record to see the structure
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Available columns in purchase_orders:');
      Object.keys(data[0]).forEach(key => {
        console.log(`   • ${key}`);
      });
    } else {
      console.log('📝 Table exists but is empty');
      
      // Try inserting without created_by to see the error
      const { error: insertError } = await supabase
        .from('purchase_orders')
        .insert({
          po_number: 'TEST-COLUMNS',
          brand_id: 'test',
          factory_id: 'test',
          status: 'assigned',
          total_mtos: 0,
          source_format: 'MTO'
        })
        .select();
        
      if (insertError) {
        console.log('❌ Insert error (shows required columns):', insertError.message);
      }
    }

  } catch (error) {
    console.error('❌ Failed to check table:', error);
  }
}

checkPOTable().catch(console.error);