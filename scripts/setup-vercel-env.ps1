#!/usr/bin/env powershell

# Vercel Environment Variable Setup Script
# This script helps set up environment variables for production deployment

Write-Host "🚀 Vercel Environment Variable Setup" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
    Write-Host "✅ Vercel CLI installed successfully" -ForegroundColor Green
}

# Check if project is linked
Write-Host "`n🔗 Checking Vercel project link..." -ForegroundColor Yellow
$linkResult = vercel link --confirm 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Project linked successfully" -ForegroundColor Green
}
else {
    Write-Host "❌ Failed to link project. Please run 'vercel link' manually." -ForegroundColor Red
    exit 1
}

# Function to set environment variable
function Set-VercelEnv {
    param(
        [string]$name,
        [string]$description,
        [bool]$required = $true
    )
    
    Write-Host "`n📝 Setting $name..." -ForegroundColor Yellow
    Write-Host "Description: $description" -ForegroundColor Gray
    
    if ($required) {
        $value = Read-Host "Enter value for $name (required)"
        if ([string]::IsNullOrEmpty($value)) {
            Write-Host "❌ $name is required. Skipping..." -ForegroundColor Red
            return
        }
    }
    else {
        $value = Read-Host "Enter value for $name (optional, press Enter to skip)"
        if ([string]::IsNullOrEmpty($value)) {
            Write-Host "⏭️ Skipping $name" -ForegroundColor Yellow
            return
        }
    }
    
    # Set for production environment
    $result = echo $value | vercel env add $name production 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $name set for production" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Failed to set $name. Error: $result" -ForegroundColor Red
    }
}

Write-Host "`n🔧 Setting up environment variables..." -ForegroundColor Yellow

# Database Configuration
Set-VercelEnv -name "DATABASE_URL" -description "PostgreSQL connection string (must start with postgresql://)" -required $true

# Authentication Configuration
Set-VercelEnv -name "NEXTAUTH_URL" -description "Production URL (e.g., https://www.xinfinitylabs.com)" -required $true
Set-VercelEnv -name "NEXTAUTH_SECRET" -description "Random secret for JWT encryption" -required $true

# OAuth Providers
Set-VercelEnv -name "GOOGLE_CLIENT_ID" -description "Google OAuth Client ID" -required $true
Set-VercelEnv -name "GOOGLE_CLIENT_SECRET" -description "Google OAuth Client Secret" -required $true

# AI Provider Configuration (Optional)
Set-VercelEnv -name "OPENAI_API_KEY" -description "OpenAI API key for AI features" -required $false
Set-VercelEnv -name "GEMINI_API_KEY" -description "Google Gemini API key for AI features" -required $false

Write-Host "`n📋 Environment Variables Summary:" -ForegroundColor Green
vercel env ls

Write-Host "`n🚀 Ready for deployment!" -ForegroundColor Green
Write-Host "Run 'vercel --prod' to deploy to production." -ForegroundColor Yellow

Write-Host "`n📖 For more information, see docs/PRODUCTION-SETUP.md" -ForegroundColor Gray