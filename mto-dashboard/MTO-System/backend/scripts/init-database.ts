import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function initDatabase() {
  try {
    // Read SQL file
    const sqlFile = path.join(__dirname, 'create-tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Execute SQL commands
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Try alternative approach - execute statements one by one
      console.log('Trying alternative approach...');
      
      // First create companies table
      const createCompaniesTable = `
        CREATE TABLE IF NOT EXISTS companies (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL CHECK (type IN ('brand', 'factory')),
          code VARCHAR(100) UNIQUE,
          contact_email VARCHAR(255),
          contact_phone VARCHAR(50),
          address TEXT,
          country VARCHAR(100),
          settings JSONB DEFAULT '{}',
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      // Then create users table
      const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'brand_user', 'factory_user', 'viewer')),
          company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
          language VARCHAR(10) DEFAULT 'en',
          avatar_url VARCHAR(500),
          phone VARCHAR(50),
          preferences JSONB DEFAULT '{}',
          last_login TIMESTAMPTZ,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      // We'll need to use Supabase Dashboard or direct connection for this
      console.log('\n⚠️  Database tables need to be created manually.');
      console.log('\nPlease run the following SQL in your Supabase Dashboard SQL Editor:');
      console.log('\n--- SQL START ---');
      console.log(createCompaniesTable);
      console.log(createUsersTable);
      console.log('--- SQL END ---\n');
      
      console.log('Go to: https://supabase.com/dashboard/project/hmdczoguvrgbprehvpqm/editor');
      console.log('\nOnce tables are created, run: npm run seed-demo-user');
    } else {
      console.log('✅ Database tables created successfully!');
    }

  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run initialization
initDatabase();