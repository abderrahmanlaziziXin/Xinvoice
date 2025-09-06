# Copilot Instructions

This is a document generation MVP using Next.js 14, TypeScript, Tailwind CSS, and TanStack Query with advanced batch processing capabilities.

## Project Structure

- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- TanStack Query for server state management
- LLM provider adapter (OpenAI GPT-4o/Gemini)
- Client-side PDF generation and download
- Batch document processing with bulk operations

## Architecture

- `/packages/core` - Shared schemas and LLM provider adapter with batch support
- `/docs` - Project documentation and status tracking
- `/app/api/generate` - API route for single document LLM generation
- `/app/api/generate-batch` - API route for batch document generation
- `/app/(app)/new/invoice` - Single invoice creation interface
- `/app/(app)/new/invoice-batch` - Batch invoice creation interface
- No server-side file storage (client-side only for now)

## Development Progress

- [x] Project setup and scaffolding
- [x] Base Next.js app with TypeScript and Tailwind
- [x] Added required dependencies
- [x] Created core package structure
- [x] Single invoice generation with GPT-4o
- [x] Batch invoice processing with enhanced AI capabilities
- [x] Bulk editing and management interface
- [x] Company settings and context management
- [x] **File Upload System**: Complete CSV/Excel upload with intelligent AI parsing
- [x] **Universal Format Support**: Handles any file format from banks/accounting systems
- [x] **Dual Input Modes**: Text and file upload for both single and batch processing
- [x] **Professional UI/UX**: Stunning hero section with animations and 3D effects
- [x] **Toast Notifications**: Glass morphism design with smooth animations
- [x] **Loading Components**: Professional animated loading states
- [x] **Modern Homepage**: Gradient backgrounds with floating elements
- [x] **Single Invoice Page**: Complete redesign with professional animations, glass morphism, and trust-building design
- [x] **Batch Processing Page**: Beautiful redesign with enhanced bulk operations and modern visual effects
- [x] Documentation structure setup
- [ ] PDF export functionality (Step 2)
- [ ] NDA document type (Step 4)
