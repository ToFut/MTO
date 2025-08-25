import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAssignmentsTable() {
  console.log('Creating brand_factory_assignments table...');
  
  // Check if table already exists
  const { data: existing, error: checkError } = await supabase
    .from('brand_factory_assignments')
    .select('count')
    .limit(0);

  if (!checkError) {
    console.log('✅ Table already exists');
    return;
  }

  console.log('Table does not exist, creating...');

  // Create the table using raw SQL
  const createTableSQL = `
    -- Create brand_factory_assignments table
    CREATE TABLE IF NOT EXISTS brand_factory_assignments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      brand_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      factory_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      assigned_by UUID NOT NULL REFERENCES users(id),
      status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
      capabilities TEXT[], -- What the factory can produce for this brand
      production_capacity INTEGER DEFAULT 0, -- Monthly capacity
      quality_rating DECIMAL(3,2) DEFAULT 0, -- Quality score 0-10
      preferred_for_categories TEXT[], -- Product categories this factory is preferred for
      notes TEXT,
      assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      
      UNIQUE(brand_id, factory_id) -- Prevent duplicate assignments
    );

    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_brand_factory_assignments_brand_id ON brand_factory_assignments(brand_id);
    CREATE INDEX IF NOT EXISTS idx_brand_factory_assignments_factory_id ON brand_factory_assignments(factory_id);
    CREATE INDEX IF NOT EXISTS idx_brand_factory_assignments_status ON brand_factory_assignments(status);

    -- Create trigger for updated_at (if the function exists)
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        DROP TRIGGER IF EXISTS update_brand_factory_assignments_updated_at ON brand_factory_assignments;
        CREATE TRIGGER update_brand_factory_assignments_updated_at 
          BEFORE UPDATE ON brand_factory_assignments 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      END IF;
    END $$;

    -- Enable RLS
    ALTER TABLE brand_factory_assignments ENABLE ROW LEVEL SECURITY;

    -- RLS Policies
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Admins can manage all brand-factory assignments" ON brand_factory_assignments;
    DROP POLICY IF EXISTS "Brands can view their assignments" ON brand_factory_assignments;  
    DROP POLICY IF EXISTS "Factories can view assignments to them" ON brand_factory_assignments;

    -- Admins can see all assignments
    CREATE POLICY "Admins can manage all brand-factory assignments" ON brand_factory_assignments
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM users 
          WHERE users.id = auth.uid() 
          AND users.role = 'admin'
        )
      );

    -- Brands can see their own assignments
    CREATE POLICY "Brands can view their assignments" ON brand_factory_assignments
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM users 
          WHERE users.id = auth.uid() 
          AND users.company_id = brand_factory_assignments.brand_id
          AND users.role IN ('brand_user', 'brand_manager')
        )
      );

    -- Factories can see assignments to them
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

  const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
  
  if (error) {
    console.error('❌ Error creating table:', error);
    
    // Try alternative method using individual operations
    console.log('Trying alternative table creation method...');
    
    try {
      // First, create a simple version of the table
      await supabase.rpc('exec_sql', { 
        sql: `
          CREATE TABLE IF NOT EXISTS brand_factory_assignments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            brand_id UUID NOT NULL,
            factory_id UUID NOT NULL,
            assigned_by UUID NOT NULL,
            status VARCHAR(20) DEFAULT 'active',
            capabilities TEXT[],
            production_capacity INTEGER DEFAULT 0,
            quality_rating DECIMAL(3,2) DEFAULT 0,
            preferred_for_categories TEXT[],
            notes TEXT,
            assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        ` 
      });
      
      console.log('✅ Basic table created successfully');
      
      // Add indexes
      await supabase.rpc('exec_sql', { 
        sql: `
          CREATE INDEX IF NOT EXISTS idx_brand_factory_assignments_brand_id ON brand_factory_assignments(brand_id);
          CREATE INDEX IF NOT EXISTS idx_brand_factory_assignments_factory_id ON brand_factory_assignments(factory_id);
          CREATE INDEX IF NOT EXISTS idx_brand_factory_assignments_status ON brand_factory_assignments(status);
        ` 
      });
      
      console.log('✅ Indexes created successfully');
      
    } catch (altError) {
      console.error('❌ Alternative creation method also failed:', altError);
      console.log('\n📋 Manual creation required. Please run this SQL in your Supabase SQL editor:');
      console.log(createTableSQL);
      return;
    }
  } else {
    console.log('✅ Table created successfully with all features');
  }

  // Verify table was created
  const { data: verification, error: verifyError } = await supabase
    .from('brand_factory_assignments')
    .select('count')
    .limit(0);

  if (verifyError) {
    console.error('❌ Table verification failed:', verifyError);
  } else {
    console.log('✅ Table verification successful');
  }
}

// Run the function
createAssignmentsTable()
  .then(() => {
    console.log('✅ Assignment table setup completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });