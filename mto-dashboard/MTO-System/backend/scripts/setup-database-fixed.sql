-- Complete Database Setup for MTO System (FIXED)
-- Run this in Supabase SQL Editor

-- Drop existing tables if needed (be careful in production!)
-- Uncomment these lines if you need to start fresh:
-- DROP TABLE IF EXISTS mto_status_history CASCADE;
-- DROP TABLE IF EXISTS production_history CASCADE;
-- DROP TABLE IF EXISTS inventory_allocations CASCADE;
-- DROP TABLE IF EXISTS defects CASCADE;
-- DROP TABLE IF EXISTS barcodes CASCADE;
-- DROP TABLE IF EXISTS vocabulary_mappings CASCADE;
-- DROP TABLE IF EXISTS inventory CASCADE;
-- DROP TABLE IF EXISTS mtos CASCADE;
-- DROP TABLE IF EXISTS purchase_orders CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS companies CASCADE;

-- 1. Create companies table (brands and factories)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('brand', 'factory')),
  code VARCHAR(100) UNIQUE,
  address TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create users table (FIXED - removed company_type)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL,
  company_id UUID REFERENCES companies(id),
  active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create purchase_orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(100) UNIQUE NOT NULL,
  brand_id UUID REFERENCES companies(id),
  factory_id UUID REFERENCES companies(id),
  status VARCHAR(50) DEFAULT 'not_started',
  order_date DATE,
  total_mtos INTEGER DEFAULT 0,
  customer_code VARCHAR(100),
  total_amount DECIMAL(12,2),
  requested_ship_date DATE,
  vendor_info JSONB DEFAULT '{}',
  ship_to_info JSONB DEFAULT '{}',
  po_type VARCHAR(50) DEFAULT 'standard',
  source_format VARCHAR(50),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create main MTOs table with ALL fields from your Excel format
