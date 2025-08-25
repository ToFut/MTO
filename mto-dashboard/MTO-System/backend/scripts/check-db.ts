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

async function checkDatabase() {
  try {
    // Check if users table exists and get some data
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Error accessing users table:', error);
      console.log('\nDetailed error:', JSON.stringify(error, null, 2));
    } else {
      console.log('Users table accessible');
      console.log('Sample users:', users);
      
      if (users && users.length > 0) {
        console.log('\nTable columns:', Object.keys(users[0]));
      }
    }

    // Try to check table schema
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'users');

    if (!tablesError && tables) {
      console.log('\nUsers table schema:');
      tables.forEach((col: any) => {
        console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkDatabase();