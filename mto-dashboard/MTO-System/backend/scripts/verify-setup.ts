import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function verifySetup() {
  console.log('🔍 Verifying Supabase setup...\n');

  try {
    // Test basic connection
    console.log('1. Testing Supabase connection...');
    
    const { data: healthCheck } = await supabase
      .from('_supabase_meta')
      .select('*')
      .limit(1);
    
    console.log('✅ Supabase connection working');

    // Check if tables exist by trying to query them
    console.log('\n2. Checking if tables exist...');
    
    // Check companies table
    try {
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, type')
        .limit(1);
      
      if (companiesError) {
        console.log('❌ Companies table does not exist');
        console.log('Error:', companiesError.message);
      } else {
        console.log('✅ Companies table exists');
        console.log(`   Found ${companies?.length || 0} companies`);
      }
    } catch (error) {
      console.log('❌ Companies table does not exist');
    }

    // Check users table
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, role')
        .limit(1);
      
      if (usersError) {
        console.log('❌ Users table does not exist');
        console.log('Error:', usersError.message);
      } else {
        console.log('✅ Users table exists');
        console.log(`   Found ${users?.length || 0} users`);
      }
    } catch (error) {
      console.log('❌ Users table does not exist');
    }

    // Check for demo user specifically
    console.log('\n3. Checking for demo user...');
    
    try {
      const { data: demoUser, error: demoError } = await supabase
        .from('users')
        .select('id, email, full_name, role, active')
        .eq('email', 'brand@brand.com')
        .single();
      
      if (demoError || !demoUser) {
        console.log('❌ Demo user (brand@brand.com) not found');
        if (demoError) console.log('Error:', demoError.message);
      } else {
        console.log('✅ Demo user found!');
        console.log('   User details:', {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.full_name,
          role: demoUser.role,
          active: demoUser.active
        });
      }
    } catch (error) {
      console.log('❌ Could not check for demo user');
    }

  } catch (error) {
    console.error('❌ Setup verification failed:', error);
  }

  console.log('\n' + '='.repeat(50));
  console.log('📋 SETUP INSTRUCTIONS');
  console.log('='.repeat(50));
  console.log('');
  console.log('If tables are missing, please:');
  console.log('');
  console.log('1. Go to Supabase SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/hmdczoguvrgbprehvpqm/sql');
  console.log('');
  console.log('2. Copy and paste the SQL from:');
  console.log('   backend/scripts/supabase-setup.sql');
  console.log('');
  console.log('3. Click "Run" to execute the SQL');
  console.log('');
  console.log('4. Then you can login with:');
  console.log('   Email: brand@brand.com');
  console.log('   Password: brand123');
  console.log('');
}

verifySetup();