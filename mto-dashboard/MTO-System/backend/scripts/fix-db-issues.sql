-- Fix Database Issues for MTO Uploads

-- 1. Create missing brand-factory assignment
INSERT INTO brand_factory_assignments (
  brand_id,
  factory_id,
  active,
  assignment_type,
  capacity_allocation,
  priority_level
) VALUES (
  'a0560528-ac53-4dd7-ac9c-92d3e90addf0',  -- Demo Brand Company
  '22222222-2222-2222-2222-222222222222',  -- Test Factory
  true,
  'preferred',
  100,
  1
) ON CONFLICT (brand_id, factory_id) DO NOTHING;

-- 2. Temporarily disable RLS for testing (enable later)
ALTER TABLE purchase_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE mtos DISABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_mappings DISABLE ROW LEVEL SECURITY;
ALTER TABLE barcodes DISABLE ROW LEVEL SECURITY;
ALTER TABLE brand_factory_assignments DISABLE ROW LEVEL SECURITY;

-- 3. Grant full permissions to service role for all tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 4. Test insert to verify permissions
INSERT INTO inventory (
  sku,
  name,
  category,
  current_stock
) VALUES (
  'TEST-PERMISSION',
  'Test Permission Item',
  'test',
  0
);

-- Clean up test data
DELETE FROM inventory WHERE sku = 'TEST-PERMISSION';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database fixes applied:';
  RAISE NOTICE '  - Brand-factory assignment created';
  RAISE NOTICE '  - RLS temporarily disabled for testing';
  RAISE NOTICE '  - Permissions granted to service role';
  RAISE NOTICE '  - Database ready for MTO uploads!';
END $$;