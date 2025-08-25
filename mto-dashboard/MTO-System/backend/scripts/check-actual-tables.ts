#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function checkActualTables() {
  console.log('🔍 CHECKING WHAT TABLES ACTUALLY EXIST\n');

  try {
    // Get all tables in public schema using direct SQL query
    const { data: tableList, error } = await supabase
      .rpc('get_tables_list');

    if (error) {
      // Fallback method - try to access each table individually
      console.log('Using fallback method to check tables...\n');
      
      const expectedTables = [
        'companies', 'users', 'purchase_orders', 'mtos', 'workspaces',
        'inventory', 'vocabulary_mappings', 'barcodes', 'defects',
        'brand_factory_assignments', 'production_lines', 'production_schedule',
        'mto_status_history', 'production_history', 'inventory_allocations'
      ];

      console.log('📊 TABLE EXISTENCE CHECK:\n');
      
      const existingTables = [];
      const missingTables = [];

      for (const tableName of expectedTables) {
        try {
          const { data, error: tableError } = await supabase
            .from(tableName)
            .select('*')
            .limit(0);

          if (!tableError) {
            console.log(`✅ ${tableName} - EXISTS`);
            existingTables.push(tableName);
          } else {
            console.log(`❌ ${tableName} - MISSING (${tableError.message})`);
            missingTables.push(tableName);
          }
        } catch (e) {
          console.log(`❌ ${tableName} - MISSING (not accessible)`);
          missingTables.push(tableName);
        }
      }

      console.log(`\n📈 SUMMARY:`);
      console.log(`   ✅ Existing: ${existingTables.length} tables`);
      console.log(`   ❌ Missing: ${missingTables.length} tables`);

      if (missingTables.length > 0) {
        console.log(`\n🚨 MISSING TABLES:`);
        missingTables.forEach(table => {
          console.log(`   - ${table}`);
        });

        console.log(`\n💡 SOLUTION:`);
        console.log(`   Run the complete database setup script to create missing tables`);
      }

      // Check table structures for existing tables
      for (const tableName of existingTables.slice(0, 3)) {
        try {
          const { data: sample } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

          if (sample && sample.length > 0) {
            const columns = Object.keys(sample[0]);
            console.log(`\n📋 ${tableName} columns: ${columns.slice(0, 5).join(', ')}${columns.length > 5 ? '...' : ''}`);
          }
        } catch (e) {
          // Skip column check
        }
      }

    } else {
      console.log('✅ Got table list:', tableList);
    }

  } catch (error) {
    console.error('❌ Error checking tables:', error);
  }
}

checkActualTables().catch(console.error);