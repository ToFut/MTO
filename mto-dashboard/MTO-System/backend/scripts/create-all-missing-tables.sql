-- CREATE ALL MISSING TABLES FOR MTO SYSTEM
-- Run this in Supabase SQL Editor

-- 1. Create purchase_orders table
CREATE TABLE purchase_orders (
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

-- 2. Create workspaces table
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  brand_id UUID NOT NULL REFERENCES companies(id),
  factory_id UUID REFERENCES companies(id),
  po_id UUID REFERENCES purchase_orders(id),
  type VARCHAR(50) DEFAULT 'production',
  status VARCHAR(50) DEFAULT 'active',
  production_category VARCHAR(50) NOT NULL,
  start_date DATE,
  target_completion_date DATE,
  actual_completion_date DATE,
  total_mtos INTEGER DEFAULT 0,
  completed_mtos INTEGER DEFAULT 0,
  pending_mtos INTEGER DEFAULT 0,
  defective_mtos INTEGER DEFAULT 0,
  auto_assign BOOLEAN DEFAULT true,
  priority_level INTEGER DEFAULT 1,
  settings JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create main MTOs table
CREATE TABLE mtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id),
  po_id UUID REFERENCES purchase_orders(id),
  brand_id UUID NOT NULL REFERENCES companies(id),
  factory_id UUID REFERENCES companies(id),
  
  -- Core MTO fields
  internal_id VARCHAR(100) UNIQUE NOT NULL,
  po_line_id VARCHAR(100),
  display_name VARCHAR(500) NOT NULL,
  reference_number VARCHAR(200),
  quantity INTEGER DEFAULT 1,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending',
  production_stage VARCHAR(50) DEFAULT 'receive',
  production_category VARCHAR(50),
  priority VARCHAR(50) DEFAULT 'normal',
  
  -- Key dates
  expected_ship_date DATE,
  actual_ship_date DATE,
  
  -- Flexible data storage for ALL Excel fields
  excel_data JSONB DEFAULT '{}',
  spots_data JSONB DEFAULT '[]',
  
  -- Assignment
  assigned_to UUID REFERENCES users(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create inventory table
CREATE TABLE inventory (
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
  factory_id UUID REFERENCES companies(id),
  last_restocked_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create vocabulary_mappings table
CREATE TABLE vocabulary_mappings (
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

-- 6. Create barcodes table
CREATE TABLE barcodes (
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

-- 7. Create defects table
CREATE TABLE defects (
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

-- 8. Create brand_factory_assignments table
CREATE TABLE brand_factory_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES companies(id),
  factory_id UUID NOT NULL REFERENCES companies(id),
  active BOOLEAN DEFAULT true,
  assigned_by UUID REFERENCES users(id),
  assignment_type VARCHAR(50) DEFAULT 'standard',
  capacity_allocation INTEGER,
  priority_level INTEGER DEFAULT 1,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand_id, factory_id)
);

-- 9. Create production_lines table
CREATE TABLE production_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id UUID NOT NULL REFERENCES companies(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  capacity_per_day INTEGER,
  active BOOLEAN DEFAULT true,
  current_workspace_id UUID REFERENCES workspaces(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create production_schedule table
CREATE TABLE production_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  production_line_id UUID REFERENCES production_lines(id),
  mto_id UUID NOT NULL REFERENCES mtos(id),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  estimated_duration_minutes INTEGER,
  status VARCHAR(50) DEFAULT 'scheduled',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_worker UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Create inventory_allocations table
CREATE TABLE inventory_allocations (
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

-- 12. Create status history tables
CREATE TABLE mto_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mto_id UUID NOT NULL REFERENCES mtos(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  changed_by UUID REFERENCES users(id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE production_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mto_id UUID NOT NULL REFERENCES mtos(id) ON DELETE CASCADE,
  old_stage VARCHAR(50),
  new_stage VARCHAR(50),
  changed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Create indexes for performance
CREATE INDEX idx_mtos_po_id ON mtos(po_id);
CREATE INDEX idx_mtos_brand_id ON mtos(brand_id);
CREATE INDEX idx_mtos_factory_id ON mtos(factory_id);
CREATE INDEX idx_mtos_status ON mtos(status);
CREATE INDEX idx_mtos_production_stage ON mtos(production_stage);
CREATE INDEX idx_mtos_internal_id ON mtos(internal_id);
CREATE INDEX idx_mtos_reference_number ON mtos(reference_number);
CREATE INDEX idx_mtos_created_at ON mtos(created_at);

CREATE INDEX idx_workspaces_brand_id ON workspaces(brand_id);
CREATE INDEX idx_workspaces_factory_id ON workspaces(factory_id);
CREATE INDEX idx_workspaces_status ON workspaces(status);
CREATE INDEX idx_workspaces_production_category ON workspaces(production_category);

CREATE INDEX idx_inventory_sku ON inventory(sku);
CREATE INDEX idx_inventory_factory_id ON inventory(factory_id);

-- 14. Create the critical brand-factory assignment
INSERT INTO brand_factory_assignments (
  brand_id,
  factory_id,
  active,
  assignment_type,
  capacity_allocation,
  priority_level
) 
SELECT 
  c1.id as brand_id,
  c2.id as factory_id,
  true,
  'preferred',
  100,
  1
FROM companies c1, companies c2 
WHERE c1.type = 'brand' AND c2.type = 'factory';

-- 15. Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '🎯 ALL TABLES CREATED SUCCESSFULLY!';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Created 13 missing tables:';
  RAISE NOTICE '  - purchase_orders, mtos, workspaces';
  RAISE NOTICE '  - inventory, vocabulary_mappings, barcodes';
  RAISE NOTICE '  - defects, brand_factory_assignments';
  RAISE NOTICE '  - production_lines, production_schedule';
  RAISE NOTICE '  - inventory_allocations, status history';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Created brand-factory assignment';
  RAISE NOTICE '✅ Added performance indexes';
  RAISE NOTICE '✅ Granted necessary permissions';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 DATABASE IS NOW READY FOR MTO UPLOADS!';
END $$;