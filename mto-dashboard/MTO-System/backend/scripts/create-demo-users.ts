#!/usr/bin/env ts-node

/**
 * Simple Demo User Creation Script
 * This script creates demo users using the auth service
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🔧 Demo User Creation Guide');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');
console.log('To create demo users, you can either:');
console.log('');
console.log('1. Use the API endpoints directly:');
console.log('   POST /api/auth/register');
console.log('');
console.log('2. Use the following curl commands after starting the server:');
console.log('');

const demoUsers = [
  {
    email: 'admin@mto.com',
    password: 'admin123',
    full_name: 'System Administrator',
    role: 'admin'
  },
  {
    email: 'brand@brand.com',
    password: 'brand123',
    full_name: 'Brand Manager',
    role: 'brand_manager'
  },
  {
    email: 'factory@factory.com',
    password: 'factory123',
    full_name: 'Factory Operator',
    role: 'factory_operator'
  }
];

demoUsers.forEach((user, index) => {
  console.log(`# Create ${user.role} user`);
  console.log(`curl -X POST http://localhost:4567/api/auth/register \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{`);
  console.log(`    "email": "${user.email}",`);
  console.log(`    "password": "${user.password}",`);
  console.log(`    "full_name": "${user.full_name}",`);
  console.log(`    "role": "${user.role}"`);
  console.log(`  }'`);
  console.log('');
});

console.log('3. Login Credentials:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Role                 | Email                      | Password');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
demoUsers.forEach(user => {
  console.log(`${user.role.padEnd(20)} | ${user.email.padEnd(25)} | ${user.password}`);
});
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('4. API Endpoints:');
console.log('   - Register: POST /api/auth/register');
console.log('   - Login:    POST /api/auth/login');
console.log('   - Profile:  GET  /api/auth/me');
console.log('');
console.log('📝 Note: Make sure the backend server is running on port 4567');
console.log('   Start with: npm run dev');
console.log('');