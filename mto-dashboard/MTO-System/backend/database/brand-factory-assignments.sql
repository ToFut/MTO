-- Brand-Factory Assignment System
-- Add this to your existing database schema

-- Brand-Factory Assignments table
CREATE TABLE brand_factory_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  factory_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  capabilities TEXT[], -- What the factory can produce for this brand
  production_capacity INTEGER DEFAULT 0, -- Monthly capacity
  quality_rating DECIMAL(3,2) DEFAULT 0, -- Quality score 0-10
  preferred_for_categories TEXT[], -- Product categories this factory is preferred for
  notes TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(brand_id, factory_id) -- Prevent duplicate assignments
);

-- Create indexes for performance
CREATE INDEX idx_brand_factory_assignments_brand_id ON brand_factory_assignments(brand_id);
CREATE INDEX idx_brand_factory_assignments_factory_id ON brand_factory_assignments(factory_id);
CREATE INDEX idx_brand_factory_assignments_status ON brand_factory_assignments(status);

-- Add trigger for updated_at
CREATE TRIGGER update_brand_factory_assignments_updated_at 
  BEFORE UPDATE ON brand_factory_assignments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample assignments (run after creating sample companies)
-- INSERT INTO brand_factory_assignments (brand_id, factory_id, assigned_by, capabilities, production_capacity, quality_rating, preferred_for_categories, notes)
-- VALUES 
-- (
--   (SELECT id FROM companies WHERE type = 'brand' AND name = 'Acme Brand Co' LIMIT 1),
--   (SELECT id FROM companies WHERE type = 'factory' AND name = 'Premium Factory Ltd' LIMIT 1),
--   (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
--   ARRAY['bags', 'apparel', 'accessories'],
--   1000,
--   9.2,
--   ARRAY['luxury_bags', 'premium_apparel'],
--   'High-quality factory with excellent track record'
-- );

-- Enable RLS
ALTER TABLE brand_factory_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins can see all assignments
CREATE POLICY "Admins can manage all brand-factory assignments" ON brand_factory_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Brands can see their own assignments
CREATE POLICY "Brands can view their assignments" ON brand_factory_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.company_id = brand_factory_assignments.brand_id
      AND users.role = 'brand_manager'
    )
  );

-- Factories can see assignments to them
CREATE POLICY "Factories can view assignments to them" ON brand_factory_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.company_id = brand_factory_assignments.factory_id
      AND users.role = 'factory_operator'
    )
  );