-- Demo Users Seed Script for MTO Platform
-- Run this in your Supabase SQL editor after creating the tables

-- First, create demo companies
INSERT INTO companies (id, name, type, code, email, contact_person, active) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Demo Brand Company', 'brand', 'BRAND_DEMO', 'contact@demobrand.com', 'Brand Manager', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Demo Factory Company', 'factory', 'FACTORY_DEMO', 'contact@demofactory.com', 'Factory Manager', true)
ON CONFLICT (code) DO NOTHING;

-- Create demo users with hashed passwords
-- Password for all users: admin123, brand123, factory123 (respectively)
-- These are bcrypt hashes with salt rounds of 12

-- Admin user (admin@mto.com / admin123)
INSERT INTO users (email, password_hash, full_name, role, company_id, language, active) VALUES
  ('admin@mto.com', '$2a$12$gtYqQp06PvSZB7IFpGOUx.ryJuuMiqq9QhoGSpOd69W.KCExN1Ncy', 'System Administrator', 'admin', NULL, 'en', true)
ON CONFLICT (email) DO NOTHING;

-- Brand manager user (brand@brand.com / brand123)  
INSERT INTO users (email, password_hash, full_name, role, company_id, language, active) VALUES
  ('brand@brand.com', '$2a$12$YWd.TnnFKJ8s2G1O4f0mUOf1thNLPuZXt7bwJ.TfoUPBBZPyF5Wam', 'Brand Manager', 'brand_manager', '550e8400-e29b-41d4-a716-446655440001', 'en', true)
ON CONFLICT (email) DO NOTHING;

-- Factory operator user (factory@factory.com / factory123)
INSERT INTO users (email, password_hash, full_name, role, company_id, language, active) VALUES
  ('factory@factory.com', '$2a$12$uNEAm9T7VPE0U6YdVUWuQeBNXneWqk2uzN1H8KwiGPSd.d1i5Wwqu', 'Factory Operator', 'factory_operator', '550e8400-e29b-41d4-a716-446655440002', 'en', true)
ON CONFLICT (email) DO NOTHING;

-- Verify the users were created
SELECT email, full_name, role, active FROM users WHERE email IN ('admin@mto.com', 'brand@brand.com', 'factory@factory.com');