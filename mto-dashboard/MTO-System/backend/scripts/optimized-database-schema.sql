-- Optimized Database Schema for MTO System
-- Designed for Admin → Brand → Factory workflow

-- ============================================
-- CORE ENTITIES
-- ============================================

-- 1. Companies (Brands & Factories)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('brand', 'factory')),
  code VARCHAR(100) UNIQUE,
  address TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}', -- Company-specific settings
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Brand-Factory Relationships (Admin manages these)
CREATE TABLE IF NOT EXISTS brand_factory_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES companies(id),
  factory_id UUID NOT NULL REFERENCES companies(id),
  active BOOLEAN DEFAULT true,
  assigned_by UUID REFERENCES users(id),
  assignment_type VARCHAR(50) DEFAULT 'standard', -- 'standard', 'preferred', 'exclusive'
  capacity_allocation INTEGER, -- Percentage of factory capacity for this brand
  priority_level INTEGER DEFAULT 1, -- 1-5, higher = more priority
  settings JSONB DEFAULT '{}', -- Relationship-specific settings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand_id, factory_id)
);

-- 3. Users with proper role management
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'brand_user', 'factory_user', 'viewer')),
  company_id UUID REFERENCES companies(id),
  permissions JSONB DEFAULT '{}', -- Granular permissions
  active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- WORKSPACE & PRODUCTION MANAGEMENT
-- ============================================

-- 4. Workspaces (Created when Brand uploads MTOs)
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  brand_id UUID NOT NULL REFERENCES companies(id),
  factory_id UUID NOT NULL REFERENCES companies(id),
  po_id UUID REFERENCES purchase_orders(id),
  
  -- Workspace configuration
  type VARCHAR(50) DEFAULT 'production', -- 'production', 'sample', 'rush'
  status VARCHAR(50) DEFAULT 'active', -- 'draft', 'active', 'paused', 'completed'
  production_category VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly'
  
  -- Scheduling
  start_date DATE,
  target_completion_date DATE,
  actual_completion_date DATE,
  
  -- Metrics
  total_mtos INTEGER DEFAULT 0,
  completed_mtos INTEGER DEFAULT 0,
  pending_mtos INTEGER DEFAULT 0,
  defective_mtos INTEGER DEFAULT 0,
  
  -- Settings
  auto_assign BOOLEAN DEFAULT true, -- Auto-assign MTOs to production lines
  priority_level INTEGER DEFAULT 1,
  settings JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Purchase Orders (Enhanced)
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(100) UNIQUE NOT NULL,
  brand_id UUID NOT NULL REFERENCES companies(id),
  factory_id UUID REFERENCES companies(id), -- Can be NULL initially, assigned by admin
  workspace_id UUID REFERENCES workspaces(id),
  
  -- PO Details
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'pending_assignment', 'assigned', 'in_production', 'completed'
  production_category VARCHAR(50), -- 'daily', 'weekly', 'monthly'
  order_date DATE,
  requested_ship_date DATE,
  
  -- Assignment tracking
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  
  -- Metrics
  total_mtos INTEGER DEFAULT 0,
  total_quantity INTEGER DEFAULT 0,
  total_amount DECIMAL(12,2),
  
  -- File references
  original_file_url TEXT,
  processed_file_url TEXT,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MTOs (Simplified for essential fields + JSONB for flexibility)
CREATE TABLE IF NOT EXISTS mtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id),
  po_id UUID REFERENCES purchase_orders(id),
  brand_id UUID NOT NULL REFERENCES companies(id),
  factory_id UUID REFERENCES companies(id),
  
  -- Essential fields
  internal_id VARCHAR(100) UNIQUE NOT NULL,
  po_line_id VARCHAR(100),
  display_name VARCHAR(500) NOT NULL,
  reference_number VARCHAR(200),
  quantity INTEGER DEFAULT 1,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending',
  production_stage VARCHAR(50) DEFAULT 'receive',
  production_category VARCHAR(50), -- Inherited from PO/Workspace
  priority VARCHAR(50) DEFAULT 'normal',
  
  -- Key dates
  expected_ship_date DATE,
  actual_ship_date DATE,
  
  -- Flexible data storage for ALL Excel fields
  excel_data JSONB DEFAULT '{}', -- Store all original Excel data
  spots_data JSONB DEFAULT '[]', -- Store customization spots
  
  -- Assignment
  assigned_to UUID REFERENCES users(id), -- Factory worker assignment
  assigned_at TIMESTAMP WITH TIME ZONE,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PRODUCTION TRACKING
-- ============================================

