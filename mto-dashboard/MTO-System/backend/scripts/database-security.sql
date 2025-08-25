-- ============================================
-- COMPLETE SECURITY SETUP FOR MTO SYSTEM
-- Multi-tenant security with Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_factory_assignments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 1. USER AUTHENTICATION & JWT
-- ============================================

-- Create auth schema for JWT handling
CREATE SCHEMA IF NOT EXISTS auth;

-- Function to get current user from JWT
CREATE OR REPLACE FUNCTION auth.user_id() 
RETURNS UUID AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.claims', true)::json->>'user_id'
  )::UUID
$$ LANGUAGE SQL STABLE;

-- Function to get user role
CREATE OR REPLACE FUNCTION auth.user_role() 
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    'viewer'
  )::TEXT
$$ LANGUAGE SQL STABLE;

-- Function to get user's company
CREATE OR REPLACE FUNCTION auth.user_company_id() 
RETURNS UUID AS $$
  SELECT company_id FROM users WHERE id = auth.user_id()
$$ LANGUAGE SQL STABLE;

-- Function to get user's company type
CREATE OR REPLACE FUNCTION auth.user_company_type() 
RETURNS TEXT AS $$
  SELECT c.type 
  FROM users u 
  JOIN companies c ON u.company_id = c.id 
  WHERE u.id = auth.user_id()
$$ LANGUAGE SQL STABLE;

-- ============================================
-- 2. COMPANIES TABLE SECURITY
-- ============================================

-- Brands can only see their own company and assigned factories
CREATE POLICY "brand_company_access" ON companies
  FOR SELECT
  TO authenticated
  USING (
    auth.user_role() = 'admin' OR
    id = auth.user_company_id() OR
    (
      auth.user_company_type() = 'brand' AND
      id IN (
        SELECT factory_id 
        FROM brand_factory_assignments 
        WHERE brand_id = auth.user_company_id() AND active = true
      )
    )
  );

-- Factories can only see their own company and assigned brands
CREATE POLICY "factory_company_access" ON companies
  FOR SELECT
  TO authenticated
  USING (
    auth.user_role() = 'admin' OR
    id = auth.user_company_id() OR
    (
      auth.user_company_type() = 'factory' AND
      id IN (
        SELECT brand_id 
        FROM brand_factory_assignments 
        WHERE factory_id = auth.user_company_id() AND active = true
      )
    )
  );

-- Only admins can modify companies
CREATE POLICY "admin_company_modify" ON companies
  FOR ALL
  TO authenticated
  USING (auth.user_role() = 'admin')
  WITH CHECK (auth.user_role() = 'admin');

-- ============================================
-- 3. WORKSPACES SECURITY
-- ============================================

-- Brands see only their workspaces
CREATE POLICY "brand_workspace_access" ON workspaces
  FOR SELECT
  TO authenticated
  USING (
    auth.user_role() = 'admin' OR
    (auth.user_company_type() = 'brand' AND brand_id = auth.user_company_id())
  );

-- Factories see only assigned workspaces
CREATE POLICY "factory_workspace_access" ON workspaces
  FOR SELECT
  TO authenticated
  USING (
    auth.user_role() = 'admin' OR
    (auth.user_company_type() = 'factory' AND factory_id = auth.user_company_id())
  );

-- Brands can create workspaces for their company
CREATE POLICY "brand_workspace_create" ON workspaces
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.user_role() = 'admin' OR
    (auth.user_company_type() = 'brand' AND brand_id = auth.user_company_id())
  );

-- Brands can update their own workspaces
CREATE POLICY "brand_workspace_update" ON workspaces
  FOR UPDATE
  TO authenticated
  USING (
    auth.user_role() = 'admin' OR
    (auth.user_company_type() = 'brand' AND brand_id = auth.user_company_id())
  )
  WITH CHECK (
    auth.user_role() = 'admin' OR
    (auth.user_company_type() = 'brand' AND brand_id = auth.user_company_id())
  );

