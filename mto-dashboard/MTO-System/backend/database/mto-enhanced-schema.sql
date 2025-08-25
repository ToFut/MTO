-- Enhanced MTO Schema for Bauble Bar PO Format Support
-- This schema supports both traditional 6-spot MTOs and flexible multi-spot configurations

-- Add new columns to MTOs table for enhanced PO support
ALTER TABLE mtos ADD COLUMN IF NOT EXISTS spots_data JSONB DEFAULT '[]';
ALTER TABLE mtos ADD COLUMN IF NOT EXISTS po_customer VARCHAR(255);
ALTER TABLE mtos ADD COLUMN IF NOT EXISTS hts_code VARCHAR(50);
ALTER TABLE mtos ADD COLUMN IF NOT EXISTS packaging_code VARCHAR(100);
ALTER TABLE mtos ADD COLUMN IF NOT EXISTS fob_cost DECIMAL(10,2);
ALTER TABLE mtos ADD COLUMN IF NOT EXISTS ext_fob DECIMAL(10,2);
ALTER TABLE mtos ADD COLUMN IF NOT EXISTS first_cost DECIMAL(10,2);
ALTER TABLE mtos ADD COLUMN IF NOT EXISTS vendor_name VARCHAR(255);
ALTER TABLE mtos ADD COLUMN IF NOT EXISTS vendor_address TEXT;
ALTER TABLE mtos ADD COLUMN IF NOT EXISTS ship_to_address TEXT;

-- Add PO metadata columns to purchase_orders table
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS customer_code VARCHAR(100);
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12,2);
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS requested_ship_date DATE;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS vendor_info JSONB DEFAULT '{}';
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS ship_to_info JSONB DEFAULT '{}';
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS po_type VARCHAR(50) DEFAULT 'standard';
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS source_format VARCHAR(50); -- 'BaublePO', 'MTO', etc.

-- Create a spots table for detailed spot tracking (optional, for reporting)
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

-- Create vocabulary mappings table for SKU translations
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

-- Create barcodes table for tracking
CREATE TABLE IF NOT EXISTS barcodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mto_id UUID NOT NULL REFERENCES mtos(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'line', 'spot', 'master', 'carton'
  value TEXT NOT NULL,
  spot_number INTEGER,
  scanned_count INTEGER DEFAULT 0,
  last_scanned_at TIMESTAMP WITH TIME ZONE,
  last_scanned_by UUID REFERENCES users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create PO line items table for detailed tracking
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

-- Create inventory allocations table
CREATE TABLE IF NOT EXISTS inventory_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mto_id UUID NOT NULL REFERENCES mtos(id) ON DELETE CASCADE,
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  
  allocated_quantity INTEGER NOT NULL,
  allocation_type VARCHAR(50) DEFAULT 'auto', -- 'auto', 'manual', 'reserved'
  allocated_by UUID REFERENCES users(id),
  released_at TIMESTAMP WITH TIME ZONE,
  released_by UUID REFERENCES users(id),
  
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(mto_id, inventory_id)
);

-- Create production history table
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

-- Create MTO status history table
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

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_mtos_spots_data ON mtos USING GIN (spots_data);
CREATE INDEX IF NOT EXISTS idx_mtos_po_customer ON mtos(po_customer);
CREATE INDEX IF NOT EXISTS idx_mtos_hts_code ON mtos(hts_code);

CREATE INDEX IF NOT EXISTS idx_mto_spots_mto_id ON mto_spots(mto_id);
CREATE INDEX IF NOT EXISTS idx_mto_spots_position ON mto_spots(position);
CREATE INDEX IF NOT EXISTS idx_mto_spots_sku ON mto_spots(sku);

CREATE INDEX IF NOT EXISTS idx_vocabulary_brand_sku ON vocabulary_mappings(brand_sku);
CREATE INDEX IF NOT EXISTS idx_vocabulary_factory_sku ON vocabulary_mappings(factory_sku);
CREATE INDEX IF NOT EXISTS idx_vocabulary_brand_id ON vocabulary_mappings(brand_id);

CREATE INDEX IF NOT EXISTS idx_barcodes_mto_id ON barcodes(mto_id);
CREATE INDEX IF NOT EXISTS idx_barcodes_type ON barcodes(type);
CREATE INDEX IF NOT EXISTS idx_barcodes_value ON barcodes(value);

CREATE INDEX IF NOT EXISTS idx_po_line_items_po_id ON po_line_items(po_id);
CREATE INDEX IF NOT EXISTS idx_po_line_items_pid ON po_line_items(pid);

-- Add triggers for new tables
CREATE TRIGGER update_mto_spots_updated_at BEFORE UPDATE ON mto_spots 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vocabulary_mappings_updated_at BEFORE UPDATE ON vocabulary_mappings 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_barcodes_updated_at BEFORE UPDATE ON barcodes 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_po_line_items_updated_at BEFORE UPDATE ON po_line_items 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_allocations_updated_at BEFORE UPDATE ON inventory_allocations 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample view for MTO dashboard with spots count
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
  p.po_number,
  p.brand_id,
  p.factory_id,
  COALESCE(jsonb_array_length(m.spots_data), 0) as spot_count,
  m.spots_data,
  m.created_at,
  m.updated_at
FROM mtos m
JOIN purchase_orders p ON m.po_id = p.id;

-- Grant appropriate permissions
GRANT SELECT ON mto_dashboard_view TO authenticated;
GRANT ALL ON mtos TO authenticated;
GRANT ALL ON purchase_orders TO authenticated;
GRANT ALL ON mto_spots TO authenticated;
GRANT ALL ON vocabulary_mappings TO authenticated;
GRANT ALL ON barcodes TO authenticated;
GRANT ALL ON po_line_items TO authenticated;