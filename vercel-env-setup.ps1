# PowerShell script to configure Vercel environment variables
# Make sure you have Vercel CLI installed: npm i -g vercel

Write-Host "Setting up Vercel environment variables..." -ForegroundColor Green

# Set LLM_PROVIDER
vercel env add LLM_PROVIDER

# Set OPENAI_API_KEY  
vercel env add OPENAI_API_KEY

Write-Host "Environment variables configured!" -ForegroundColor Green
Write-Host "Now redeploy your app with: vercel --prod" -ForegroundColor Yellow
