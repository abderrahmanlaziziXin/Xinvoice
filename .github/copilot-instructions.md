# Copilot Instructions

This is an enhanced document generation platform using Next.js 14, TypeScript, Tailwind CSS, and TanStack Query with advanced AI capabilities, structured prompts, and multi-document support.

## Project Structure

- Next.js 14 with App Router
- TypeScript for enhanced type safety with comprehensive coverage
- Tailwind CSS for styling with glass morphism and 3D effects
- TanStack Query for server state management with optimized caching
- Enhanced LLM provider adapter (OpenAI GPT-4o/Gemini) with structured prompts
- Client-side PDF generation with multi-template system and real-time preview
- Advanced batch document processing with intelligent file parsing
- Multi-currency support (28+ currencies) with RTL locale support
- Enhanced prompt system with structured AI responses and validation

## Architecture

- `/packages/core` - Enhanced shared schemas, LLM provider adapter with structured prompts, and validation
- `/docs` - Comprehensive project documentation and status tracking
- `/app/api/generate` - API route for single document LLM generation
- `/app/api/generate-batch` - API route for batch document generation
- `/app/api/generate-enhanced` - NEW: Enhanced API route with structured prompts and rich responses
- `/app/(app)/new/invoice` - Single invoice creation interface with professional UI/UX
- `/app/(app)/new/invoice-batch` - Batch invoice creation interface with advanced bulk operations
- `/app/(app)/test/enhanced` - NEW: Interactive testing page for enhanced AI features
- Enhanced client-side PDF system with multiple templates and preview
- Advanced file upload system with intelligent AI parsing

## Development Progress

- [x] Project setup and scaffolding
- [x] Base Next.js app with TypeScript and Tailwind
- [x] Added required dependencies with enhanced libraries
- [x] Created core package structure with enhanced features
- [x] Single invoice generation with GPT-4o and enhanced prompts
- [x] Batch invoice processing with enhanced AI capabilities and intelligent file parsing
- [x] Bulk editing and management interface with professional UI/UX
- [x] Company settings and context management with multi-currency support
- [x] **Enhanced File Upload System**: Complete CSV/Excel upload with intelligent AI parsing and multi-item support
- [x] **Universal Format Support**: Handles any file format from banks/accounting systems with enhanced parsing
- [x] **Dual Input Modes**: Text and file upload for both single and batch processing
- [x] **Professional UI/UX**: Stunning hero section with animations, 3D effects, and glass morphism design
- [x] **Toast Notifications**: Glass morphism design with smooth animations and professional styling
- [x] **Loading Components**: Professional animated loading states with spinners and transitions
- [x] **Modern Homepage**: Gradient backgrounds with floating elements and 3D effects
- [x] **Enhanced Invoice Pages**: Complete redesign with professional animations, glass morphism, and trust-building design
- [x] **Enhanced Batch Processing**: Beautiful redesign with enhanced bulk operations and modern visual effects
- [x] **Multi-Currency Support**: 28+ currencies with intelligent formatting and RTL locale support (USD, EUR, GBP, DZD, MAD, TND, etc.)
- [x] **Enhanced Localization**: 32+ locales with regional formatting including Arabic variants and comprehensive validation
- [x] **API Validation Fixes**: Resolved backward compatibility issues with enhanced schema validation and error handling
- [x] **Type Safety Enhancement**: Complete TypeScript coverage for currency, locale, and enhanced AI operations
- [x] **PDF Export System**: Multi-template PDF generation (Modern, Classic, Minimal) with bulk download and real-time preview
- [x] **PDF Preview Modal**: Real-time preview with customization options, template selection, and blob URL fallback
- [x] **Critical Bug Fixes**: Arabic locale validation, PDF preview rendering, and enhanced batch processing capabilities
- [x] **Enhanced Prompt System**: Structured AI responses with validation, metadata, and professional formatting
- [x] **Multi-Document Support**: Invoices and NDAs with extensible architecture for future document types
- [x] **Interactive Testing Interface**: Real-time testing page for enhanced AI features with examples and validation
- [x] Documentation structure setup with comprehensive guides and status tracking
- [ ] Complete NDA document implementation with UI components and legal templates (Step 5)
- [ ] Advanced platform features with authentication and database integration (Step 6)
