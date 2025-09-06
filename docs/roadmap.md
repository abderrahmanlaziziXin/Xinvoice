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

### ✅ STEP 01.5 - Batch Processing & File Upload (Complete)

- [x] Upgrade to GPT-4o for enhanced batch processing
- [x] Create `/app/api/generate-batch` endpoint for multiple document generation
- [x] Build `/app/(app)/new/invoice-batch` page with multi-input interface
- [x] Implement batch generation hook with TanStack Query
- [x] Add bulk editing interface with individual invoice sections
- [x] Create unique invoice numbering system (INV-001, INV-002, etc.)
- [x] Ensure consistent company branding across all batch invoices
- [x] Smart processing: single request → normal API, multiple → batch API
- [x] **File Upload System**: CSV/Excel file upload with intelligent AI parsing
- [x] **Universal Format Support**: Handle any CSV/Excel format (bank exports, accounting systems)
- [x] **Dual Input Modes**: Toggle between text input and file upload for both single and batch
- [x] **Smart File Processing**: AI interprets uploaded data and generates appropriate invoices
- [x] **End-to-End Integration**: Complete workflow from file upload to invoice generation

### 📋 STEP 02 - PDF Export

- [ ] Add client-side PDF generation library
- [ ] Create "Download PDF" button for single invoices
- [ ] Implement bulk PDF download for batch invoices
- [ ] Design invoice PDF template
- [ ] Implement direct download functionality

### 🎨 STEP 03 - Professional UI/UX Polish (✅ Complete)

- [x] Install professional UI libraries (Framer Motion, Heroicons, React Hot Toast)
- [x] Create stunning hero section with animated backgrounds and 3D effects
- [x] Design professional toast notification system with glass morphism
- [x] Build animated loading components with smooth transitions
- [x] Implement beautiful homepage with gradient backgrounds and floating elements
- [x] **Single Invoice Page**: Complete redesign with modern animations, glass morphism cards, and trust-building professional design
- [x] **Batch Invoice Page**: Professional enhancement with bulk operations, animated backgrounds, and sophisticated visual effects
- [x] **Modern Animations**: Framer Motion powered transitions and 3D floating elements
- [x] **Glass Morphism Design**: Backdrop blur effects and transparent overlays throughout
- [x] **Professional Color Palette**: Stunning gradients with purple/blue/emerald themes
- [x] **Enterprise-Grade UX**: Trust-building design elements that impress clients
- [x] **Responsive Design**: Perfect display across all device sizes
- [x] **Micro-Interactions**: Smooth hover effects and button animations
- [x] **Loading States**: Professional animated spinners and progress indicators

### 📋 STEP 04 - NDA Document Type

- [ ] Add NDA schema implementation
- [ ] Create document type toggle
- [ ] Build NDA form editor
- [ ] Create NDA PDF template

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
