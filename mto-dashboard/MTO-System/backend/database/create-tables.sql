-- MTO Platform Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET timezone TO 'UTC';

-- Companies table (Brands and Factories)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'brand_manager', 'factory_operator', 'viewer')),
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

-- Purchase Orders table
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number VARCHAR(100) UNIQUE NOT NULL,
  brand_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  factory_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  total_units INTEGER NOT NULL DEFAULT 0,
  completed_units INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_production', 'completed', 'cancelled')),
  expected_completion_date DATE,
  actual_completion_date DATE,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES users(id),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MTOs table (Main production items)
CREATE TABLE mtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  
  -- Customization spots (6 spots)
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
  
  -- Status and workflow
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'proceed', 'in_production', 'qc', 'shipping', 'shipped', 'delivered', 'cancelled')),
  production_stage VARCHAR(50) CHECK (production_stage IN ('receive', 'cutting', 'sewing', 'embroidery', 'qc', 'packing', 'ready')),
  production_category VARCHAR(20) DEFAULT 'daily' CHECK (production_category IN ('daily', 'monthly')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  
  -- QC Information
  qc_status VARCHAR(50),
  qc_date DATE,
  qc_notes TEXT,
  qc_photos TEXT[], -- Array of photo URLs
  
  -- Defect handling
  is_replacement BOOLEAN DEFAULT false,
  is_rush BOOLEAN DEFAULT false,
  defect_type VARCHAR(50) CHECK (defect_type IN ('missing', 'defect_bag', 'production_defect', 'embroidery_defect', 'wrong_patch', 'damaged')),
  defect_description TEXT,
  parent_mto_id UUID REFERENCES mtos(id),
  
  -- Communication
  chat_enabled BOOLEAN DEFAULT true,
  unread_messages INTEGER DEFAULT 0,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory table
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mto_id UUID NOT NULL REFERENCES mtos(id) ON DELETE CASCADE,
  
  -- Item details
  sku VARCHAR(100) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  
  -- Quantities
  required_quantity INTEGER NOT NULL DEFAULT 0,
  available_quantity INTEGER NOT NULL DEFAULT 0,
  allocated_quantity INTEGER NOT NULL DEFAULT 0,
  gap_quantity INTEGER GENERATED ALWAYS AS (required_quantity - available_quantity) STORED,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'allocated', 'shipped', 'shortage')),
  
  -- Location and tracking
  location VARCHAR(100),
  supplier VARCHAR(255),
  batch_number VARCHAR(100),
  expiry_date DATE,
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Defects table
CREATE TABLE defects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mto_id UUID NOT NULL REFERENCES mtos(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES users(id),
  
  -- Defect details
  defect_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  location_description TEXT,
  
  -- Images and documentation
  photos TEXT[] DEFAULT '{}',
  attachments TEXT[] DEFAULT '{}',
  
  -- Resolution
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed', 'cannot_reproduce')),
  resolution_description TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Replacement handling
  replacement_required BOOLEAN DEFAULT false,
  replacement_mto_id UUID REFERENCES mtos(id),
  
  -- Costs
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipments table
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_id UUID NOT NULL REFERENCES purchase_orders(id),
  
  -- Shipment details
  shipment_number VARCHAR(100) UNIQUE NOT NULL,
  carrier VARCHAR(100),
  tracking_number VARCHAR(200),
  awb VARCHAR(100),
  
  -- Dates
  ship_date DATE,
  estimated_delivery DATE,
  actual_delivery DATE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'preparing' CHECK (status IN ('preparing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'exception')),
  
  -- Destination
  destination_address TEXT,
  recipient_name VARCHAR(255),
  recipient_phone VARCHAR(50),
  
  -- Shipment details
  total_items INTEGER DEFAULT 0,
  total_weight DECIMAL(10,2),
  dimensions VARCHAR(100),
  
  -- Costs
  shipping_cost DECIMAL(10,2),
  
  -- Tracking
  tracking_events JSONB DEFAULT '[]',
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipment Items table (Many-to-many between shipments and MTOs)
CREATE TABLE shipment_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  mto_id UUID NOT NULL REFERENCES mtos(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(shipment_id, mto_id)
);

-- Chat Messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mto_id UUID NOT NULL REFERENCES mtos(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  
  -- Message content
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  
  -- Attachments
  attachments JSONB DEFAULT '[]',
  
  -- Status
  read_by JSONB DEFAULT '{}', -- JSON object tracking who has read the message
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics and Audit tables
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_mtos_po_id ON mtos(po_id);
CREATE INDEX idx_mtos_status ON mtos(status);
CREATE INDEX idx_mtos_internal_id ON mtos(internal_id);
CREATE INDEX idx_mtos_reference_number ON mtos(reference_number);
CREATE INDEX idx_mtos_production_category ON mtos(production_category);
CREATE INDEX idx_mtos_priority ON mtos(priority);
CREATE INDEX idx_mtos_expected_ship_date ON mtos(expected_ship_date);

CREATE INDEX idx_inventory_mto_id ON inventory(mto_id);
CREATE INDEX idx_inventory_status ON inventory(status);
CREATE INDEX idx_inventory_sku ON inventory(sku);

CREATE INDEX idx_defects_mto_id ON defects(mto_id);
CREATE INDEX idx_defects_status ON defects(status);
CREATE INDEX idx_defects_created_at ON defects(created_at);

CREATE INDEX idx_chat_messages_mto_id ON chat_messages(mto_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mtos_updated_at BEFORE UPDATE ON mtos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_defects_updated_at BEFORE UPDATE ON defects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();