CREATE TABLE IF NOT EXISTS mtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID REFERENCES purchase_orders(id),
  brand_id UUID REFERENCES companies(id),
  factory_id UUID REFERENCES companies(id),
  
  -- Core MTO fields
  internal_id VARCHAR(100) UNIQUE,
  po_line_id VARCHAR(100),
  display_name VARCHAR(500),
  reference_number VARCHAR(200),
  quantity INTEGER DEFAULT 1,
  
  -- Status and production
  status VARCHAR(50) DEFAULT 'pending',
  production_stage VARCHAR(50) DEFAULT 'receive',
  production_category VARCHAR(50) DEFAULT 'monthly',
  priority VARCHAR(50) DEFAULT 'normal',
  is_replacement BOOLEAN DEFAULT false,
  is_rush BOOLEAN DEFAULT false,
  
  -- All date fields from your Excel
  expected_ship_date DATE,
  actual_ship_date DATE,
  mto_vendor_replacement_expected_ship_date DATE,
  mto_vendor_replacement_actual_ship_date DATE,
  order_submit_date DATE,
  so_date DATE,
  shopify_order_date TIMESTAMP WITH TIME ZONE,
  cpsd DATE,
  customer_so_date DATE,
  vendor_ready_date DATE,
  est_customer_receipt_date DATE,
  
  -- Tracking and order fields
  sales_order_number VARCHAR(200),
  po_line_tracking VARCHAR(200),
  po_line_mto_replacement_tracking VARCHAR(200),
  awb VARCHAR(200),
  po_line_carton VARCHAR(200),
  master_carton VARCHAR(200),
  vendor_po_status VARCHAR(100),
  po_line_invoice VARCHAR(200),
  replacement_invoice VARCHAR(200),
  shopify_order_number VARCHAR(200),
  etail_order_line_id VARCHAR(200),
  customer_order_number VARCHAR(200),
  
  -- Product details
  bag_base_pid VARCHAR(200),
  pid VARCHAR(200),
  item VARCHAR(200),
  primary_style_name VARCHAR(200),
  mto_fg_base_sku VARCHAR(200),
  internal_sku VARCHAR(200),
  
  -- Traditional 6 spots
  spot1 VARCHAR(200),
  spot2 VARCHAR(200),
  spot3 VARCHAR(200),
  spot4 VARCHAR(200),
  spot5 VARCHAR(200),
  spot6 VARCHAR(200),
  spot1_patch_ref VARCHAR(200),
  spot2_patch_ref VARCHAR(200),
  spot3_patch_ref VARCHAR(200),
  spot4_patch_ref VARCHAR(200),
  spot5_patch_ref VARCHAR(200),
  spot6_patch_ref VARCHAR(200),
  
  -- Flexible spots data (JSONB) for unlimited spots
  spots_data JSONB DEFAULT '[]',
  
  -- Customization fields
  customization_text TEXT,
  vendor_mto_base_color VARCHAR(100),
  vendor_mto_letter_color VARCHAR(100),
  product_size VARCHAR(100),
  product_color VARCHAR(100),
  
  -- Comments and notes
  vendor_po_comments TEXT,
  production_po_comments TEXT,
  replacement_reason TEXT,
  order_type VARCHAR(100),
  
  -- Financial fields
  hts_code VARCHAR(50),
  packaging_code VARCHAR(100),
  mto_labor_cost DECIMAL(10,2),
  po_purchase_price DECIMAL(10,2),
  po_ext_fob DECIMAL(10,2),
  fob_cost DECIMAL(10,2),
  ext_fob DECIMAL(10,2),
  first_cost DECIMAL(10,2),
  item_cost DECIMAL(10,2),
  po_cost DECIMAL(10,2),
  ext_po_cost DECIMAL(10,2),
  
  -- Vendor information
  vendor_name VARCHAR(255),
  vendor_address TEXT,
  ship_to_address TEXT,
  vendor_po_sent_to VARCHAR(255),
  
  -- Production tracking
  mto_production_lt INTEGER,
  expected_production_lt INTEGER,
  expected_production_lt_delay INTEGER,
  actual_production_lt INTEGER,
  actual_production_lt_delay INTEGER,
  est_cpsd_from_exp_xf DATE,
  est_cpsd_from_act_xf DATE,
  est_cpsd_delay INTEGER,
  days_late INTEGER,
  
  -- Additional fields
  po_customer_type VARCHAR(100),
  mto_program VARCHAR(100),
  mto_holiday_guarantee VARCHAR(50),
  single_vs_multiple_lines VARCHAR(50),
  single_vs_multiple_qty VARCHAR(50),
  quantity_fulfilled_received INTEGER,
  text_length INTEGER,
  
  -- SO related
  so_line_id VARCHAR(100),
  so_internal_id VARCHAR(100),
  so_status VARCHAR(100),
  
  -- Concatenated fields
  concat_po_internal_po_line VARCHAR(200),
  
  -- Metadata
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255),
  category VARCHAR(100),
  current_stock INTEGER DEFAULT 0,
  reserved_stock INTEGER DEFAULT 0,
  available_stock INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 100,
  reorder_quantity INTEGER DEFAULT 500,
  unit_cost DECIMAL(10,2),
  location VARCHAR(200),
  supplier VARCHAR(255),
  last_restocked_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create vocabulary_mappings table
CREATE TABLE IF NOT EXISTS vocabulary_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES companies(id),
  factory_id UUID REFERENCES companies(id),
  brand_sku VARCHAR(100) NOT NULL,
  brand_description TEXT,
  brand_category VARCHAR(100),
  factory_sku VARCHAR(100),
  factory_description TEXT,
  factory_material_code VARCHAR(100),
  factory_category VARCHAR(100),
  patch_type VARCHAR(50),
  patch_position VARCHAR(100),
  complexity_level VARCHAR(20) DEFAULT 'medium',
  production_time_minutes INTEGER,
  special_instructions TEXT,
  reference_images TEXT[],
  technical_drawings TEXT[],
  active BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand_id, brand_sku, factory_id)
);

-- 7. Create barcodes table
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

