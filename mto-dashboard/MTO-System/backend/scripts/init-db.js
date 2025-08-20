#!/usr/bin/env node

/**
 * Database initialization script
 * This script sets up the Supabase database with all required tables and sample data
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQLFile(filePath) {
  try {
    console.log(`📄 Reading SQL file: ${filePath}`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`⚡ Executing SQL file: ${path.basename(filePath)}`);
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ Successfully executed: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ Error executing ${filePath}:`, error.message);
    throw error;
  }
}

async function createSampleData() {
  try {
    console.log('📝 Creating sample companies...');
    
    // Create sample companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .insert([
        {
          name: 'Acme Brand Co',
          type: 'brand',
          code: 'ACME',
          email: 'contact@acmebrand.com',
          contact_person: 'John Smith'
        },
        {
          name: 'Premium Factory Ltd',
          type: 'factory',
          code: 'PREM',
          email: 'production@premiumfactory.com',
          contact_person: 'Jane Doe'
        }
      ])
      .select();
      
    if (companiesError) {
      throw companiesError;
    }
    
    console.log(`✅ Created ${companies.length} sample companies`);
    
    // Create sample users
    console.log('👥 Creating sample users...');
    
    const bcrypt = require('bcryptjs');
    const defaultPassword = await bcrypt.hash('password123', 12);
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .insert([
        {
          email: 'admin@system.com',
          password_hash: defaultPassword,
          full_name: 'System Administrator',
          role: 'admin',
          active: true
        },
        {
          email: 'brand@acmebrand.com',
          password_hash: defaultPassword,
          full_name: 'Brand Manager',
          role: 'brand_manager',
          company_id: companies[0].id,
          active: true
        },
        {
          email: 'factory@premiumfactory.com',
          password_hash: defaultPassword,
          full_name: 'Factory Operator',
          role: 'factory_operator',
          company_id: companies[1].id,
          active: true
        }
      ])
      .select();
      
    if (usersError) {
      throw usersError;
    }
    
    console.log(`✅ Created ${users.length} sample users`);
    console.log('🔑 Default password for all users: password123');
    
    return { companies, users };
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error.message);
    throw error;
  }
}

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    const { data, error } = await supabase
      .from('companies')
      .select('id')
      .limit(1);
      
    if (error) {
      throw error;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database initialization...');
  console.log('=' .repeat(50));
  
  try {
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      process.exit(1);
    }
    
    // Execute schema file
    const schemaPath = path.join(__dirname, '../database/create-tables.sql');
    
    if (fs.existsSync(schemaPath)) {
      console.log('🏗️  Setting up database schema...');
      // Note: You'll need to run the SQL file manually in Supabase SQL editor
      // as the supabase client doesn't support executing multi-statement SQL directly
      console.log(`📋 Please run the following SQL file in your Supabase SQL editor:`);
      console.log(`   ${schemaPath}`);
      console.log('');
      
      // For now, let's just check if tables exist
      const { data: tables, error } = await supabase.rpc('check_table_exists', { table_name: 'companies' });
      
      if (error) {
        console.log('⚠️  Tables not found. Please run the schema file first.');
        console.log('   Then run this script again with --sample-data flag');
        process.exit(0);
      }
    }
    
    // Create sample data if requested
    if (process.argv.includes('--sample-data')) {
      console.log('📊 Creating sample data...');
      await createSampleData();
    }
    
    console.log('');
    console.log('=' .repeat(50));
    console.log('✅ Database initialization completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Update your .env file with the correct Supabase credentials');
    console.log('2. Start your backend server: npm run dev');
    console.log('3. Start your frontend: npm run dev (in frontend directory)');
    console.log('');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}