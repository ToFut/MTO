import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Initialize Supabase client with service key
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function createTablesAndUser() {
  console.log('🔧 Setting up database and demo user...\n');

  try {
    // First, let's try to create a simple function that can execute SQL
    console.log('1. Creating database setup function...');
    
    const setupFunction = `
      CREATE OR REPLACE FUNCTION setup_mto_database()
      RETURNS TEXT AS $$
      BEGIN
        -- Create companies table
        CREATE TABLE IF NOT EXISTS companies (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL CHECK (type IN ('brand', 'factory')),
          code VARCHAR(100) UNIQUE,
          contact_email VARCHAR(255),
          contact_phone VARCHAR(50),
          address TEXT,
          country VARCHAR(100),
          settings JSONB DEFAULT '{}',
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create users table
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'brand_user', 'factory_user', 'viewer')),
          company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
          language VARCHAR(10) DEFAULT 'en',
          avatar_url VARCHAR(500),
          phone VARCHAR(50),
          preferences JSONB DEFAULT '{}',
          last_login TIMESTAMPTZ,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
        CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
        CREATE INDEX IF NOT EXISTS idx_companies_type ON companies(type);
        CREATE INDEX IF NOT EXISTS idx_companies_code ON companies(code);

        RETURN 'Tables created successfully';
      END;
      $$ LANGUAGE plpgsql;
    `;

    // Try to create the function using raw SQL
    const { error: functionError } = await supabase.rpc('exec', { 
      sql: setupFunction 
    });

    if (functionError) {
      console.log('⚠️  Could not create function via RPC. Trying alternative approach...');
      
      // Alternative: Use direct SQL via REST API
      const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_SERVICE_KEY!,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY!}`
        },
        body: JSON.stringify({ sql: setupFunction })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    console.log('2. Executing database setup...');
    
    // Execute the setup function
    const { data: setupResult, error: setupError } = await supabase
      .rpc('setup_mto_database');

    if (setupError) {
      throw setupError;
    }

    console.log('✅ Database tables created successfully');

    // 3. Create demo user
    console.log('3. Creating demo user...');
    
    const passwordHash = await bcrypt.hash('brand123', 12);

    // Insert demo company first
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .upsert({
        name: 'Demo Brand Company',
        type: 'brand',
        code: 'DEMO-BRAND',
        contact_email: 'brand@brand.com',
        active: true
      })
      .select()
      .single();

    if (companyError && companyError.code !== '23505') { // Ignore unique constraint error
      console.warn('Company creation warning:', companyError);
    }

    // Insert demo user
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert({
        email: 'brand@brand.com',
        password_hash: passwordHash,
        full_name: 'Brand Demo User',
        role: 'brand_user',
        company_id: company?.id || null,
        active: true,
        language: 'en'
      })
      .select('id, email, full_name, role')
      .single();

    if (userError) {
      throw userError;
    }

    console.log('✅ Demo user created successfully');
    console.log('\n🎉 Setup complete! You can now login with:');
    console.log('   Email: brand@brand.com');
    console.log('   Password: brand123');
    console.log('\n📝 User details:', user);

  } catch (error: any) {
    console.error('❌ Setup failed:', error);
    
    if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
      console.log('\n💡 The issue is that Supabase requires tables to be created via SQL Editor.');
      console.log('\nPlease follow these steps:');
      console.log('1. Go to: https://supabase.com/dashboard/project/hmdczoguvrgbprehvpqm/sql');
      console.log('2. Copy and paste this SQL:');
      
      const sql = `
-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('brand', 'factory')),
  code VARCHAR(100) UNIQUE,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  address TEXT,
  country VARCHAR(100),
  settings JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'brand_user', 'factory_user', 'viewer')),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  language VARCHAR(10) DEFAULT 'en',
  avatar_url VARCHAR(500),
  phone VARCHAR(50),
  preferences JSONB DEFAULT '{}',
  last_login TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert demo user
INSERT INTO users (email, password_hash, full_name, role, active, language)
VALUES (
  'brand@brand.com',
  '${await bcrypt.hash('brand123', 12)}',
  'Brand Demo User',
  'brand_user',
  true,
  'en'
)
ON CONFLICT (email) 
DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  active = true;
      `;
      
      console.log(sql);
      console.log('\n3. Click "Run" to execute the SQL');
      console.log('4. Then try logging in with brand@brand.com / brand123');
    }
    
    process.exit(1);
  }
}

// Run the setup
createTablesAndUser();