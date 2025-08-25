#!/usr/bin/env ts-node

/**
 * Demo User Seeding Script
 * Creates demo users for testing the MTO platform
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseServiceKey || supabaseUrl === 'https://your-project.supabase.co') {
  console.error('❌ Please configure SUPABASE_URL and SUPABASE_SERVICE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface DemoUser {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'brand_manager' | 'factory_operator';
  company_type?: 'brand' | 'factory';
  company_name?: string;
}

const demoUsers: DemoUser[] = [
  {
    email: 'admin@mto.com',
    password: 'admin123',
    full_name: 'System Administrator',
    role: 'admin'
  },
  {
    email: 'brand@brand.com',
    password: 'brand123',
    full_name: 'Brand Manager',
    role: 'brand_manager',
    company_type: 'brand',
    company_name: 'Demo Brand Company'
  },
  {
    email: 'factory@factory.com',
    password: 'factory123',
    full_name: 'Factory Operator',
    role: 'factory_operator',
    company_type: 'factory',
    company_name: 'Demo Factory Company'
  }
];

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

async function createCompanyIfNeeded(companyData: { name: string; type: 'brand' | 'factory' }): Promise<string> {
  // Check if company already exists
  const { data: existingCompany } = await supabase
    .from('companies')
    .select('id')
    .eq('name', companyData.name)
    .eq('type', companyData.type)
    .single();

  if (existingCompany) {
    console.log(`✅ Company '${companyData.name}' already exists`);
    return existingCompany.id;
  }

  // Create new company
  const { data: newCompany, error } = await supabase
    .from('companies')
    .insert({
      name: companyData.name,
      type: companyData.type,
      code: `${companyData.type.toUpperCase()}_DEMO`,
      email: `contact@${companyData.name.toLowerCase().replace(/\s+/g, '')}.com`,
      active: true
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create company: ${error.message}`);
  }

  console.log(`✅ Created company '${companyData.name}'`);
  return newCompany.id;
}

async function createDemoUser(userData: DemoUser): Promise<void> {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', userData.email)
      .single();

    if (existingUser) {
      console.log(`✅ User '${userData.email}' already exists`);
      return;
    }

    // Create company if needed
    let companyId = null;
    if (userData.company_type && userData.company_name) {
      companyId = await createCompanyIfNeeded({
        name: userData.company_name,
        type: userData.company_type
      });
    }

    // Hash password
    const passwordHash = await hashPassword(userData.password);

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email: userData.email,
        password_hash: passwordHash,
        full_name: userData.full_name,
        role: userData.role,
        company_id: companyId,
        language: 'en',
        active: true
      })
      .select('id, email, full_name, role')
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    console.log(`✅ Created user '${userData.email}' with role '${userData.role}'`);
  } catch (error) {
    console.error(`❌ Error creating user '${userData.email}':`, error);
    throw error;
  }
}

async function seedDemoUsers(): Promise<void> {
  console.log('🌱 Starting demo user seeding...\n');

  try {
    // Test database connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
    console.log('✅ Database connection successful\n');

    // Create demo users
    for (const userData of demoUsers) {
      await createDemoUser(userData);
    }

    console.log('\n🎉 Demo users seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    demoUsers.forEach(user => {
      console.log(`${user.role.padEnd(20)} | ${user.email.padEnd(25)} | ${user.password}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('\n❌ Failed to seed demo users:', error);
    process.exit(1);
  }
}

// Run the seeding script
if (require.main === module) {
  seedDemoUsers().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
}

export { seedDemoUsers };