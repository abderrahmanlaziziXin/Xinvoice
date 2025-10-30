#!/usr/bin/env node

// Postinstall script for Vercel deployment
// Handles Prisma generation with fallback DATABASE_URL

const { execSync } = require("child_process");

// Set fallback DATABASE_URL if not provided
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
  console.log("⚠️  DATABASE_URL not found, using fallback for postinstall");
}

try {
  console.log("📦 Generating Prisma client...");
  execSync("prisma generate", { stdio: "inherit", env: process.env });
  console.log("✅ Prisma client generated successfully!");
} catch (error) {
  console.error("❌ Prisma generation failed:", error.message);
  process.exit(1);
}