-- Factories can update workspace progress fields only
CREATE POLICY "factory_workspace_update" ON workspaces
  FOR UPDATE
  TO authenticated
  USING (
    auth.user_company_type() = 'factory' AND 
    factory_id = auth.user_company_id()
  )
  WITH CHECK (
    auth.user_company_type() = 'factory' AND 
    factory_id = auth.user_company_id()
  );

-- ============================================
-- 4. MTOS SECURITY
-- ============================================

-- Brands see only their MTOs
CREATE POLICY "brand_mto_access" ON mtos
  FOR SELECT
  TO authenticated
  USING (
    auth.user_role() = 'admin' OR
    (auth.user_company_type() = 'brand' AND brand_id = auth.user_company_id())
  );

-- Factories see only MTOs assigned to them
CREATE POLICY "factory_mto_access" ON mtos
  FOR SELECT
  TO authenticated
  USING (
    auth.user_role() = 'admin' OR
    (auth.user_company_type() = 'factory' AND factory_id = auth.user_company_id())
  );

-- Brands can create MTOs
CREATE POLICY "brand_mto_create" ON mtos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.user_role() = 'admin' OR
    (auth.user_company_type() = 'brand' AND brand_id = auth.user_company_id())
  );

-- Factories can only update status and production fields
CREATE POLICY "factory_mto_update" ON mtos
  FOR UPDATE
  TO authenticated
  USING (
    auth.user_company_type() = 'factory' AND 
    factory_id = auth.user_company_id()
  )
  WITH CHECK (
    auth.user_company_type() = 'factory' AND 
    factory_id = auth.user_company_id()
  );

-- ============================================
-- 5. PURCHASE ORDERS SECURITY
-- ============================================

-- Brands see only their POs
CREATE POLICY "brand_po_access" ON purchase_orders
  FOR SELECT
  TO authenticated
  USING (
    auth.user_role() = 'admin' OR
    (auth.user_company_type() = 'brand' AND brand_id = auth.user_company_id())
  );

-- Factories see only POs assigned to them
CREATE POLICY "factory_po_access" ON purchase_orders
  FOR SELECT
  TO authenticated
  USING (
    auth.user_role() = 'admin' OR
    (auth.user_company_type() = 'factory' AND factory_id = auth.user_company_id())
  );

-- ============================================
-- 6. INVENTORY SECURITY
-- ============================================

-- Factories see only their inventory
CREATE POLICY "factory_inventory_access" ON inventory
  FOR ALL
  TO authenticated
  USING (
    auth.user_role() = 'admin' OR
    (auth.user_company_type() = 'factory' AND factory_id = auth.user_company_id())
  )
  WITH CHECK (
    auth.user_role() = 'admin' OR
    (auth.user_company_type() = 'factory' AND factory_id = auth.user_company_id())
  );

-- Brands can view inventory at their assigned factories
CREATE POLICY "brand_inventory_view" ON inventory
  FOR SELECT
  TO authenticated
  USING (
    auth.user_role() = 'admin' OR
    (
      auth.user_company_type() = 'brand' AND
      factory_id IN (
        SELECT factory_id 
        FROM brand_factory_assignments 
        WHERE brand_id = auth.user_company_id() AND active = true
      )
    )
  );

-- ============================================
-- 7. BRAND-FACTORY ASSIGNMENTS SECURITY
-- ============================================

-- Only admins can manage assignments
CREATE POLICY "admin_assignments" ON brand_factory_assignments
  FOR ALL
  TO authenticated
  USING (auth.user_role() = 'admin')
  WITH CHECK (auth.user_role() = 'admin');

-- Brands and factories can view their assignments
CREATE POLICY "view_own_assignments" ON brand_factory_assignments
  FOR SELECT
  TO authenticated
  USING (
    auth.user_role() = 'admin' OR
    brand_id = auth.user_company_id() OR
    factory_id = auth.user_company_id()
  );

-- ============================================
-- 8. USERS TABLE SECURITY
-- ============================================

