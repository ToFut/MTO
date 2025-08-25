-- Complete Database Setup for MTO System with Bauble Bar PO Support
-- Run this entire script in your Supabase SQL Editor

-- ============================================
-- PART 1: Enable Extensions
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
ALTER DATABASE postgres SET timezone TO 'UTC';

-- ============================================
-- PART 2: Create Base Tables
-- ============================================

-- Companies table (Brands and Factories)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('brand', 'factory')),
  code VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  contact_person VARCHAR(255),
  timezone VARCHAR(50) DEFAULT 'UTC',
  settings JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'brand_user', 'brand_manager', 'factory_user', 'factory_operator', 'viewer')),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  language VARCHAR(10) DEFAULT 'en',
  avatar_url TEXT,
  phone VARCHAR(50),
  preferences JSONB DEFAULT '{}',
  last_login TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Orders table with enhanced fields for PO support
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(100) UNIQUE NOT NULL,
  brand_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  factory_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  
  -- Quantities and amounts
  total_units INTEGER NOT NULL DEFAULT 0,
  completed_units INTEGER NOT NULL DEFAULT 0,
  total_mtos INTEGER DEFAULT 0,
  total_amount DECIMAL(12,2),
  
  -- Status and dates
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'not_started', 'confirmed', 'in_production', 'completed', 'cancelled')),
  order_date DATE,
  requested_ship_date DATE,
  expected_completion_date DATE,
  actual_completion_date DATE,
  
  -- Vendor and shipping info
  customer_code VARCHAR(100),
  vendor_info JSONB DEFAULT '{}',
  ship_to_info JSONB DEFAULT '{}',
  
  -- Metadata
  po_type VARCHAR(50) DEFAULT 'standard',
  source_format VARCHAR(50), -- 'BaublePO', 'MTO', etc.
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES users(id),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MTOs table with flexible spots support
CREATE TABLE IF NOT EXISTS mtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  
  -- Core identifiers
  internal_id VARCHAR(100) NOT NULL,
  po_line_id VARCHAR(100),
  reference_number VARCHAR(100) NOT NULL,
  
  -- Product information
  display_name VARCHAR(500) NOT NULL,
  product_category VARCHAR(100),
  bag_base_pid VARCHAR(100),
  size VARCHAR(50),
  color VARCHAR(50),
  material VARCHAR(100),
  quantity INTEGER NOT NULL DEFAULT 1,
  
  -- Traditional 6 spots (for backward compatibility)
  spot1 VARCHAR(100),
  spot2 VARCHAR(100),
  spot3 VARCHAR(100),
  spot4 VARCHAR(100),
  spot5 VARCHAR(100),
  spot6 VARCHAR(100),
  
  -- Spot patch references
  spot1_patch_ref VARCHAR(200),
  spot2_patch_ref VARCHAR(200),
  spot3_patch_ref VARCHAR(200),
  spot4_patch_ref VARCHAR(200),
  spot5_patch_ref VARCHAR(200),
  spot6_patch_ref VARCHAR(200),
  
  -- Flexible spots storage (NEW - supports any number of spots)
  spots_data JSONB DEFAULT '[]',
  
  -- Dates
  expected_ship_date DATE,
  actual_ship_date DATE,
  order_submit_date DATE,
  so_date DATE,
  shopify_order_date TIMESTAMP WITH TIME ZONE,
  cpsd DATE,
  
  -- Tracking
  po_line_tracking VARCHAR(100),
  awb VARCHAR(100),
  master_carton VARCHAR(100),
  vendor_po_status VARCHAR(50),
  sales_order_number VARCHAR(100),
  
  -- PO-specific fields
  po_customer VARCHAR(255),
  hts_code VARCHAR(50),
  packaging_code VARCHAR(100),
  fob_cost DECIMAL(10,2),
  ext_fob DECIMAL(10,2),
  first_cost DECIMAL(10,2),
  vendor_name VARCHAR(255),
  vendor_address TEXT,
  ship_to_address TEXT,
  
  -- Status and workflow
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'proceed', 'in_production', 'qc', 'shipping', 'shipped', 'delivered', 'cancelled')),
  production_stage VARCHAR(50) DEFAULT 'receive' CHECK (production_stage IN ('receive', 'cutting', 'sewing', 'embroidery', 'qc', 'packing', 'ready')),
  production_category VARCHAR(20) DEFAULT 'monthly' CHECK (production_category IN ('daily', 'monthly')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  
  -- Flags
  is_replacement BOOLEAN DEFAULT false,
  is_rush BOOLEAN DEFAULT false,
  chat_enabled BOOLEAN DEFAULT true,
  unread_messages INTEGER DEFAULT 0,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  brand_id UUID REFERENCES companies(id),
  factory_id UUID REFERENCES companies(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PO Line Items table
CREATE TABLE IF NOT EXISTS po_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  
  -- Item identifiers
  item_number VARCHAR(100),
  pid VARCHAR(100),
  design VARCHAR(200),
  factory VARCHAR(200),
  customization TEXT,
  
  -- Quantities and costs
  quantity INTEGER NOT NULL DEFAULT 1,
  hts_code VARCHAR(50),
  pkg_code VARCHAR(100),
  pkg_cost DECIMAL(10,2),
  first_cost DECIMAL(10,2),
  fob_cost DECIMAL(10,2),
  ext_fob DECIMAL(10,2),
  
  -- Status
  mtos_created INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MTO Spots table for detailed tracking
CREATE TABLE IF NOT EXISTS mto_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mto_id UUID NOT NULL REFERENCES mtos(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  sku VARCHAR(100),
  patch_ref VARCHAR(200),
  description TEXT,
  visual_location VARCHAR(100),
  material_code VARCHAR(100),
  patch_type VARCHAR(50),
  complexity_level VARCHAR(20),
  production_time_minutes INTEGER,
  status VARCHAR(50) DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES users(id),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mto_id, position)
);

-- Vocabulary Mappings table
CREATE TABLE IF NOT EXISTS vocabulary_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES companies(id),
  factory_id UUID REFERENCES companies(id),
  
  -- Brand side
  brand_sku VARCHAR(100) NOT NULL,
  brand_description TEXT,
  brand_category VARCHAR(100),
  
  -- Factory side
  factory_sku VARCHAR(100),
  factory_description TEXT,
  factory_material_code VARCHAR(100),
  factory_category VARCHAR(100),
  
  -- Production details
  patch_type VARCHAR(50),
  patch_position VARCHAR(100),
  complexity_level VARCHAR(20) DEFAULT 'medium',
  production_time_minutes INTEGER,
  special_instructions TEXT,
  
  -- Visual references
  reference_images TEXT[],
  technical_drawings TEXT[],
  
  -- Status
  active BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(brand_id, brand_sku, factory_id)
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Item details
  sku VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  
  -- Stock levels
  current_stock INTEGER DEFAULT 0,
  reserved_stock INTEGER DEFAULT 0,
  available_stock INTEGER GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
  reorder_level INTEGER DEFAULT 0,
  reorder_quantity INTEGER DEFAULT 0,
  
  -- Location and supplier
  location VARCHAR(100),
  supplier VARCHAR(255),
  brand_id UUID REFERENCES companies(id),
  factory_id UUID REFERENCES companies(id),
  
  -- Metadata
  unit_cost DECIMAL(10,2),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Allocations table
CREATE TABLE IF NOT EXISTS inventory_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mto_id UUID NOT NULL REFERENCES mtos(id) ON DELETE CASCADE,
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  
  allocated_quantity INTEGER NOT NULL,
  allocation_type VARCHAR(50) DEFAULT 'auto',
  allocated_by UUID REFERENCES users(id),
  released_at TIMESTAMP WITH TIME ZONE,
  released_by UUID REFERENCES users(id),
  
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(mto_id, inventory_id)
);

