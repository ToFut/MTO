import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function createDemoUser() {
  console.log('👤 Creating demo user...\n');

  try {
    // Generate password hash
    const password = 'brand123';
    const passwordHash = await bcrypt.hash(password, 12);
    
    console.log('✅ Password hashed');

    // First, create a demo company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .upsert({
        name: 'Demo Brand Company',
        type: 'brand',
        code: 'DEMO-BRAND',
        contact_email: 'brand@brand.com',
        active: true
      })
      .select()
      .single();

    if (companyError && companyError.code !== '23505') {
      console.log('⚠️ Company creation warning:', companyError.message);
    } else {
      console.log('✅ Demo company created/updated');
    }

    // Create the demo user
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert({
        email: 'brand@brand.com',
        password_hash: passwordHash,
        full_name: 'Brand Demo User',
        role: 'brand_user',
        company_id: company?.id || null,
        active: true,
        language: 'en'
      })
      .select('id, email, full_name, role, active')
      .single();

    if (userError) {
      console.error('❌ Failed to create user:', userError);
      return;
    }

    console.log('✅ Demo user created successfully!');
    console.log('\n📝 User details:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.full_name);
    console.log('   Role:', user.role);
    console.log('   Active:', user.active);

    console.log('\n🎉 Login credentials:');
    console.log('   Email: brand@brand.com');
    console.log('   Password: brand123');

    console.log('\n✨ You can now test the login!');

  } catch (error) {
    console.error('❌ Error creating demo user:', error);
  }
}

createDemoUser();