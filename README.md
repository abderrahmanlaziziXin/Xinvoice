# Xinvoice - AI-Powered Document Generation Platform

A Next.js 14 application for generating professional documents (invoices, NDAs) using advanced AI assistance with enhanced structured prompts.

## Features

- 🤖 **Enhanced AI-powered document generation** (Advanced AI with structured prompts)
- ✨ **Enhanced Prompt System**: Structured AI responses with validation and prof- ✅ **STEP 00**: Project scaffold and API setup
- ✅ **STEP 01**: Single invoice editor interface
- ✅ **STEP 01.5**: Batch invoice generation with GPT-4o
- ✅ **STEP 02**: PDF export functionality with multi-template system
- ✅ **STEP 02.5**: Enhanced prompt system and NDA document support
- ✅ **STEP 02.75**: 🌍 **Comprehensive Multilingual Support** - 11+ languages with RTL support
- ✅ **BUG FIXES**: Arabic locale validation, PDF preview rendering, batch enhancements
- ✅ **ENHANCEMENTS**: Multi-currency support, file upload system, enhanced UI/UX
- 📋 **STEP 03**: Complete NDA document implementation with UI components
- 📋 **STEP 04**: Advanced features and polish (authentication, payment integration)formatting
- 📄 **Multi-Document Support**: Invoices, NDAs, and extensible architecture for more document types
- 🚀 **Batch Processing**: Create multiple documents simultaneously with unique numbering and intelligent parsing
- ✏️ **Bulk Editing Interface**: Edit batch-generated documents with comprehensive management tools
- 📦 **Bulk PDF Download**: Download multiple documents with various templates
- 📝 **Advanced Form Validation**: Live validation with enhanced error handling and fallbacks
- 📊 **Automatic Calculations**: Smart invoice calculations with multi-currency support
- 🏢 **Company Settings**: Context saving with AI-powered pre-filling
- 📧 **Email Validation**: Enhanced validation with warnings and error recovery
- 📅 **Smart Date Handling**: AI calculates due dates with context awareness
- 📄 **Enhanced PDF System**: Platform-consistent themes (Primary, Neutral, Dark) with professional layouts
- 🎨 **Advanced Templates**: Modern, Classic, and Minimal styles with branded headers and footers
- 🔍 **Enhanced PDF Preview**: Theme selection, real-time preview with fallback error handling
- 💾 **Session-based History**: In-memory document management
- 🎨 **Modern UI/UX**: Glass morphism design with Framer Motion animations and 3D effects
- 💰 **Multi-Currency Support**: 28+ currencies (USD, EUR, GBP, DZD, MAD, TND, etc.) with RTL locale support
- 🌍 **Enhanced Localization**: 32+ locales with regional formatting including Arabic variants
- 📁 **Advanced File Upload**: CSV/Excel upload with intelligent AI parsing and multi-item support
- 🔄 **Dual Input Modes**: Text and file upload for both single and batch processing
- ✨ **Professional Toast System**: Glass morphism notifications with smooth animations
- 🛡️ **Enhanced Type Safety**: Full TypeScript coverage with Zod validation and error boundaries
- 🧪 **Interactive Testing**: Built-in test page for enhanced AI features (`/test/enhanced`)
- 🌍 **NEW: Comprehensive Multilingual Support**: 11+ languages with RTL support and cultural context

## 🌍 Multilingual Features

### Supported Languages
- **English (US)**: `en-US` - Business English with US formatting
- **French (France)**: `fr-FR` - Professional French with EU standards
- **German (Germany)**: `de-DE` - Formal German business language
- **Spanish (Spain)**: `es-ES` - European Spanish with regional context
- **Arabic (Saudi Arabia)**: `ar-SA` - RTL support with Middle Eastern business practices
- **Chinese (Simplified)**: `zh-CN` - Simplified Chinese with local customs
- **Japanese**: `ja-JP` - Formal Japanese business language
- **Portuguese (Brazil)**: `pt-BR` - Brazilian Portuguese with local tax systems
- **Italian**: `it-IT` - Italian with European business standards
- **Russian**: `ru-RU` - Russian with CIS business practices
- **Hindi (India)**: `hi-IN` - Hindi with Indian business context