-- Barcodes table
CREATE TABLE IF NOT EXISTS barcodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mto_id UUID NOT NULL REFERENCES mtos(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  value TEXT NOT NULL,
  spot_number INTEGER,
  scanned_count INTEGER DEFAULT 0,
  last_scanned_at TIMESTAMP WITH TIME ZONE,
  last_scanned_by UUID REFERENCES users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Defects table
CREATE TABLE IF NOT EXISTS defects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mto_id UUID NOT NULL REFERENCES mtos(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES users(id),
  
  defect_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  location_description TEXT,
  
  photos TEXT[] DEFAULT '{}',
  attachments TEXT[] DEFAULT '{}',
  
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed', 'cannot_reproduce')),
  resolution_description TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  replacement_required BOOLEAN DEFAULT false,
  replacement_mto_id UUID REFERENCES mtos(id),
  
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- History tracking tables
CREATE TABLE IF NOT EXISTS production_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mto_id UUID NOT NULL REFERENCES mtos(id) ON DELETE CASCADE,
  old_stage VARCHAR(50),
  new_stage VARCHAR(50),
  changed_by UUID REFERENCES users(id),
  duration_minutes INTEGER,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mto_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mto_id UUID NOT NULL REFERENCES mtos(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  changed_by UUID REFERENCES users(id),
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PART 3: Create Indexes
-- ============================================

-- MTOs indexes
CREATE INDEX IF NOT EXISTS idx_mtos_po_id ON mtos(po_id);
CREATE INDEX IF NOT EXISTS idx_mtos_status ON mtos(status);
CREATE INDEX IF NOT EXISTS idx_mtos_internal_id ON mtos(internal_id);
CREATE INDEX IF NOT EXISTS idx_mtos_reference_number ON mtos(reference_number);
CREATE INDEX IF NOT EXISTS idx_mtos_production_category ON mtos(production_category);
CREATE INDEX IF NOT EXISTS idx_mtos_priority ON mtos(priority);
CREATE INDEX IF NOT EXISTS idx_mtos_expected_ship_date ON mtos(expected_ship_date);
CREATE INDEX IF NOT EXISTS idx_mtos_spots_data ON mtos USING GIN (spots_data);
CREATE INDEX IF NOT EXISTS idx_mtos_po_customer ON mtos(po_customer);
CREATE INDEX IF NOT EXISTS idx_mtos_brand_id ON mtos(brand_id);
CREATE INDEX IF NOT EXISTS idx_mtos_factory_id ON mtos(factory_id);

-- Other table indexes
CREATE INDEX IF NOT EXISTS idx_po_line_items_po_id ON po_line_items(po_id);
CREATE INDEX IF NOT EXISTS idx_po_line_items_pid ON po_line_items(pid);
CREATE INDEX IF NOT EXISTS idx_mto_spots_mto_id ON mto_spots(mto_id);
CREATE INDEX IF NOT EXISTS idx_mto_spots_sku ON mto_spots(sku);
CREATE INDEX IF NOT EXISTS idx_vocabulary_brand_sku ON vocabulary_mappings(brand_sku);
CREATE INDEX IF NOT EXISTS idx_vocabulary_brand_id ON vocabulary_mappings(brand_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);
CREATE INDEX IF NOT EXISTS idx_barcodes_mto_id ON barcodes(mto_id);
CREATE INDEX IF NOT EXISTS idx_barcodes_value ON barcodes(value);

-- ============================================
-- PART 4: Create Update Trigger Function
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- PART 5: Apply Triggers
-- ============================================

-- Drop existing triggers if they exist and recreate
DO $$ 
BEGIN
  -- Companies
  DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
  CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
  -- Users
  DROP TRIGGER IF EXISTS update_users_updated_at ON users;
  CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
  -- Purchase Orders
  DROP TRIGGER IF EXISTS update_purchase_orders_updated_at ON purchase_orders;
  CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
  -- MTOs
  DROP TRIGGER IF EXISTS update_mtos_updated_at ON mtos;
  CREATE TRIGGER update_mtos_updated_at BEFORE UPDATE ON mtos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
  -- Other tables
  DROP TRIGGER IF EXISTS update_po_line_items_updated_at ON po_line_items;
  CREATE TRIGGER update_po_line_items_updated_at BEFORE UPDATE ON po_line_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
  DROP TRIGGER IF EXISTS update_mto_spots_updated_at ON mto_spots;
  CREATE TRIGGER update_mto_spots_updated_at BEFORE UPDATE ON mto_spots 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
  DROP TRIGGER IF EXISTS update_vocabulary_mappings_updated_at ON vocabulary_mappings;
  CREATE TRIGGER update_vocabulary_mappings_updated_at BEFORE UPDATE ON vocabulary_mappings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
  DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
  CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
  DROP TRIGGER IF EXISTS update_barcodes_updated_at ON barcodes;
  CREATE TRIGGER update_barcodes_updated_at BEFORE UPDATE ON barcodes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;

-- ============================================
-- PART 6: Create Views
-- ============================================

-- MTO Dashboard View
CREATE OR REPLACE VIEW mto_dashboard_view AS
SELECT 
  m.id,
  m.internal_id,
  m.po_line_id,
  m.display_name,
  m.reference_number,
  m.quantity,
  m.status,
  m.production_stage,
  m.production_category,
  m.priority,
  m.expected_ship_date,
  m.po_customer,
  m.fob_cost,
  m.ext_fob,
  p.po_number,
  p.brand_id,
  p.factory_id,
  p.requested_ship_date,
  COALESCE(jsonb_array_length(m.spots_data), 0) as spot_count,
  m.spots_data,
  m.created_at,
  m.updated_at
FROM mtos m
JOIN purchase_orders p ON m.po_id = p.id;

-- ============================================
-- PART 7: Insert Demo Data
-- ============================================

-- Insert demo companies
INSERT INTO companies (name, type, code, email, active) VALUES
  ('Bauble Bar', 'brand', 'BAUBLE', 'po@bauglebar.com', true),
  ('All Brands Unlimited', 'factory', 'ABU', 'production@allbrands.com', true)
ON CONFLICT (code) DO NOTHING;

-- Insert demo user (password: brand123)
INSERT INTO users (email, password_hash, full_name, role, active) VALUES
  ('brand@brand.com', '$2a$12$D28VEnZXXbNs46WnIyGC2OPr.BhCtVtOXNE/9vPRTemwYgXBAePEu', 'Brand Demo User', 'brand_user', true)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- PART 8: Grant Permissions
-- ============================================

-- Grant access to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON mto_dashboard_view TO authenticated;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check that all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Success message
SELECT 'Database setup completed successfully!' as status,
       COUNT(*) as tables_created
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';