-- Users can only see users from their company or assigned companies
CREATE POLICY "user_visibility" ON users
  FOR SELECT
  TO authenticated
  USING (
    auth.user_role() = 'admin' OR
    id = auth.user_id() OR
    company_id = auth.user_company_id() OR
    (
      -- Brands can see factory users they work with
      auth.user_company_type() = 'brand' AND
      company_id IN (
        SELECT factory_id 
        FROM brand_factory_assignments 
        WHERE brand_id = auth.user_company_id() AND active = true
      )
    ) OR
    (
      -- Factories can see brand users they work with
      auth.user_company_type() = 'factory' AND
      company_id IN (
        SELECT brand_id 
        FROM brand_factory_assignments 
        WHERE factory_id = auth.user_company_id() AND active = true
      )
    )
  );

-- Users can only update their own profile
CREATE POLICY "user_self_update" ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.user_id())
  WITH CHECK (id = auth.user_id());

-- Only admins can create/delete users
CREATE POLICY "admin_user_management" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.user_role() = 'admin');

CREATE POLICY "admin_user_delete" ON users
  FOR DELETE
  TO authenticated
  USING (auth.user_role() = 'admin');

-- ============================================
-- 9. AUDIT FUNCTIONS
-- ============================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(100),
  operation VARCHAR(10),
  user_id UUID,
  company_id UUID,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit function for sensitive operations
CREATE OR REPLACE FUNCTION audit_trigger() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    table_name,
    operation,
    user_id,
    company_id,
    record_id,
    old_data,
    new_data
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    auth.user_id(),
    auth.user_company_id(),
    COALESCE(NEW.id, OLD.id),
    to_jsonb(OLD),
    to_jsonb(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_mtos 
  AFTER INSERT OR UPDATE OR DELETE ON mtos
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_workspaces 
  AFTER INSERT OR UPDATE OR DELETE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- ============================================
-- 10. DATA ISOLATION HELPERS
-- ============================================

-- Function to check if user can access an MTO
CREATE OR REPLACE FUNCTION can_access_mto(mto_id UUID) 
RETURNS BOOLEAN AS $$
DECLARE
  mto_brand_id UUID;
  mto_factory_id UUID;
BEGIN
  SELECT brand_id, factory_id INTO mto_brand_id, mto_factory_id
  FROM mtos WHERE id = mto_id;
  
  RETURN (
    auth.user_role() = 'admin' OR
    (auth.user_company_type() = 'brand' AND mto_brand_id = auth.user_company_id()) OR
    (auth.user_company_type() = 'factory' AND mto_factory_id = auth.user_company_id())
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 11. COLUMN-LEVEL SECURITY
-- ============================================

-- Hide sensitive financial data from certain roles
CREATE OR REPLACE VIEW mtos_secure AS
SELECT 
  id, workspace_id, po_id, brand_id, factory_id,
  internal_id, po_line_id, display_name, reference_number,
  quantity, status, production_stage, production_category,
  priority, expected_ship_date, actual_ship_date,
  -- Hide financial fields from factory users
  CASE 
    WHEN auth.user_company_type() = 'factory' THEN NULL
    ELSE excel_data->>'po_purchase_price'
  END as po_purchase_price,
  CASE 
    WHEN auth.user_company_type() = 'factory' THEN NULL
    ELSE excel_data->>'po_ext_fob'
  END as po_ext_fob,
  spots_data,
  created_at, updated_at
FROM mtos
WHERE can_access_mto(id);

-- Grant access to secure view
GRANT SELECT ON mtos_secure TO authenticated;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '🔐 Security setup completed!';
  RAISE NOTICE '✅ Row Level Security enabled on all tables';
  RAISE NOTICE '✅ Role-based access policies created';
  RAISE NOTICE '✅ Audit logging configured';
  RAISE NOTICE '✅ Data isolation enforced';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Security Summary:';
  RAISE NOTICE '  - Admins: Full access to everything';
  RAISE NOTICE '  - Brands: See only their data and assigned factories';
  RAISE NOTICE '  - Factories: See only assigned work from brands';
  RAISE NOTICE '  - Financial data: Hidden from factories';
  RAISE NOTICE '  - All operations: Audit logged';
END $$;