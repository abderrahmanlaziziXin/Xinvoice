# Production Environment Setup Guide

## Overview
This guide explains how to properly configure environment variables for production deployment on Vercel.

## Required Environment Variables for Production

### 1. Database Configuration
```
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require&pgbouncer=true&connect_timeout=15"
```

### 2. Authentication Configuration
```
NEXTAUTH_URL="https://www.xinfinitylabs.com"
NEXTAUTH_SECRET="your-nextauth-secret-here"
```

### 3. OAuth Providers
```
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. AI Provider Configuration (Optional)
```
OPENAI_API_KEY="your-openai-api-key"
GEMINI_API_KEY="your-gemini-api-key"
```

## Vercel Environment Variable Setup

### Method 1: Vercel Dashboard
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with the appropriate environment (Production, Preview, Development)

### Method 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
vercel link

# Set environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
```

### Method 3: Using .env.production (Local Testing)
Create a `.env.production` file for local production testing:
```
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://www.xinfinitylabs.com"
NEXTAUTH_SECRET="your-production-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Current Issues and Solutions

### Issue 1: PrismaClientInitializationError
**Problem**: `URL must start with postgresql://`
**Solution**: Ensure DATABASE_URL is properly formatted with `postgresql://` prefix

### Issue 2: 500 Errors on API Routes
**Problem**: Server-side errors in production
**Solutions**:
1. Verify all environment variables are set in Vercel
2. Check database connection string format
3. Ensure Prisma client is properly generated in production
4. Add proper error handling and logging

### Issue 3: NextAuth Configuration
**Problem**: Authentication failures in production
**Solutions**:
1. Set correct NEXTAUTH_URL to production domain
2. Ensure NEXTAUTH_SECRET is set and secure
3. Configure OAuth providers with production callback URLs

## Database Connection Best Practices

### 1. Connection String Format
```
postgresql://username:password@host:port/database?sslmode=require&pgbouncer=true&connect_timeout=15
```

### 2. Connection Pooling
- Use `pgbouncer=true` for Neon databases
- Set appropriate connection timeouts
- Consider connection limits for serverless environments

### 3. SSL Configuration
- Always use `sslmode=require` for production
- Ensure your database provider supports SSL

## Testing Production Environment

### 1. Local Production Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

### 2. Environment Variable Testing
```bash
# Test with production environment
NODE_ENV=production npm run build
```

### 3. Database Connection Test
Use the `/api/test-db` endpoint to verify database connectivity.

## Deployment Checklist

- [ ] All environment variables set in Vercel dashboard
- [ ] Database connection string properly formatted
- [ ] NEXTAUTH_URL points to production domain
- [ ] NEXTAUTH_SECRET is secure and unique
- [ ] OAuth providers configured with production callbacks
- [ ] Database schema is up to date
- [ ] SSL certificates are valid
- [ ] Error monitoring is configured

## Troubleshooting Commands

### Check Environment Variables
```bash
# In Vercel project
vercel env ls

# Local development
npm run env:check
```

### Database Operations
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# View database
npx prisma studio
```

### Build and Deploy
```bash
# Local production build
npm run build

# Deploy to Vercel
vercel --prod
```

## Support

If you continue to experience issues:
1. Check Vercel function logs
2. Verify database connectivity
3. Test with minimal API endpoints
4. Review environment variable configuration
5. Check for any recent database schema changes