-- 8. Create defects table
CREATE TABLE IF NOT EXISTS defects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mto_id UUID NOT NULL REFERENCES mtos(id) ON DELETE CASCADE,
  type VARCHAR(100),
  description TEXT,
  severity VARCHAR(50) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'open',
  photos TEXT[],
  reported_by UUID REFERENCES users(id),
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create inventory_allocations table
CREATE TABLE IF NOT EXISTS inventory_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mto_id UUID NOT NULL REFERENCES mtos(id) ON DELETE CASCADE,
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  allocated_quantity INTEGER NOT NULL,
  allocation_type VARCHAR(50) DEFAULT 'auto',
  allocated_by UUID REFERENCES users(id),
  allocation_status VARCHAR(50) DEFAULT 'reserved',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create status history tables
CREATE TABLE IF NOT EXISTS mto_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mto_id UUID NOT NULL REFERENCES mtos(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  changed_by UUID REFERENCES users(id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS production_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mto_id UUID NOT NULL REFERENCES mtos(id) ON DELETE CASCADE,
  old_stage VARCHAR(50),
  new_stage VARCHAR(50),
  changed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mtos_po_id ON mtos(po_id);
CREATE INDEX IF NOT EXISTS idx_mtos_brand_id ON mtos(brand_id);
CREATE INDEX IF NOT EXISTS idx_mtos_factory_id ON mtos(factory_id);
CREATE INDEX IF NOT EXISTS idx_mtos_status ON mtos(status);
CREATE INDEX IF NOT EXISTS idx_mtos_production_stage ON mtos(production_stage);
CREATE INDEX IF NOT EXISTS idx_mtos_internal_id ON mtos(internal_id);
CREATE INDEX IF NOT EXISTS idx_mtos_reference_number ON mtos(reference_number);
CREATE INDEX IF NOT EXISTS idx_mtos_created_at ON mtos(created_at);
CREATE INDEX IF NOT EXISTS idx_mtos_shopify_order_number ON mtos(shopify_order_number);
CREATE INDEX IF NOT EXISTS idx_mtos_sales_order_number ON mtos(sales_order_number);

-- 12. Insert demo companies (brand and factory)
INSERT INTO companies (id, name, type, code) VALUES
  ('123e4567-e89b-12d3-a456-426614174000', 'Bauble Bar', 'brand', 'BB001'),
  ('123e4567-e89b-12d3-a456-426614174001', 'All Brands Unlimited', 'factory', 'F001')
ON CONFLICT (id) DO NOTHING;

-- 13. Insert demo users (FIXED - removed company_type column)
-- Password is 'password123' hashed with bcrypt
INSERT INTO users (email, password_hash, full_name, role, company_id) VALUES
  ('brand@demo.com', '$2b$10$LQv3Y5V1W9K3PO1XZ7kJx.8jX5gtI.8R7TbKFE9Y2K7PWxmHJNkDO', 'Brand User', 'brand_user', '123e4567-e89b-12d3-a456-426614174000'),
  ('factory@demo.com', '$2b$10$LQv3Y5V1W9K3PO1XZ7kJx.8jX5gtI.8R7TbKFE9Y2K7PWxmHJNkDO', 'Factory User', 'factory_user', '123e4567-e89b-12d3-a456-426614174001'),
  ('admin@demo.com', '$2b$10$LQv3Y5V1W9K3PO1XZ7kJx.8jX5gtI.8R7TbKFE9Y2K7PWxmHJNkDO', 'Admin User', 'admin', NULL)
ON CONFLICT (email) DO NOTHING;

-- 14. Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE mtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE barcodes ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (adjust as needed)
CREATE POLICY "Enable all access for authenticated users" ON mtos
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users" ON purchase_orders
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users" ON inventory
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users" ON vocabulary_mappings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users" ON barcodes
  FOR ALL USING (true) WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database setup completed successfully!';
  RAISE NOTICE 'Tables created: companies, users, purchase_orders, mtos, inventory, vocabulary_mappings, barcodes, defects, and related tables';
  RAISE NOTICE 'Demo users created: brand@demo.com, factory@demo.com, admin@demo.com (password: password123)';
  RAISE NOTICE 'The MTO table now supports ALL fields from your complex Excel format!';
END $$;