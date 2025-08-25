import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function seedDemoUser() {
  try {
    // Hash the password
    const password = 'brand123';
    const passwordHash = await bcrypt.hash(password, 12);

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', 'brand@brand.com')
      .single();

    if (existingUser) {
      // Update existing user's password
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password_hash: passwordHash,
          active: true,
          role: 'brand_user',
          full_name: 'Brand Demo User',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id);

      if (updateError) {
        console.error('Error updating user:', updateError);
        process.exit(1);
      }

      console.log('✅ Updated existing user: brand@brand.com with password: brand123');
    } else {
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          email: 'brand@brand.com',
          password_hash: passwordHash,
          full_name: 'Brand Demo User',
          role: 'brand_user',
          active: true,
          language: 'en',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user:', insertError);
        process.exit(1);
      }

      console.log('✅ Created new user: brand@brand.com with password: brand123');
      console.log('User ID:', newUser.id);
    }

    console.log('\nYou can now login with:');
    console.log('Email: brand@brand.com');
    console.log('Password: brand123');

  } catch (error) {
    console.error('Error seeding demo user:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDemoUser();