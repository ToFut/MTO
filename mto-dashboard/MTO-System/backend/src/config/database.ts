import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

class DatabaseConfig {
  private static instance: DatabaseConfig;
  private supabase: SupabaseClient<Database>;

  private constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    this.supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  public static getInstance(): DatabaseConfig {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new DatabaseConfig();
    }
    return DatabaseConfig.instance;
  }

  public getClient(): SupabaseClient<Database> {
    return this.supabase;
  }

  public async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('companies')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('Database connection test failed:', error);
        return false;
      }
      
      console.log('Database connection successful');
      return true;
    } catch (error) {
      console.error('Database connection error:', error);
      return false;
    }
  }
}

export const db = DatabaseConfig.getInstance().getClient();
export default DatabaseConfig;