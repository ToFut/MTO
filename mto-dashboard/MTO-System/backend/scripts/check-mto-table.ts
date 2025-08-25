#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function checkMTOTable() {
  console.log('🔍 CHECKING MTOS TABLE STRUCTURE\n');

  try {
    const { data, error } = await supabase
      .from('mtos')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Available columns in mtos:');
      Object.keys(data[0]).forEach(key => {
        console.log(`   • ${key}`);
      });
    } else {
      console.log('📝 Table exists but is empty');
    }

  } catch (error) {
    console.error('❌ Failed to check table:', error);
  }
}

checkMTOTable().catch(console.error);