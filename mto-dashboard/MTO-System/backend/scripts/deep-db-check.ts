#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function deepDatabaseCheck() {
  console.log('🔍 DEEP DATABASE CHECK\n');

  try {
    // Check all table row counts
    const tables = [
      'companies', 'users', 'purchase_orders', 'mtos', 'workspaces', 
      'inventory', 'vocabulary_mappings', 'barcodes', 'defects',
      'brand_factory_assignments', 'production_lines', 'production_schedule'
    ];

    console.log('📊 TABLE ROW COUNTS:');
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ ${table}: Error - ${error.message}`);
        } else {
          console.log(`${count === 0 ? '🔴' : '🟢'} ${table}: ${count} records`);
        }
      } catch (e) {
        console.log(`❌ ${table}: Not accessible`);
      }
    }

    // Check companies in detail
    console.log('\n🏢 COMPANIES DETAIL:');
    const { data: companies } = await supabase
      .from('companies')
      .select('*');
    
    if (companies) {
      companies.forEach(company => {
        console.log(`   - ${company.name} (${company.type}) - ID: ${company.id}`);
      });
    }

    // Check users in detail
    console.log('\n👥 USERS DETAIL:');
    const { data: users } = await supabase
      .from('users')
      .select('email, role, company_id');
    
    if (users) {
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.role}) - Company: ${user.company_id}`);
      });
    }

    // Check brand-factory assignments
    console.log('\n🤝 BRAND-FACTORY ASSIGNMENTS:');
    const { data: assignments } = await supabase
      .from('brand_factory_assignments')
      .select(`
        *,
        brand:companies!brand_factory_assignments_brand_id_fkey(name),
        factory:companies!brand_factory_assignments_factory_id_fkey(name)
      `);
    
    if (assignments && assignments.length > 0) {
      assignments.forEach(assignment => {
        console.log(`   - ${assignment.brand?.name} → ${assignment.factory?.name} (${assignment.assignment_type})`);
      });
    } else {
      console.log('   ⚠️ No assignments found - this might be why uploads fail!');
    }

    // Check for any upload attempts
    console.log('\n📤 RECENT UPLOAD ATTEMPTS:');
    const { data: recentMTOs } = await supabase
      .from('mtos')
      .select('internal_id, display_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentMTOs && recentMTOs.length > 0) {
      console.log('   Recent MTOs found:');
      recentMTOs.forEach(mto => {
        console.log(`   - ${mto.internal_id}: ${mto.display_name} (${mto.created_at})`);
      });
    } else {
      console.log('   🔴 No MTOs found - uploads may not be working');
    }

    // Check for any POs
    const { data: pos } = await supabase
      .from('purchase_orders')
      .select('po_number, status, total_mtos, created_at')
      .limit(5);
    
    if (pos && pos.length > 0) {
      console.log('\n📦 PURCHASE ORDERS:');
      pos.forEach(po => {
        console.log(`   - ${po.po_number}: ${po.total_mtos} MTOs (${po.status})`);
      });
    }

    // Test a simple insert to verify permissions
    console.log('\n🧪 TESTING DATABASE WRITE PERMISSIONS:');
    try {
      const testData = {
        item_code: `TEST-${Date.now()}`,
        item_name: 'Test Item',
        category: 'test',
        quantity_in_stock: 0
      };

      const { data: inserted, error: insertError } = await supabase
        .from('inventory')
        .insert(testData)
        .select();

      if (insertError) {
        console.log(`   ❌ Cannot write to database: ${insertError.message}`);
      } else {
        console.log(`   ✅ Database write test successful`);
        
        // Clean up test data
        await supabase
          .from('inventory')
          .delete()
          .eq('item_code', testData.item_code);
      }
    } catch (e) {
      console.log(`   ❌ Database write test failed: ${e}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 ANALYSIS:');
    
    const totalRecords = await Promise.all(
      tables.map(async (table) => {
        const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
        return count || 0;
      })
    );
    
    const totalData = totalRecords.reduce((sum, count) => sum + count, 0);
    
    if (totalData === 3) { // Only companies + user
      console.log('📊 Status: EMPTY DATABASE - Ready for first upload');
    } else if (totalData > 3) {
      console.log(`📊 Status: HAS DATA - ${totalData} total records`);
    }

  } catch (error) {
    console.error('❌ Deep check failed:', error);
  }
}

deepDatabaseCheck().catch(console.error);