# Document Generator MVP - Roadmap

## Project Overview
A same-repo MVP for document generation using LLMs, built with the simplest possible stack.

## Technology Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod validation
- **LLM Integration**: OpenAI GPT-4o or Google Gemini
- **PDF Generation**: Client-side (no server storage)
- **Database**: None for MVP (in-memory only)

## Development Steps

### ✅ STEP 00 - Project Scaffold
- [x] Create Next.js 14 app with TypeScript and Tailwind
- [x] Add dependencies: Zod, React Hook Form, TanStack Query
- [x] Create `/packages/core` with schemas and LLM provider adapter
- [x] Implement `/app/api/generate/route.ts`
- [x] Set up environment variables for LLM providers
- [x] Create documentation structure

### ✅ STEP 01 - Invoice Editor (Complete)
- [x] Create `/app/(app)/new/invoice` page
- [x] Implement prompt input with "Generate Draft" button
- [x] Build invoice form editor with React Hook Form
- [x] Add live totals calculation
- [x] Integrate with TanStack Query for API calls

### ✅ STEP 01.5 - Batch Processing (Complete)
- [x] Upgrade to GPT-4o for enhanced batch processing
- [x] Create `/app/api/generate-batch` endpoint for multiple document generation
- [x] Build `/app/(app)/new/invoice-batch` page with multi-input interface
- [x] Implement batch generation hook with TanStack Query
- [x] Add bulk editing interface with individual invoice sections
- [x] Create unique invoice numbering system (INV-001, INV-002, etc.)
- [x] Ensure consistent company branding across all batch invoices
- [x] Smart processing: single request → normal API, multiple → batch API

### 📋 STEP 02 - PDF Export
- [ ] Add client-side PDF generation library
- [ ] Create "Download PDF" button for single invoices
- [ ] Implement bulk PDF download for batch invoices
- [ ] Design invoice PDF template
- [ ] Implement direct download functionality

### 📋 STEP 03 - NDA Document Type
- [ ] Add NDA schema implementation
- [ ] Create document type toggle
- [ ] Build NDA form editor
- [ ] Create NDA PDF template

### 📋 STEP 04 - Polish for Demo
- [ ] Add loading states and error handling
- [ ] Implement session-based document history
- [ ] Add help tooltips and sample prompts
- [ ] Include legal disclaimers

## Future Enhancements (Post-MVP)
- Supabase integration for persistent storage
- User authentication
- Document templates management
- Advanced PDF customization
- More document types
- Advanced batch operations (CSV import, template-based generation)
- Batch PDF merging and organization
- Client-specific invoice templates

## Environment Variables Required
```
LLM_PROVIDER=openai|gemini
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
```
