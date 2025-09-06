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
- [x] Documentation structure setup