### Key Capabilities
- **Cultural Context Integration**: AI adapts language to local business practices
- **RTL Language Support**: Proper text direction for Arabic documents
- **Localized PDF Generation**: Currency, date, and number formatting per region
- **Professional Translation**: Business-grade terminology and formal tone
- **Interactive Demo**: Test multilingual features at `/demo/multilang-pdf`

### API Endpoints
- `POST /api/generate-multilingual` - Single document in any language
- `POST /api/generate-multilingual-batch` - Batch documents with language support

### Usage Example
```typescript
// Generate French invoice
const response = await fetch('/api/generate-multilingual', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Créer une facture pour des services de développement web',
    documentType: 'invoice',
    locale: 'fr-FR',
    culturalContext: true
  })
})

// Generate Arabic NDA with RTL support
const response = await fetch('/api/generate-multilingual', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'إنشاء اتفاقية عدم إفشاء للمشروع',
    documentType: 'nda',
    locale: 'ar-SA',
    culturalContext: true
  })
})
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript with enhanced type safety
- **Styling**: Tailwind CSS with glass morphism and 3D effects
- **Forms**: React Hook Form + Zod validation with enhanced error handling
- **State**: TanStack Query with optimized caching
- **AI**: OpenAI API (GPT-4o) or Google Gemini API with enhanced structured prompts
- **PDF**: jsPDF with multiple professional templates
- **Animation**: Framer Motion with advanced effects
- **File Processing**: Enhanced CSV/Excel parsing with AI interpretation
- **Validation**: Comprehensive Zod schemas with fallback mechanisms

## Quick Start

1. **Clone and install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

3. **Run development server**

   ```bash
   npm run dev
   ```

4. **Open http://localhost:3000**

## Environment Variables

```env
LLM_PROVIDER=openai|gemini
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIz...
```

## Enhanced Features

### ✨ Enhanced AI Prompt System

- **Structured Prompts**: Professional document generation with detailed formatting instructions
- **Validation**: JSON schema validation for AI responses with fallback mechanisms
- **Rich Responses**: Structured AI outputs with metadata, assumptions, and professional formatting
- **Multi-Document Support**: Extensible architecture for invoices, NDAs, and future document types

### 🏢 Company Settings

- Save your company details (name, address, email, phone)
- Set default tax rates and payment terms
- AI uses your context to pre-fill invoices
- Accessible via ⚙️ Company Settings button

### 📧 Email Validation

- Warns when invoice parties are missing email addresses
- Modal popup with option to continue anyway
- Prevents common delivery issues

### 📅 Smart Date Handling

- AI understands relative dates ("due in 30 days", "net 15")
- Uses current date when none specified
- Calculates due dates based on payment terms

### 🚀 Enhanced Batch Processing

- **Multiple Input Fields**: Add as many invoice requests as needed with enhanced validation
- **Smart Processing**: Intelligent routing between single and batch APIs
- **Enhanced Bulk Generation**: Generate all documents simultaneously with structured prompts
- **Unique Numbering**: Each document gets unique numbers (INV-001, INV-002, etc.)
- **Advanced Bulk Editing**: Edit each document individually with comprehensive validation
- **Multi-Template PDF Export**: Download all PDFs with template selection
- **Enhanced CSV/Excel Support**: Multi-item invoices with intelligent parsing
- **Consistent Branding**: Company settings apply to all documents automatically

### 📄 NDA Document Support

- **Legal Document Structure**: Professional NDA templates with proper formatting
- **Confidentiality Levels**: Support for different NDA types and confidentiality requirements
- **Rich Schema Validation**: Comprehensive validation for legal document fields
- **Batch NDA Generation**: Create multiple NDAs from structured data

### 🧪 Interactive Testing

- **Enhanced Test Page**: Access via "Test Enhanced AI" button on homepage (`/test/enhanced`)
- **Real-time Validation**: Live testing of enhanced prompt system
- **Example Prompts**: Pre-built examples for invoices and NDAs
- **Response Visualization**: Detailed display of AI responses with metadata and assumptions

## API Usage

### Generate Enhanced Document (NEW)

```bash
POST /api/generate-enhanced
Content-Type: application/json

