#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function checkWorkspaceTable() {
  console.log('🔍 CHECKING WORKSPACES TABLE STRUCTURE\n');

  try {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Available columns in workspaces:');
      Object.keys(data[0]).forEach(key => {
        console.log(`   • ${key}`);
      });
    } else {
      console.log('📝 Table exists but is empty - checking with insert test...');
    }

  } catch (error) {
    console.error('❌ Failed to check table:', error);
  }
}

checkWorkspaceTable().catch(console.error);