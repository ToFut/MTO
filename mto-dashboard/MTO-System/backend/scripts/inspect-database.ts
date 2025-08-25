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

async function inspectDatabase() {
  console.log('🔍 DATABASE INSPECTION REPORT');
  console.log('=' .repeat(60));
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`📅 Inspection Date: ${new Date().toISOString()}`);
  console.log('=' .repeat(60) + '\n');

  try {
    // Get all tables in the public schema
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');

    if (tablesError) {
      // Try a different approach - check known tables
      console.log('📊 CHECKING FOR EXPECTED TABLES:\n');
      
      const expectedTables = [
        'companies',
        'users', 
        'purchase_orders',
        'mtos',
        'workspaces',
        'inventory',
        'vocabulary_mappings',
        'barcodes',
        'defects',
        'brand_factory_assignments',
        'production_lines',
        'production_schedule'
      ];

      for (const tableName of expectedTables) {
        try {
          const { count, error } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
          
          if (!error) {
            console.log(`✅ Table "${tableName}" exists - ${count || 0} records`);
            
            // Get sample structure
            const { data: sample } = await supabase
              .from(tableName)
              .select('*')
              .limit(1);
            
            if (sample && sample.length > 0) {
              const columns = Object.keys(sample[0]);
              console.log(`   Columns: ${columns.slice(0, 5).join(', ')}${columns.length > 5 ? '...' : ''}`);
            }
          } else {
            console.log(`❌ Table "${tableName}" not found`);
          }
        } catch (e) {
          console.log(`❌ Table "${tableName}" not found`);
        }
      }
    } else if (tables && tables.length > 0) {
      console.log(`📊 FOUND ${tables.length} TABLES IN DATABASE:\n`);
      
      for (const table of tables) {
        const tableName = table.table_name;
        
        // Get row count
        const { count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        console.log(`\n📁 Table: ${tableName}`);
        console.log(`   Records: ${count || 0}`);
        
        // Get table structure
        const { data: columns } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable')
          .eq('table_schema', 'public')
          .eq('table_name', tableName)
          .limit(10);
        
        if (columns && columns.length > 0) {
          console.log(`   Columns (first 10):`);
          columns.forEach(col => {
            console.log(`     - ${col.column_name} (${col.data_type})${col.is_nullable === 'NO' ? ' NOT NULL' : ''}`);
          });
        }
      }
    } else {
      console.log('⚠️  No tables found in database!');
      console.log('\n📝 TO SET UP THE DATABASE:');
      console.log('1. Go to Supabase SQL Editor');
      console.log('2. Run one of these scripts:');
      console.log('   - setup-database-fixed.sql (for complex Excel format)');
      console.log('   - optimized-database-schema.sql (recommended for workspace model)');
    }

    // Check for specific data
    console.log('\n' + '=' .repeat(60));
    console.log('📈 DATA SUMMARY:\n');

    // Check companies
    const { data: companies, count: companyCount } = await supabase
      .from('companies')
      .select('name, type', { count: 'exact' });
    
    if (companies && companies.length > 0) {
      console.log(`🏢 Companies (${companyCount} total):`);
      companies.forEach(c => {
        console.log(`   - ${c.name} (${c.type})`);
      });
    }

    // Check users
    const { data: users, count: userCount } = await supabase
      .from('users')
      .select('email, role', { count: 'exact' });
    
    if (users && users.length > 0) {
      console.log(`\n👥 Users (${userCount} total):`);
      users.forEach(u => {
        console.log(`   - ${u.email} (${u.role})`);
      });
    }

    // Check recent MTOs
    const { data: recentMTOs, count: mtoCount } = await supabase
      .from('mtos')
      .select('internal_id, display_name, status, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentMTOs && recentMTOs.length > 0) {
      console.log(`\n📦 Recent MTOs (${mtoCount} total):`);
      recentMTOs.forEach(m => {
        console.log(`   - ${m.internal_id}: ${m.display_name} [${m.status}]`);
      });
    }

    // Check workspaces if they exist
    const { data: workspaces, count: workspaceCount } = await supabase
      .from('workspaces')
      .select('name, production_category, status', { count: 'exact' })
      .limit(5);
    
    if (workspaces && workspaces.length > 0) {
      console.log(`\n🏭 Workspaces (${workspaceCount} total):`);
      workspaces.forEach(w => {
        console.log(`   - ${w.name} (${w.production_category}) [${w.status}]`);
      });
    }

  } catch (error) {
    console.error('\n❌ Error inspecting database:', error);
    console.log('\n💡 This usually means the database tables have not been created yet.');
    console.log('Please run the SQL setup script in Supabase first.');
  }

  console.log('\n' + '=' .repeat(60));
  console.log('✅ Database inspection complete\n');
}

// Run the inspection
inspectDatabase().catch(console.error);