{
  "prompt": "Invoice ACME Corp $1500 for web design, due in 14 days",
  "documentType": "invoice",
  "useEnhancedPrompts": true,
  "userContext": {
    "companyName": "Your Company Inc",
    "companyEmail": "billing@yourcompany.com",
    "defaultCurrency": "USD",
    "defaultTaxRate": 0.08
  }
}
```

### Enhanced Response Format

```json
{
  "success": true,
  "enhanced": true,
  "document": {
    "type": "invoice",
    "metadata": {
      "generation_method": "enhanced_ai",
      "template_version": "2.0",
      "ai_confidence": 0.95
    }
  },
  "content": {
    "structured_data": {
      /* Rich document structure */
    },
    "formatting": {
      /* Professional formatting rules */
    }
  },
  "formatted_document": "Professional PDF-ready content with enhanced formatting",
  "assumptions": [
    "Used current date for invoice date",
    "Applied default tax rate from company settings"
  ]
}
```

### Generate Single Document

```bash
POST /api/generate
Content-Type: application/json

{
  "prompt": "Invoice ACME Corp $1500 for web design, due in 14 days",
  "documentType": "invoice",
  "userContext": {
    "companyName": "Your Company Inc",
    "companyEmail": "billing@yourcompany.com",
    "defaultCurrency": "USD",
    "defaultTaxRate": 0.08
  }
}
```

### Generate Batch Documents

```bash
POST /api/generate-batch
Content-Type: application/json

{
  "prompts": [
    "Invoice ACME Corp $1500 for web design, due in 14 days",
    "Invoice XYZ Company $2500 for mobile app development, due in 30 days",
    "Invoice Tech Solutions $800 for logo design, due in 15 days"
  ],
  "documentType": "invoice",
  "userContext": {
    "companyName": "Your Company Inc",
    "companyEmail": "billing@yourcompany.com",
    "defaultCurrency": "USD",
    "defaultTaxRate": 0.08
  }
}
```

### Single Document Response

```json
{
  "success": true,
  "document": {
    "type": "invoice",
    "invoiceNumber": "INV-001",
    "date": "2025-09-05",
    "dueDate": "2025-09-19",
    "from": { "name": "Your Company" },
    "to": { "name": "ACME Corp" },
    "items": [
      {
        "description": "Web design services",
        "quantity": 1,
        "rate": 1500,
        "amount": 1500
      }
    ],
    "subtotal": 1500,
    "taxRate": 0,
    "taxAmount": 0,
    "total": 1500
  }
}
```

### Batch Documents Response

```json
{
  "success": true,
  "documents": [
    {
      "type": "invoice",
      "invoiceNumber": "INV-001",
      "to": { "name": "ACME Corp" },
      "total": 1500
    },
    {
      "type": "invoice",
      "invoiceNumber": "INV-002",
      "to": { "name": "XYZ Company" },
      "total": 2500
    },
    {
      "type": "invoice",
      "invoiceNumber": "INV-003",
      "to": { "name": "Tech Solutions" },
      "total": 800
    }
  ],
  "count": 3
}
```

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── generate/              # Single document generation API
│   │   ├── generate-batch/        # Batch document generation API
│   │   ├── generate-enhanced/     # NEW: Enhanced AI generation API
│   │   ├── generate-multilingual/ # 🌍 NEW: Single multilingual generation
│   │   └── generate-multilingual-batch/ # 🌍 NEW: Batch multilingual generation
│   ├── (app)/
│   │   ├── demo/
│   │   │   └── multilang-pdf/     # 🌍 NEW: Interactive multilingual demo
│   │   ├── new/
│   │   │   ├── invoice/           # Single invoice creation page
│   │   │   └── invoice-batch/     # Batch invoice creation page
│   │   └── test/
│   │       └── enhanced/          # NEW: Enhanced AI testing page
│   ├── components/
│   │   ├── company-settings.tsx       # Company configuration modal
│   │   ├── invoice-form.tsx            # Invoice editing form
│   │   ├── pdf-preview-modal.tsx       # ENHANCED: PDF preview with fallbacks
│   │   ├── file-upload.tsx             # ENHANCED: Advanced file processing
│   │   └── toast.tsx                   # ENHANCED: Glass morphism notifications
│   ├── hooks/
│   │   ├── use-generate-document.ts           # Single generation hook
│   │   ├── use-generate-batch-documents.ts    # Batch generation hook
│   │   ├── use-generate-enhanced-document.ts  # NEW: Enhanced generation hook
│   │   └── use-generate-multilingual-document.ts # 🌍 NEW: Multilingual hooks
│   ├── lib/
│   │   ├── i18n/                       # 🌍 NEW: Internationalization system
│   │   │   ├── translations.ts         # 🌍 Translation definitions (11+ languages)
│   │   │   ├── multilingual-prompts.ts # 🌍 AI prompts with cultural context
│   │   │   └── multilingual-pdf-generator.ts # 🌍 RTL-aware PDF generation
│   │   ├── user-context.ts             # User settings management
│   │   ├── currency.ts                 # ENHANCED: Multi-currency with RTL support
│   │   ├── csv-template-enhanced.ts    # NEW: Advanced CSV processing
│   │   └── pdf-generator.ts            # ENHANCED: Multi-template PDF system
│   ├── globals.css                     # Enhanced global styles
│   ├── layout.tsx                      # Root layout
│   └── page.tsx                        # Enhanced home page
├── packages/core/                      # Shared logic
│   ├── schemas.ts                      # ENHANCED: Rich schemas with NDA support
│   ├── llm-provider.ts                 # ENHANCED: Enhanced AI methods + 🌍 multilingual
│   ├── enhanced-prompts.ts             # NEW: Structured prompt system
│   └── index.ts                        # Exports
├── docs/                               # Documentation
│   ├── roadmap.md                      # Updated project roadmap
│   ├── status.md                       # Current status
│   ├── BUG-FIXES-COMPLETE.md          # Bug fix documentation
│   └── steps/                          # Step-by-step docs
└── README.md                           # ENHANCED: Updated documentation
```

