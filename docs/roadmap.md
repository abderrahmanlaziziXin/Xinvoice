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

### ✅ STEP 01.6 - Multi-Currency & Localization Support (Complete)

- [x] **Multi-Currency System**: Support for 28+ currencies (USD, EUR, GBP, CAD, AUD, JPY, CHF, SEK, NOK, DKK, PLN, CZK, HUF, RUB, CNY, INR, BRL, MXN, ZAR, DZD, MAD, TND, EGP, NGN, KES, GHS, XOF, XAF)
- [x] **Localization Framework**: 32+ locales with regional formatting (en-US, en-GB, fr-FR, de-DE, es-ES, ar-SA, ar-DZ, ar-MA, etc.)
- [x] **Currency Formatting**: Intelligent currency display with proper symbols and regional formatting
- [x] **API Validation Fixes**: Resolved backward compatibility issues with currency/locale fields
- [x] **Schema Enhancement**: Enhanced Zod schemas with Currency and Locale enums
- [x] **User Context Integration**: Company settings with default currency and locale preferences
- [x] **Backward Compatibility**: Automatic default values for legacy documents without currency/locale
- [x] **Type Safety**: Full TypeScript support for all currency and locale operations

### ✅ STEP 02 - PDF Export (Complete)

- [x] Add client-side PDF generation library (jsPDF + jspdf-autotable)
- [x] Create "Download PDF" button for single invoices
- [x] Implement bulk PDF download for batch invoices
- [x] Design multiple invoice PDF templates (Modern, Classic, Minimal)
- [x] Implement direct download functionality
- [x] **PDF Preview Modal**: Real-time preview with template selection
- [x] **Multiple Templates**: Modern, Classic, and Minimal design options
- [x] **Multi-Currency PDF**: Proper currency formatting in all templates
- [x] **Bulk Download**: Download all batch invoices with staggered timing
- [x] **Professional Styling**: Company branding and professional layouts
- [x] **Customization Options**: Template selection, watermarks, accent colors
- [x] **Performance Optimized**: Fast generation with proper error handling

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

### � STEP 04 - Bug Fixes & Enhanced Batch Processing (🚧 In Progress)

- [x] **Arabic Locale Validation Fix**: Enhanced currency formatting with RTL locale support and robust fallback mechanisms
- [x] **PDF Preview Rendering Fix**: Improved data URI handling, blob URL fallback, and comprehensive error reporting with retry functionality
- [x] **Multi-Item Invoice Support**: Enhanced CSV parsing with support for multiple line items per invoice (item1_, item2_, task1_, etc.)
- [x] **Enhanced CSV Templates**: Multiple template types (Simple, Multi-Item, Project-Based) with intelligent detection
- [x] **Improved File Processing**: Better AI prompt generation for complex invoice structures with multiple line items
- [ ] **Full Invoice Editor Integration**: Link batch invoices to complete editor for detailed modifications
- [ ] **Batch Progress Reporting**: Real-time progress tracking and per-row error reporting
- [ ] **Enhanced Validation**: Comprehensive input validation and error handling improvements

### 📋 STEP 05 - User Accounts & Persistence (Next Phase)

- [ ] **Authentication System**: Email/password and OAuth login integration
- [ ] **Database Integration**: Prisma with PostgreSQL for invoice storage and user management  
- [ ] **Invoice History Dashboard**: Complete invoice management with search, filter, and organization
- [ ] **Company Settings Persistence**: Save and sync company details across sessions
- [ ] **User Profile Management**: Account settings, preferences, and billing information

### 💳 STEP 06 - Payment Integration & Analytics

- [ ] **Payment Processor Integration**: Stripe and PayPal payment link generation
- [ ] **QR Code Generation**: Dynamic payment QR codes in PDF invoices
- [ ] **Analytics Dashboard**: Revenue tracking, payment status, and business insights
- [ ] **Advanced Reporting**: Export capabilities and financial summaries

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
