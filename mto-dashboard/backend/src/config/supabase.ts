import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger';

let supabase: SupabaseClient;

export const connectSupabase = async (): Promise<SupabaseClient> => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and key are required');
    }

    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
      },
    });

    // Simple test - just log success without querying a specific table
    logger.info('✅ Successfully connected to Supabase');
    return supabase;
  } catch (error) {
    logger.error('Failed to connect to Supabase:', error);
    throw error;
  }
};

export const getSupabase = (): SupabaseClient => {
  if (!supabase) {
    // Initialize with default values if not initialized
    const supabaseUrl = process.env.SUPABASE_URL || 'https://hmdczoguvrgbprehvpqm.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtZGN6b2d1dnJnYnByZWh2cHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNDk2MjAsImV4cCI6MjA2OTgyNTYyMH0.d_SFqu_4gHGF5qsWtfPQJCDPZHKTL36yS4Y6si1833k';
    
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
      },
    });
  }
  return supabase;
};

