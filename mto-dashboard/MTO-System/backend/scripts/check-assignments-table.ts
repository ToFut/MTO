import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTable() {
  console.log('Checking brand_factory_assignments table structure...');
  
  try {
    // Check if we can select from the table
    const { data, error } = await supabase
      .from('brand_factory_assignments')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error accessing table:', error);
      return;
    }

    console.log('✅ Table is accessible');
    console.log('Current data:', data);

    // Try to get column information
    const { data: columns, error: columnError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'brand_factory_assignments'
          ORDER BY ordinal_position;
        ` 
      });

    if (columnError) {
      console.error('❌ Error getting column info:', columnError);
    } else {
      console.log('📋 Table columns:', columns);
    }

    // Test insert with minimal data
    console.log('\n🧪 Testing insert operation...');
    
    // First get an admin user and some companies
    const { data: adminUser } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single();

    const { data: brands } = await supabase
      .from('companies')
      .select('id')
      .eq('type', 'brand')
      .limit(1);

    const { data: factories } = await supabase
      .from('companies')
      .select('id')
      .eq('type', 'factory')
      .limit(1);

    if (!adminUser || !brands?.length || !factories?.length) {
      console.log('❌ Missing required data for test insert');
      console.log('Admin user:', adminUser);
      console.log('Brands:', brands);
      console.log('Factories:', factories);
      return;
    }

    const testData = {
      brand_id: brands[0].id,
      factory_id: factories[0].id,
      assigned_by: adminUser.id,
      capabilities: ['test'],
      production_capacity: 100,
      quality_rating: 8.5,
      preferred_for_categories: ['test_category'],
      notes: 'Test assignment'
    };

    console.log('Attempting insert with data:', testData);

    const { data: insertResult, error: insertError } = await supabase
      .from('brand_factory_assignments')
      .insert(testData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Test insert failed:', insertError);
      
      // Try without array fields
      console.log('\n🧪 Trying without array fields...');
      const simpleTestData = {
        brand_id: brands[0].id,
        factory_id: factories[0].id,
        assigned_by: adminUser.id,
        production_capacity: 100,
        quality_rating: 8.5,
        notes: 'Simple test assignment'
      };

      const { data: simpleResult, error: simpleError } = await supabase
        .from('brand_factory_assignments')
        .insert(simpleTestData)
        .select()
        .single();

      if (simpleError) {
        console.error('❌ Simple test insert also failed:', simpleError);
      } else {
        console.log('✅ Simple test insert successful:', simpleResult);
        
        // Clean up
        await supabase
          .from('brand_factory_assignments')
          .delete()
          .eq('id', simpleResult.id);
        console.log('🧹 Cleaned up test data');
      }
    } else {
      console.log('✅ Test insert successful:', insertResult);
      
      // Clean up
      await supabase
        .from('brand_factory_assignments')
        .delete()
        .eq('id', insertResult.id);
      console.log('🧹 Cleaned up test data');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkTable()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Check failed:', error);
    process.exit(1);
  });