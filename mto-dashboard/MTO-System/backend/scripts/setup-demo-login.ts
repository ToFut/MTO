import bcrypt from 'bcryptjs';

async function generatePasswordHash() {
  const password = 'brand123';
  const hash = await bcrypt.hash(password, 12);
  
  console.log('\n📋 Demo Login Setup Instructions:');
  console.log('=====================================\n');
  
  console.log('1. First, create the database tables in Supabase Dashboard:');
  console.log('   Go to: https://supabase.com/dashboard/project/hmdczoguvrgbprehvpqm/editor\n');
  
  console.log('2. Run this SQL to create the tables:\n');
  
  const sql = `
-- Create companies table first
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
);`;

  console.log(sql);
  
  console.log('\n3. Then insert the demo user with this SQL:\n');
  
  const insertSQL = `
-- Insert demo brand company (optional)
INSERT INTO companies (name, type, code, contact_email, active)
VALUES ('Demo Brand Company', 'brand', 'DEMO-BRAND', 'brand@brand.com', true)
ON CONFLICT (code) DO NOTHING;

-- Insert demo user
INSERT INTO users (email, password_hash, full_name, role, active, language)
VALUES (
  'brand@brand.com',
  '${hash}',
  'Brand Demo User',
  'brand_user',
  true,
  'en'
)
ON CONFLICT (email) 
DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  active = true;`;

  console.log(insertSQL);
  
  console.log('\n4. Test the login with these credentials:');
  console.log('   Email: brand@brand.com');
  console.log('   Password: brand123');
  
  console.log('\n✅ Password hash generated for "brand123"');
  console.log(`Hash: ${hash}\n`);
}

// Run the function
generatePasswordHash();