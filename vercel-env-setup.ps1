# URGENT: Fix Production Database Connection Issue
# The production site is returning 500 errors because environment variables are not set

Write-Host "Setting up Vercel Environment Variables for Production..." -ForegroundColor Yellow

# Method 1: Using Vercel CLI (if installed)
Write-Host "`n=== Using Vercel CLI ===" -ForegroundColor Green
Write-Host "Run these commands one by one:"

Write-Host "`n1. Set DATABASE_URL:"
Write-Host "vercel env add DATABASE_URL production" -ForegroundColor Cyan
Write-Host "Enter: postgresql://neondb_owner:npg_YzBN5Ra7MjHA@ep-fragrant-unit-ahk7x53s-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

Write-Host "`n2. Set NEXTAUTH_URL:"
Write-Host "vercel env add NEXTAUTH_URL production" -ForegroundColor Cyan
Write-Host "Enter: https://www.xinfinitylabs.com"

Write-Host "`n3. Set NEXTAUTH_SECRET:"
Write-Host "vercel env add NEXTAUTH_SECRET production" -ForegroundColor Cyan
Write-Host "Enter: xinvoice-production-secret-2024-secure-key-change-this"

Write-Host "`n4. Set DEMO_MODE:"
Write-Host "vercel env add DEMO_MODE production" -ForegroundColor Cyan
Write-Host "Enter: false"

Write-Host "`n5. Redeploy:"
Write-Host "vercel --prod" -ForegroundColor Cyan

Write-Host "`n=== Alternative: Vercel Dashboard ===" -ForegroundColor Green
Write-Host "1. Go to: https://vercel.com/dashboard"
Write-Host "2. Select your Xinvoice project"
Write-Host "3. Go to Settings > Environment Variables"
Write-Host "4. Add these variables for PRODUCTION environment:"
Write-Host ""
Write-Host "Variable Name: DATABASE_URL" -ForegroundColor Yellow
Write-Host "Value: postgresql://neondb_owner:npg_YzBN5Ra7MjHA@ep-fragrant-unit-ahk7x53s-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
Write-Host ""
Write-Host "Variable Name: NEXTAUTH_URL" -ForegroundColor Yellow  
Write-Host "Value: https://www.xinfinitylabs.com"
Write-Host ""
Write-Host "Variable Name: NEXTAUTH_SECRET" -ForegroundColor Yellow
Write-Host "Value: xinvoice-production-secret-2024-secure-key-change-this"
Write-Host ""
Write-Host "Variable Name: DEMO_MODE" -ForegroundColor Yellow
Write-Host "Value: false"
Write-Host ""
Write-Host "5. Click 'Redeploy' on the latest deployment"

Write-Host "`n=== CRITICAL REMINDER ===" -ForegroundColor Red
Write-Host "The production site will keep throwing 500 errors until these environment variables are set!"
Write-Host "Users cannot save invoices or authenticate until this is fixed."