-- 7. Production Lines (Factory resources)
CREATE TABLE IF NOT EXISTS production_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id UUID NOT NULL REFERENCES companies(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50), -- 'embroidery', 'printing', 'assembly', etc.
  capacity_per_day INTEGER,
  active BOOLEAN DEFAULT true,
  current_workspace_id UUID REFERENCES workspaces(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Production Schedule
CREATE TABLE IF NOT EXISTS production_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  production_line_id UUID REFERENCES production_lines(id),
  mto_id UUID NOT NULL REFERENCES mtos(id),
  
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  estimated_duration_minutes INTEGER,
  
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'delayed'
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  assigned_worker UUID REFERENCES users(id),
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SUPPORTING TABLES
-- ============================================

-- 9. Inventory (Auto-populated from MTOs)
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255),
  category VARCHAR(100),
  current_stock INTEGER DEFAULT 0,
  reserved_stock INTEGER DEFAULT 0,
  available_stock INTEGER GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
  reorder_level INTEGER DEFAULT 100,
  factory_id UUID REFERENCES companies(id), -- Which factory stocks this
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Workspace Activity Log
CREATE TABLE IF NOT EXISTS workspace_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  mto_id UUID REFERENCES mtos(id),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL, -- 'created', 'assigned', 'started', 'completed', etc.
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_workspaces_brand_id ON workspaces(brand_id);
CREATE INDEX idx_workspaces_factory_id ON workspaces(factory_id);
CREATE INDEX idx_workspaces_status ON workspaces(status);
CREATE INDEX idx_workspaces_production_category ON workspaces(production_category);

CREATE INDEX idx_mtos_workspace_id ON mtos(workspace_id);
CREATE INDEX idx_mtos_status ON mtos(status);
CREATE INDEX idx_mtos_production_stage ON mtos(production_stage);
CREATE INDEX idx_mtos_internal_id ON mtos(internal_id);

CREATE INDEX idx_production_schedule_workspace_id ON production_schedule(workspace_id);
CREATE INDEX idx_production_schedule_scheduled_date ON production_schedule(scheduled_date);

CREATE INDEX idx_workspace_activity_workspace_id ON workspace_activity(workspace_id);
CREATE INDEX idx_workspace_activity_created_at ON workspace_activity(created_at);

-- ============================================
-- VIEWS FOR EASY QUERYING
-- ============================================

-- Brand Dashboard View
CREATE OR REPLACE VIEW brand_dashboard AS
SELECT 
  w.id as workspace_id,
  w.name as workspace_name,
  w.production_category,
  w.status,
  w.total_mtos,
  w.completed_mtos,
  ROUND((w.completed_mtos::numeric / NULLIF(w.total_mtos, 0)) * 100, 2) as completion_percentage,
  c.name as factory_name,
  w.target_completion_date,
  w.created_at
FROM workspaces w
JOIN companies c ON w.factory_id = c.id;

-- Factory Dashboard View
CREATE OR REPLACE VIEW factory_dashboard AS
SELECT 
  w.id as workspace_id,
  w.name as workspace_name,
  b.name as brand_name,
  w.production_category,
  w.total_mtos,
  w.pending_mtos,
  w.priority_level,
  w.target_completion_date,
  COUNT(DISTINCT ps.id) as scheduled_items,
  w.created_at
FROM workspaces w
JOIN companies b ON w.brand_id = b.id
LEFT JOIN production_schedule ps ON ps.workspace_id = w.id
GROUP BY w.id, b.name;

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert demo companies
INSERT INTO companies (id, name, type, code) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Bauble Bar', 'brand', 'BB001'),
  ('22222222-2222-2222-2222-222222222222', 'All Brands Unlimited', 'factory', 'ABU001'),
  ('33333333-3333-3333-3333-333333333333', 'Premium Factory Co', 'factory', 'PFC001')
ON CONFLICT (id) DO NOTHING;

-- Create brand-factory relationships
INSERT INTO brand_factory_assignments (brand_id, factory_id, assignment_type, capacity_allocation, priority_level) VALUES
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'preferred', 60, 1),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'standard', 40, 2)
ON CONFLICT (brand_id, factory_id) DO NOTHING;

-- Insert demo users
INSERT INTO users (email, password_hash, full_name, role, company_id) VALUES
  ('admin@mto.com', '$2b$10$LQv3Y5V1W9K3PO1XZ7kJx.8jX5gtI.8R7TbKFE9Y2K7PWxmHJNkDO', 'System Admin', 'admin', NULL),
  ('brand@baublebar.com', '$2b$10$LQv3Y5V1W9K3PO1XZ7kJx.8jX5gtI.8R7TbKFE9Y2K7PWxmHJNkDO', 'BB Manager', 'brand_user', '11111111-1111-1111-1111-111111111111'),
  ('factory@abu.com', '$2b$10$LQv3Y5V1W9K3PO1XZ7kJx.8jX5gtI.8R7TbKFE9Y2K7PWxmHJNkDO', 'ABU Manager', 'factory_user', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (email) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Optimized database schema created successfully!';
  RAISE NOTICE '📊 Key features:';
  RAISE NOTICE '  - Workspace-based production management';
  RAISE NOTICE '  - Admin-managed brand-factory relationships';
  RAISE NOTICE '  - Flexible MTO data storage with JSONB';
  RAISE NOTICE '  - Production scheduling and tracking';
  RAISE NOTICE '  - Dashboard views for brands and factories';
END $$;