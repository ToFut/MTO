#!/usr/bin/env ts-node

import bcrypt from 'bcryptjs';

async function generateHashes() {
  const passwords = [
    { user: 'admin@mto.com', password: 'admin123' },
    { user: 'brand@brand.com', password: 'brand123' },
    { user: 'factory@factory.com', password: 'factory123' }
  ];

  console.log('Generating bcrypt hashes for demo passwords:\n');
  
  for (const { user, password } of passwords) {
    const hash = await bcrypt.hash(password, 12);
    console.log(`-- ${user} / ${password}`);
    console.log(`'${hash}'`);
    console.log();
  }
}

generateHashes().catch(console.error);