# STEP 00 - Project Scaffold

**Date**: September 5, 2025  
**Status**: Complete ✅

## Objective
Set up the foundational Next.js 14 application with all required dependencies and core infrastructure.

## What was built

### 1. Next.js 14 Application
- Created manual Next.js setup due to directory naming constraints
- Configured TypeScript, Tailwind CSS, and ESLint
- Set up App Router structure

### 2. Dependencies Added
```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18", 
    "next": "14.2.13",
    "@tanstack/react-query": "latest",
    "react-hook-form": "latest",
    "zod": "latest",
    "@hookform/resolvers": "latest",
    "openai": "latest",
    "@google/generative-ai": "latest"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18", 
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "eslint": "^8",
    "eslint-config-next": "14.2.13"
  }
}
```

### 3. Core Package Structure
Created `/packages/core/` with:

#### schemas.ts
- Zod schemas for Invoice and NDA documents
- Type definitions with proper validation
- Discriminated union for document types

#### llm-provider.ts  
- Abstract LLMProvider interface
- OpenAIProvider implementation with GPT-3.5-turbo
- GeminiProvider implementation with Gemini Pro
- Factory function for provider creation
- Structured system prompts for JSON generation

#### index.ts
- Barrel exports for clean imports

### 4. API Route Implementation
`/app/api/generate/route.ts`:
- POST endpoint accepting prompt and documentType
- Environment-based provider selection (LLM_PROVIDER)
- Zod validation for requests and responses
- Comprehensive error handling
- Returns validated document JSON

### 5. Configuration Files
- `next.config.js` - Next.js configuration with OpenAI external package
- `tsconfig.json` - TypeScript configuration with path mapping
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `.eslintrc.json` - ESLint configuration

### 6. Documentation Structure
- `/docs/roadmap.md` - Complete project roadmap
- `/docs/status.md` - Current status tracking
- `/docs/steps/STEP-00.md` - This file

## Environment Variables Required
```env
LLM_PROVIDER=openai|gemini
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIz...
```

## Testing Instructions
1. Set environment variables
2. Run `npm run dev`
3. Test API with curl:
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Invoice ACME Corp $1500 for web design", "documentType": "invoice"}'
```

## Acceptance Criteria ✅
- [x] Dev server runs without errors
- [x] `/api/generate` endpoint exists and handles requests
- [x] Returns structured JSON for sample invoice prompt
- [x] Proper error handling and validation
- [x] Core schemas and providers implemented

## Next Step
Proceed to STEP 01 - Invoice Editor interface.
