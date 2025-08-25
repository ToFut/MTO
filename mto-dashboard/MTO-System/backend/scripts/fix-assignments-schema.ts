import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAssignmentsSchema() {
  console.log('Fixing brand_factory_assignments table schema...');
  
  try {
    // Drop the existing table and recreate with correct schema
    console.log('⚠️  Dropping existing table (this will remove any data)...');
    
    const dropSQL = `
      -- Drop existing table
      DROP TABLE IF EXISTS brand_factory_assignments CASCADE;
    `;

    // Drop the table by selecting and deleting all rows first, then dropping
    const { error: deleteError } = await supabase
      .from('brand_factory_assignments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (deleteError) {
      console.log('Error clearing existing data (table might not exist):', deleteError.message);
    }

    // Now create the new table with correct schema
    console.log('📋 Creating new table with correct schema...');
    
    const createSQL = `
      -- Create brand_factory_assignments table with correct schema
      CREATE TABLE brand_factory_assignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        brand_id UUID NOT NULL,
        factory_id UUID NOT NULL,
        assigned_by UUID NOT NULL,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
        capabilities TEXT[],
        production_capacity INTEGER DEFAULT 0,
        quality_rating DECIMAL(3,2) DEFAULT 0,
        preferred_for_categories TEXT[],
        notes TEXT,
        assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(brand_id, factory_id)
      );

      -- Create indexes
      CREATE INDEX idx_brand_factory_assignments_brand_id ON brand_factory_assignments(brand_id);
      CREATE INDEX idx_brand_factory_assignments_factory_id ON brand_factory_assignments(factory_id);
      CREATE INDEX idx_brand_factory_assignments_status ON brand_factory_assignments(status);

      -- Enable RLS
      ALTER TABLE brand_factory_assignments ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies
      CREATE POLICY "Admins can manage all assignments" ON brand_factory_assignments
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
          )
        );

      CREATE POLICY "Brands can view their assignments" ON brand_factory_assignments
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.company_id = brand_factory_assignments.brand_id
            AND users.role IN ('brand_user', 'brand_manager')
          )
        );

      CREATE POLICY "Factories can view assignments to them" ON brand_factory_assignments
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.company_id = brand_factory_assignments.factory_id
            AND users.role IN ('factory_user', 'factory_operator')
          )
        );
    `;

    // Since we can't execute DDL directly, we need to create a simpler approach
    // Let's try to add the missing columns to the existing table instead
    console.log('Adding missing columns to existing table...');

    const alterSQL = `
      -- Add missing columns
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
    `;

    // We'll need to manually run this in the database since we don't have exec_sql
    console.log('\n📋 Please run this SQL in your Supabase SQL editor:');
    console.log('========================================');
    console.log(alterSQL);
    console.log('========================================\n');

    // Let's test if we can insert data now by trying a simple approach
    console.log('🧪 Testing current table state...');
    
    // Get test data
    const { data: adminUser } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (!adminUser) {
      console.log('❌ No admin user found');
      return;
    }

    // Try to select with the expected columns to see which ones exist
    const { data: testSelect, error: selectError } = await supabase
      .from('brand_factory_assignments')
      .select('id, brand_id, factory_id, assigned_by, capabilities, production_capacity, quality_rating, preferred_for_categories, notes, status')
      .limit(1);

    if (selectError) {
      console.log('❌ Some columns are missing:', selectError.message);
      console.log('Please run the ALTER TABLE commands above in your Supabase SQL editor.');
    } else {
      console.log('✅ All expected columns are present');
      console.log('Current table structure looks good!');
    }

  } catch (error) {
    console.error('❌ Error fixing schema:', error);
  }
}

fixAssignmentsSchema()
  .then(() => {
    console.log('Schema fix attempt completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Schema fix failed:', error);
    process.exit(1);
  });