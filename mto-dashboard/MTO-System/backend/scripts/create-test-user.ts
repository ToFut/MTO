#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function createTestUser() {
  console.log('🔧 Creating test user for upload testing\n');

  try {
    // Hash password
    const password = 'test123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get brand company
    const { data: companies } = await supabase.from('companies').select('*');
    const brand = companies?.find(c => c.type === 'brand');

    if (!brand) {
      console.log('❌ No brand company found');
      return;
    }

    // Check if test user exists
    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'test@brand.com')
      .single();

    if (existing) {
      // Update password
      const { error } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('email', 'test@brand.com');

      if (error) {
        console.log('❌ Failed to update user:', error.message);
      } else {
        console.log('✅ Updated existing test user password');
      }
    } else {
      // Create new user
      const { error } = await supabase
        .from('users')
        .insert({
          email: 'test@brand.com',
          password: hashedPassword,
          name: 'Test User',
          role: 'brand_user',
          company_id: brand.id,
          company_type: 'brand',
          permissions: ['upload', 'read', 'write'],
          status: 'active'
        });

      if (error) {
        console.log('❌ Failed to create user:', error.message);
      } else {
        console.log('✅ Created test user');
      }
    }

    console.log('\n📝 Test User Credentials:');
    console.log('   Email: test@brand.com');
    console.log('   Password: test123');
    console.log('   Role: brand_user');
    console.log('   Company:', brand.name);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestUser().catch(console.error);