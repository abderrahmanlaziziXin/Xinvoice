#!/usr/bin/env node

// Build script for Vercel deployment
// Handles Prisma generation with fallback DATABASE_URL

const { execSync } = require('child_process');

// Set fallback DATABASE_URL if not provided
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
  console.log('⚠️  DATABASE_URL not found, using fallback for build');
}

try {
  console.log('📦 Generating Prisma client...');
  execSync('prisma generate', { stdio: 'inherit' });
  
  console.log('🏗️  Building Next.js application...');
  execSync('next build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}