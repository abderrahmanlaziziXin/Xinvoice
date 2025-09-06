# Document Generator MVP

A Next.js 14 application for generating documents (invoices, NDAs) using AI assistance.

## Features

- 🤖 AI-powered document generation (GPT-4o or Google Gemini)
- 📄 Single and batch invoice generation
- 🚀 Create multiple invoices simultaneously with unique numbering
- ✏️ Bulk editing interface for batch-generated invoices
- 📦 Bulk PDF download for multiple invoices
- 📝 Form-based editing with live validation
- 📊 Automatic calculations for invoices
- 🏢 Company settings and context saving
- 📧 Email validation with warnings
- 📅 Smart date handling (AI calculates due dates)
- 📄 **Professional PDF Export**: Multi-template system (Modern/Classic/Minimal)
- 🔍 **PDF Preview**: Real-time preview with customization options
- 💾 Session-based history (in-memory)
- 🎨 Modern, responsive design with animations
- 💰 **Multi-Currency Support**: 28+ currencies (USD, EUR, GBP, DZD, MAD, TND, etc.)
- 🌍 **Localization**: 32+ locales with regional formatting
- 📁 **File Upload**: CSV/Excel upload with intelligent AI parsing
- 🔄 **Dual Input Modes**: Text and file upload for batch processing
- ✨ **Professional UI**: Glass morphism design with Framer Motion animations
- 🛡️ **Type Safety**: Full TypeScript coverage with Zod validation

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **State**: TanStack Query
- **AI**: OpenAI API (GPT-4o) or Google Gemini API

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

## Key Features

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

### 🚀 Batch Invoice Processing
- **Multiple Input Fields**: Add as many invoice requests as needed
- **Smart Processing**: Single request uses standard API, multiple requests use batch processing
- **Bulk Generation**: Generate all invoices simultaneously with GPT-4o
- **Unique Numbering**: Each invoice gets unique numbers (INV-001, INV-002, etc.)
- **Bulk Editing**: Edit each invoice individually in a unified interface
- **Bulk Download**: Download all PDFs together (framework ready)
- **Consistent Branding**: Company settings apply to all invoices automatically

## API Usage

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
│   │   ├── generate/          # Single document generation API
│   │   └── generate-batch/    # Batch document generation API
│   ├── (app)/new/
│   │   ├── invoice/           # Single invoice creation page
│   │   └── invoice-batch/     # Batch invoice creation page
│   ├── components/
│   │   ├── company-settings.tsx    # Company configuration modal
│   │   └── invoice-form.tsx         # Invoice editing form
│   ├── hooks/
│   │   ├── use-generate-document.ts       # Single generation hook
│   │   └── use-generate-batch-documents.ts # Batch generation hook
│   ├── lib/
│   │   └── user-context.ts          # User settings management
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── packages/core/            # Shared logic
│   ├── schemas.ts            # Zod schemas
│   ├── llm-provider.ts       # AI provider adapters with batch support
│   └── index.ts              # Exports
├── docs/                     # Documentation
│   ├── roadmap.md            # Project roadmap
│   ├── status.md             # Current status
│   └── steps/                # Step-by-step docs
└── README.md
```

## Development Steps

- ✅ **STEP 00**: Project scaffold and API setup
- ✅ **STEP 01**: Single invoice editor interface  
- ✅ **STEP 01.5**: Batch invoice generation with GPT-4o
- 📋 **STEP 02**: PDF export functionality
- 📋 **STEP 03**: NDA document support
- 📋 **STEP 04**: Polish and demo prep

## Legal Disclaimer

This application does not provide legal advice. All generated documents should be reviewed by qualified professionals before use.

## License

MIT
