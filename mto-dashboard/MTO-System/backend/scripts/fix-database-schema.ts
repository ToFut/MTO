import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixDatabaseSchema() {
  console.log('🔧 Fixing database schema issues...\n');

  try {
    // 1. Fix companies table - add missing email column
    console.log('📝 Step 1: Checking companies table structure...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(1);

    if (companies && companies.length > 0) {
      const columns = Object.keys(companies[0]);
      console.log('Available company columns:', columns);
      
      if (!columns.includes('email')) {
        console.log('❌ Missing email column in companies table');
        console.log('📋 Please run this SQL in your Supabase SQL editor:');
        console.log('ALTER TABLE companies ADD COLUMN IF NOT EXISTS email VARCHAR(255);');
        console.log('ALTER TABLE companies ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255);');
      } else {
        console.log('✅ Companies table has email column');
      }
    }

    // 2. Fix assignments table - add missing columns
    console.log('\n📝 Step 2: Checking brand_factory_assignments table...');
    const { data: assignments, error: assignmentsError } = await supabase
      .from('brand_factory_assignments')
      .select('*')
      .limit(1);

    if (assignments) {
      if (assignments.length > 0) {
        const columns = Object.keys(assignments[0]);
        console.log('Available assignment columns:', columns);
        
        const missingColumns = [];
        const requiredColumns = [
          'capabilities', 'production_capacity', 'quality_rating',
          'preferred_for_categories', 'notes', 'status', 'assigned_at'
        ];
        
        requiredColumns.forEach(col => {
          if (!columns.includes(col)) {
            missingColumns.push(col);
          }
        });
        
        if (missingColumns.length > 0) {
          console.log('❌ Missing columns in assignments table:', missingColumns);
          console.log('\n📋 Please run this SQL in your Supabase SQL editor:');
          console.log(`
-- Add missing columns to brand_factory_assignments
ALTER TABLE brand_factory_assignments 
ADD COLUMN IF NOT EXISTS capabilities TEXT[],
ADD COLUMN IF NOT EXISTS production_capacity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS quality_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS preferred_for_categories TEXT[],
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records to have proper assigned_by values
UPDATE brand_factory_assignments 
SET assigned_by = (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
WHERE assigned_by IS NULL;

-- Make assigned_by NOT NULL after updating
ALTER TABLE brand_factory_assignments 
ALTER COLUMN assigned_by SET NOT NULL;

-- Add check constraint for status
ALTER TABLE brand_factory_assignments 
ADD CONSTRAINT chk_status CHECK (status IN ('active', 'inactive', 'suspended'));
          `);
        } else {
          console.log('✅ Assignments table has all required columns');
        }
      } else {
        console.log('📝 Assignments table is empty (this is okay)');
      }
    } else if (assignmentsError) {
      console.log('❌ Could not access assignments table:', assignmentsError.message);
    }

    // 3. Test a simple assignment creation to see what's actually missing
    console.log('\n📝 Step 3: Testing assignment creation...');
    
    // Get required data
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

    if (adminUser && brands?.length && factories?.length) {
      console.log('✅ Found test data: admin, brand, factory');
      
      // Try the old schema approach first
      const oldSchemaData = {
        brand_id: brands[0].id,
        factory_id: factories[0].id,
        assigned_by: adminUser.id,
        assignment_type: 'preferred',
        capacity_allocation: 100,
        priority_level: 2,
        settings: {
          capabilities: ['test'],
          preferred_categories: ['test_category'],
          notes: 'Test assignment'
        },
        active: true
      };

      console.log('🧪 Testing old schema insert...');
      const { data: oldResult, error: oldError } = await supabase
        .from('brand_factory_assignments')
        .insert(oldSchemaData)
        .select()
        .single();

      if (oldResult) {
        console.log('✅ Old schema works! Assignment created:', oldResult.id);
        // Clean up
        await supabase.from('brand_factory_assignments').delete().eq('id', oldResult.id);
        console.log('🧹 Cleaned up test assignment');
      } else if (oldError) {
        console.log('❌ Old schema failed:', oldError.message);
        
        // Now try new schema
        console.log('🧪 Testing new schema insert...');
        const newSchemaData = {
          brand_id: brands[0].id,
          factory_id: factories[0].id,
          assigned_by: adminUser.id,
          capabilities: ['test'],
          production_capacity: 100,
          quality_rating: 8.5,
          preferred_for_categories: ['test_category'],
          notes: 'Test assignment',
          status: 'active'
        };

        const { data: newResult, error: newError } = await supabase
          .from('brand_factory_assignments')
          .insert(newSchemaData)
          .select()
          .single();

        if (newResult) {
          console.log('✅ New schema works! Assignment created:', newResult.id);
          // Clean up
          await supabase.from('brand_factory_assignments').delete().eq('id', newResult.id);
          console.log('🧹 Cleaned up test assignment');
        } else if (newError) {
          console.log('❌ New schema also failed:', newError.message);
          console.log('🔧 Table needs schema updates as shown above');
        }
      }
    } else {
      console.log('❌ Missing required test data');
      console.log('Admin user:', !!adminUser);
      console.log('Brands:', brands?.length || 0);
      console.log('Factories:', factories?.length || 0);
    }

    console.log('\n✅ Schema analysis completed!');

  } catch (error) {
    console.error('❌ Error during schema fix:', error);
  }
}

fixDatabaseSchema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Schema fix failed:', error);
    process.exit(1);
  });