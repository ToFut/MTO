-- Performance optimization indexes for MTO System
-- These should be run on the Supabase database

-- MTOs table indexes
CREATE INDEX IF NOT EXISTS idx_mtos_brand_status ON mtos(brand_id, status);
CREATE INDEX IF NOT EXISTS idx_mtos_factory_stage ON mtos(factory_id, production_stage);
CREATE INDEX IF NOT EXISTS idx_mtos_priority ON mtos(priority, expected_ship_date);
CREATE INDEX IF NOT EXISTS idx_mtos_created_at ON mtos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mtos_internal_id ON mtos(internal_id);

-- Inventory table indexes  
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku_code);
CREATE INDEX IF NOT EXISTS idx_inventory_brand ON inventory(brand_id, category);
CREATE INDEX IF NOT EXISTS idx_inventory_reorder ON inventory(quantity_available, reorder_point);

-- Chat messages indexes
CREATE INDEX IF NOT EXISTS idx_chat_mto_time ON chat_messages(mto_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_unread ON chat_messages(mto_id, read_by);

-- Defects table indexes
CREATE INDEX IF NOT EXISTS idx_defects_mto ON defects(mto_id, status);
CREATE INDEX IF NOT EXISTS idx_defects_reported ON defects(reported_at DESC);
CREATE INDEX IF NOT EXISTS idx_defects_type_stage ON defects(defect_type, production_stage);

-- Shipments table indexes
CREATE INDEX IF NOT EXISTS idx_shipments_awb ON shipments(awb);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status, created_at);
CREATE INDEX IF NOT EXISTS idx_shipments_factory ON shipments(factory_id, status);

-- Purchase orders indexes
CREATE INDEX IF NOT EXISTS idx_pos_brand ON purchase_orders(brand_id, status);
CREATE INDEX IF NOT EXISTS idx_pos_number ON purchase_orders(po_number);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_company_role ON users(company_id, role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Workspaces indexes
CREATE INDEX IF NOT EXISTS idx_workspaces_brand_factory ON workspaces(brand_id, factory_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_status ON workspaces(status, created_at DESC);

-- Production history indexes (if table exists)
CREATE INDEX IF NOT EXISTS idx_production_history_mto ON production_history(mto_id, changed_at DESC);

-- Barcodes indexes
CREATE INDEX IF NOT EXISTS idx_barcodes_mto ON barcodes(mto_id, barcode_type);
CREATE INDEX IF NOT EXISTS idx_barcodes_code ON barcodes(barcode);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_mtos_brand_factory_status ON mtos(brand_id, factory_id, status);
CREATE INDEX IF NOT EXISTS idx_mtos_date_range ON mtos(created_at, expected_ship_date) WHERE status != 'cancelled';

-- Partial indexes for better performance on common filters
CREATE INDEX IF NOT EXISTS idx_mtos_active ON mtos(id, status, created_at) WHERE status IN ('pending', 'in_progress', 'production');
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory(sku_code, quantity_available) WHERE quantity_available <= reorder_point;
CREATE INDEX IF NOT EXISTS idx_defects_open ON defects(id, mto_id, created_at) WHERE status IN ('reported', 'investigating', 'pending');

-- Full-text search indexes (for PostgreSQL)
-- These help with searching product names, descriptions, etc.
CREATE INDEX IF NOT EXISTS idx_mtos_search ON mtos USING gin(to_tsvector('english', display_name || ' ' || COALESCE(reference_number, '')));
CREATE INDEX IF NOT EXISTS idx_inventory_search ON inventory USING gin(to_tsvector('english', item_name || ' ' || sku_code));

-- JSON field indexes for spots_data and excel_data
CREATE INDEX IF NOT EXISTS idx_mtos_spots_data ON mtos USING gin(spots_data);
CREATE INDEX IF NOT EXISTS idx_mtos_excel_data ON mtos USING gin(excel_data);

ANALYZE; -- Update table statistics after creating indexes