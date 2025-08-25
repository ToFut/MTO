-- MTO Platform Database Setup
-- Run this SQL in Supabase SQL Editor: https://supabase.com/dashboard/project/hmdczoguvrgbprehvpqm/sql

-- 1. Create companies table
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

-- 2. Create users table
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

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
CREATE INDEX IF NOT EXISTS idx_companies_type ON companies(type);
CREATE INDEX IF NOT EXISTS idx_companies_code ON companies(code);

-- 4. Insert demo brand company
INSERT INTO companies (name, type, code, contact_email, active)
VALUES ('Demo Brand Company', 'brand', 'DEMO-BRAND', 'brand@brand.com', true)
ON CONFLICT (code) DO NOTHING;

-- 5. Insert demo user with hashed password for "brand123"
INSERT INTO users (email, password_hash, full_name, role, active, language)
VALUES (
  'brand@brand.com',
  '$2a$12$D28VEnZXXbNs46WnIyGC2OPr.BhCtVtOXNE/9vPRTemwYgXBAePEu',
  'Brand Demo User',
  'brand_user',
  true,
  'en'
)
ON CONFLICT (email) 
DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  active = true;

-- 6. Enable Row Level Security (RLS) - recommended for production
-- ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Test query to verify setup
SELECT 
  u.id, 
  u.email, 
  u.full_name, 
  u.role, 
  u.active,
  c.name as company_name
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
WHERE u.email = 'brand@brand.com';