## Development Steps

- ✅ **STEP 00**: Project scaffold and API setup
- ✅ **STEP 01**: Single invoice editor interface
- ✅ **STEP 01.5**: Batch invoice generation with GPT-4o
- ✅ **STEP 02**: PDF export functionality with multi-template system
- ✅ **STEP 02.5**: Enhanced prompt system and NDA document support
- ✅ **BUG FIXES**: Arabic locale validation, PDF preview rendering, batch enhancements
- ✅ **ENHANCEMENTS**: Multi-currency support, file upload system, enhanced UI/UX
- � **STEP 03**: Complete NDA document implementation with UI components
- �📋 **STEP 04**: Advanced features and polish (authentication, payment integration)

## Recent Updates (September 2025)

### 🌍 **NEW: Comprehensive Multilingual Support**

- **11+ Languages**: English, French, German, Spanish, Arabic, Chinese, Japanese, Portuguese, Italian, Russian, Hindi
- **Cultural Context Integration**: AI adapts language to local business practices and terminology
- **RTL Language Support**: Proper text direction and formatting for Arabic documents
- **Localized PDF Generation**: Currency, date, and number formatting according to regional standards
- **Interactive Demo**: Test multilingual features at `/demo/multilang-pdf`
- **API Endpoints**: Dedicated multilingual generation endpoints with cultural context
- **Enhanced Prompt System**: Language-specific AI instructions with cultural adaptations

### ✨ Enhanced Prompt System Implementation

- **Structured AI Prompts**: Professional document generation with validation
- **Rich Response Format**: JSON responses with metadata and assumptions
- **Multi-Document Support**: Invoices and NDAs with extensible architecture
- **Interactive Testing**: `/test/enhanced` page for real-time validation

### 🐛 Critical Bug Fixes

- **Arabic Locale Support**: Fixed RTL currency formatting and validation
- **PDF Preview Rendering**: Implemented blob URL fallback for browser compatibility
- **Batch Processing**: Enhanced CSV parsing for multi-item invoices

### 🎨 UI/UX Enhancements

- **Glass Morphism Design**: Modern visual effects with backdrop blur
- **Toast Notifications**: Smooth animations with professional styling
- **Loading States**: Enhanced loading components with spinners
- **Hero Section**: Updated with 3D effects and floating animations

## Legal Disclaimer

This application does not provide legal advice. All generated documents should be reviewed by qualified professionals before use.

## License

MIT
