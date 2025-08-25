-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'brand_user', 'factory_user', 'viewer')),
  company_id UUID,
  language VARCHAR(10) DEFAULT 'en',
  avatar_url VARCHAR(500),
  phone VARCHAR(50),
  preferences JSONB DEFAULT '{}',
  last_login TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Add foreign key constraint
ALTER TABLE users 
ADD CONSTRAINT fk_users_company 
FOREIGN KEY (company_id) 
REFERENCES companies(id) 
ON DELETE SET NULL;

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_active ON users(active);
CREATE INDEX idx_companies_type ON companies(type);
CREATE INDEX idx_companies_code ON companies(code);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at 
  BEFORE UPDATE ON companies 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();