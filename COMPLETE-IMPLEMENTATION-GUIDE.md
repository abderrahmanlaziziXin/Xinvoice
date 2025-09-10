# 🚀 XINVOICE - Complete Platform Implementation Guide

## 📋 EXECUTIVE SUMMARY

Build an **AI-powered document generation platform** identical to the current Xinvoice system. This platform generates professional invoices and NDAs using OpenAI GPT-4o, supports 11+ languages with cultural context, batch processing, multilingual PDF generation, and premium UI/UX with glass morphism design.

---

## 🏗️ TECHNICAL ARCHITECTURE

### **Technology Stack**
```json
{
  "framework": "Next.js 14.2.5 (App Router)",
  "language": "TypeScript (strict mode)",
  "runtime": "Node.js 20+",
  "ai_models": ["OpenAI GPT-4o", "Google Gemini (fallback)"],
  "styling": "Tailwind CSS 3.3.0",
  "animations": "Framer Motion 12.23.12",
  "state_management": "TanStack Query 5.87.1 + React Context",
  "validation": "Zod 3.25.76",
  "pdf_generation": "jsPDF 3.0.2 + jspdf-autotable 5.0.2",
  "file_processing": "Papa Parse 5.5.3 + XLSX 0.18.5",
  "forms": "React Hook Form 7.62.0",
  "icons": "Heroicons React 2.2.0",
  "notifications": "React Hot Toast 2.6.0"
}
```

### **Project Architecture**
```
xinvoice/
├── app/                         # Next.js App Router
│   ├── (app)/                  # Main app routes
│   │   ├── new/                # Document creation
│   │   │   ├── invoice/        # Single invoice creation
│   │   │   ├── invoice-batch/  # Batch invoice creation
│   │   │   └── nda/           # NDA creation
│   │   ├── demo/              # Feature demonstrations
│   │   │   └── multilang-pdf/ # Multilingual demo
│   │   └── test/              # Testing interfaces
│   │       └── enhanced/      # Enhanced features test
│   ├── api/                   # API endpoints
│   │   ├── generate/          # Single document generation
│   │   ├── generate-batch/    # Batch document generation
│   │   ├── generate-multilingual/      # Multilingual single
│   │   ├── generate-multilingual-batch/ # Multilingual batch
│   │   └── generate-enhanced/ # Enhanced document generation
│   ├── components/            # React components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and libraries
│   │   ├── i18n/            # Internationalization
│   │   └── pdf/             # PDF generation utilities
│   ├── context/             # React context providers
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── packages/core/           # Core business logic
│   ├── index.ts            # Main exports
│   ├── schemas.ts          # Zod validation schemas
│   ├── llm-provider.ts     # AI provider abstractions
│   └── enhanced-prompts.ts # Enhanced prompt system
├── public/                 # Static assets
│   ├── favicon.ico
│   ├── icon.svg           # Main logo
│   └── fonts/            # Custom fonts
├── docs/                  # Documentation
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

---

## 🎨 DESIGN SYSTEM & BRANDING

### **Brand Identity: "Xinvoice"**
```css
/* Primary Brand Colors */
:root {
  --xinfinity-primary: #1e40af;    /* Blue 800 */
  --xinfinity-secondary: #06b6d4;  /* Cyan 500 */
  --xinfinity-accent: #1e3a8a;     /* Blue 900 */
  --xinfinity-surface: #f8fafc;    /* Gray 50 */
  --xinfinity-border: #e2e8f0;     /* Gray 200 */
  --xinfinity-foreground: #0f172a; /* Gray 900 */
  --xinfinity-muted: #64748b;      /* Gray 500 */
}

/* Glass Morphism Effects */
.xinfinity-card {
  @apply bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl;
}

.xinfinity-background {
  @apply bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100;
}
```

### **Typography System**
```css
/* Font Family: Inter (Google Fonts) */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

.font-sans {
  font-family: 'Inter', system-ui, sans-serif;
}
```

### **Logo Implementation**
The logo is an SVG-based ribbon design with animated properties:
- **File**: `/public/icon.svg`
- **Component**: `app/components/logo.tsx`
- **Features**: Scalable, animated hover effects, multiple color variants
- **Usage**: Navigation header, hero section, form headers

---

## 📄 CORE FEATURES IMPLEMENTATION

### 1. **AI DOCUMENT GENERATION ENGINE**

#### **Single Document API** (`/app/api/generate/route.ts`)
```typescript
// Request Schema
interface GenerateRequest {
  prompt: string;                    // Natural language description
  documentType: 'invoice' | 'nda';   // Document type
  userContext?: UserContext;         // Company settings
}

// Response Schema
interface GenerateResponse {
  success: boolean;
  document: Invoice | NDA;           // Validated document
  error?: string;                    // Error message if failed
}

// Implementation Details
- Uses OpenAI GPT-4o with structured JSON responses
- Comprehensive system prompts with detailed instructions
- Zod schema validation for all generated documents
- Automatic date calculation (due dates, relative dates)
- Professional item breakdown (detailed line items)
- Email validation and cleaning
- Multi-currency and locale support
```

#### **Batch Processing API** (`/app/api/generate-batch/route.ts`)
```typescript
// Request Schema
interface BatchGenerateRequest {
  prompts: string[];                 // Array of prompts (max 10)
  documentType: 'invoice' | 'nda';   // Document type
  userContext?: UserContext;         // Company settings
}

// Response Schema
interface BatchGenerateResponse {
  success: boolean;
  documents: (Invoice | NDA)[];      // Array of validated documents
  count: number;                     // Number of generated documents
  error?: string;                    // Error message if failed
}

// Implementation Details
- Single API call processes multiple prompts efficiently
- Unique sequential numbering (INV-001, INV-002, etc.)
- Individual document validation with error recovery
- Consistent company branding across all documents
- Optimized for GPT-4o batch processing capabilities
```

#### **Multilingual Support** (`/app/api/generate-multilingual/route.ts`)
```typescript
// Supported Languages (11+)
const SUPPORTED_LOCALES = [
  'en-US',  // English (US)
  'fr-FR',  // French (France) 
  'de-DE',  // German (Germany)
  'es-ES',  // Spanish (Spain)
  'ar-SA',  // Arabic (Saudi Arabia) - RTL support
  'zh-CN',  // Chinese (Simplified)
  'ja-JP',  // Japanese
  'pt-BR',  // Portuguese (Brazil)
  'it-IT',  // Italian
  'ru-RU',  // Russian
  'hi-IN'   // Hindi (India)
];

// Request Schema
interface MultilingualRequest {
  prompt: string;                    // Prompt in any language
  documentType: 'invoice' | 'nda';   // Document type
  locale: string;                    // Target locale
  culturalContext: boolean;          // Apply cultural adaptations
  userContext?: UserContext;         // Company settings
}

// Cultural Context Features
- Business practice adaptations per region
- Legal terminology appropriate for jurisdiction
- Currency formatting and symbols
- Date and number formatting standards
- Formal vs informal tone based on culture
- RTL text direction for Arabic languages
```

### 2. **COMPREHENSIVE SCHEMA SYSTEM**

#### **Core Schemas** (`/packages/core/schemas.ts`)
```typescript
// Currency Support (28+ currencies)
export const CurrencySchema = z.enum([
  'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK',
  'PLN', 'CZK', 'HUF', 'RUB', 'CNY', 'INR', 'BRL', 'MXN', 'ZAR', 'DZD',
  'MAD', 'TND', 'EGP', 'NGN', 'KES', 'GHS', 'XOF', 'XAF', 'SAR'
]);

// Locale Support (32+ locales)
export const LocaleSchema = z.enum([
  'en-US', 'en-GB', 'en-CA', 'en-AU', 'fr-FR', 'fr-CA', 'de-DE', 'es-ES',
  'it-IT', 'pt-BR', 'pt-PT', 'nl-NL', 'sv-SE', 'no-NO', 'da-DK', 'fi-FI',
  'pl-PL', 'cs-CZ', 'hu-HU', 'ru-RU', 'zh-CN', 'ja-JP', 'ko-KR', 'ar-SA',
  'ar-AE', 'ar-EG', 'ar-DZ', 'ar-MA', 'ar-TN', 'hi-IN', 'th-TH', 'vi-VN'
]);

// Invoice Schema (Complete)
export const InvoiceSchema = z.object({
  type: z.literal('invoice'),
  invoiceNumber: z.string().min(1),
  date: z.string().min(1),           // YYYY-MM-DD format
  dueDate: z.string().min(1),        // YYYY-MM-DD format
  from: InvoicePartySchema,          // Billing company details
  to: InvoicePartySchema,            // Client details
  items: z.array(InvoiceItemSchema).min(1),  // Line items
  subtotal: z.number(),              // Calculated subtotal
  taxRate: z.number().min(0).max(1), // Tax rate (0.08 = 8%)
  taxAmount: z.number(),             // Calculated tax amount
  total: z.number(),                 // Final total
  currency: CurrencySchema,          // Currency code
  locale: LocaleSchema,              // Locale for formatting
  terms: z.string().optional(),      // Payment terms
  notes: z.string().optional(),      // Additional notes
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).default('draft')
});

// NDA Schema (Complete)
export const NDASchema = z.object({
  type: z.literal('nda'),
  title: z.string().min(1),
  disclosingParty: NDAPartySchema,   // Party sharing information
  receivingParty: NDAPartySchema,    // Party receiving information
  purpose: z.string().min(1),        // Purpose of disclosure
  duration: z.string().min(1),       // Duration of agreement
  effectiveDate: z.string(),         // Start date
  jurisdiction: z.string(),          // Legal jurisdiction
  confidentialityLevel: z.enum(['standard', 'high', 'mutual']),
  sections: z.array(NDASectionSchema), // Legal sections
  exceptions: z.array(z.string()),   // Information exceptions
  remedies: z.string(),              // Breach remedies
  locale: LocaleSchema,              // Language/region
  currency: CurrencySchema           // For any monetary clauses
});
```

### 3. **ADVANCED PDF GENERATION SYSTEM**

#### **Multi-Template PDF Generator** (`/app/lib/pdf-generator.ts`)
```typescript
// Template Types
type TemplateType = 'modern' | 'classic' | 'minimal';
type PDFTheme = 'primary' | 'neutral' | 'dark';

// PDF Generation Options
interface PDFGenerationOptions {
  template: TemplateType;            // Template selection
  theme: PDFTheme;                   // Color theme
  includeWatermark: boolean;         // Watermark overlay
  companyLogo?: string;              // Logo URL/base64
  accentColor?: string;              // Custom accent color
  showQRCode: boolean;               // Payment QR code
  websiteUrl?: string;               // Company website
}

// Template Features
Modern Template:
- Clean typography with Inter font
- Gradient headers and accents
- Professional layout with ample whitespace
- Company branding integration
- Multi-currency formatting

Classic Template:
- Traditional business invoice layout
- Conservative styling
- Professional serif typography
- Standard business formatting
- Timeless design approach

Minimal Template:
- Ultra-clean design
- Maximum whitespace
- Simple typography
- Focused on content clarity
- Modern minimalist aesthetic
```

#### **Multilingual PDF Generator** (`/app/lib/i18n/multilingual-pdf-generator.ts`)
```typescript
export class MultilingualPDFGenerator {
  private doc: jsPDF;
  private language: string;
  private isRTL: boolean;            // Right-to-left support

  constructor(language: string = 'en-US') {
    this.language = language;
    this.isRTL = ['ar-SA', 'ar-AE', 'ar-EG', 'ar-DZ', 'ar-MA', 'ar-TN'].includes(language);
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
  }

  // Features
  - RTL text direction for Arabic languages
  - Cultural date and number formatting
  - Localized labels and terminology
  - Currency symbols and formatting per region
  - Professional business formatting standards
  - Font selection appropriate for language
}
```

### 4. **PREMIUM UI/UX IMPLEMENTATION**

#### **Hero Section** (`/app/components/hero.tsx`)
```typescript
// Features
- Glass morphism design with backdrop blur
- 3D floating animations with Framer Motion
- Gradient backgrounds and effects
- Interactive feature cards
- Responsive design with mobile optimization
- Professional CTAs with hover animations
- Animated logo integration
- Particle/blob background animations

// Layout Structure
1. Navigation header with logo and company settings
2. Hero section with animated title and description
3. Feature showcase cards with icons and descriptions
4. Call-to-action buttons for different workflows
5. Footer with additional links and information
```

#### **Form Components** (`/app/components/invoice-form.tsx`)
```typescript
// Advanced Form Features
- React Hook Form with Zod validation
- Dynamic field arrays for invoice items
- Real-time calculations (subtotal, tax, total)
- Auto-save with local storage persistence
- Email validation with warning modals
- Multi-currency support with formatting
- Date picker integration
- Professional error handling and display
- Loading states and optimistic updates
- PDF preview integration with template selection

// Form Validation
- Required field validation
- Email format validation
- Positive number validation for amounts
- Date range validation
- Custom business logic validation
- Real-time error display with helpful messages
```

#### **Navigation System** (`/app/components/navigation-header.tsx`)
```typescript
// Navigation Features
- Responsive mobile-first design
- Logo integration with animations
- Company settings modal integration
- Breadcrumb navigation for deep pages
- Glass morphism styling
- Smooth animations and transitions
- User context awareness
- Professional business styling
```

### 5. **FILE PROCESSING SYSTEM**

#### **CSV/Excel Upload** (`/app/lib/file-parser.ts`)
```typescript
// Supported File Formats
- CSV files (any delimiter)
- Excel files (.xlsx, .xls)
- TSV (tab-separated values)
- Any structured data format

// Intelligent Parsing Features
- Automatic column detection and mapping
- AI-powered content interpretation
- Support for multi-item invoices (item1_, item2_, etc.)
- Flexible schema adaptation
- Error handling and validation
- Progress indicators for large files
- Preview functionality before processing

// AI Integration
- GPT-4o analyzes uploaded data structure
- Intelligent field mapping to invoice/NDA schemas
- Content interpretation and cleaning
- Automatic data validation and enhancement
- Support for incomplete or messy data
```

### 6. **STATE MANAGEMENT SYSTEM**

#### **React Query Integration** (`/app/components/query-provider.tsx`)
```typescript
// TanStack Query Configuration
- Global cache management for API responses
- Optimistic updates for better UX
- Background refetching for data freshness
- Error boundary integration
- Loading state management
- Mutation handling for document generation
- Retry logic for failed requests
- Cache invalidation strategies
```

#### **Document Context** (`/app/context/document-context.tsx`)
```typescript
// Session-Based Document Management
- In-memory document storage
- Auto-save functionality
- Draft persistence across page refreshes
- Document history and versioning
- Batch document management
- Context sharing between components
- Type-safe document operations
```

#### **User Context** (`/app/lib/user-context.ts`)
```typescript
// Company Settings Management
interface UserContext {
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  defaultCurrency: Currency;
  defaultLocale: Locale;
  defaultTaxRate: number;
  defaultTerms: string;
  logoUrl?: string;
  website?: string;
}

// Features
- Persistent company settings in localStorage
- Default value injection for new documents
- Settings validation and sanitization
- Company branding integration
- Tax rate and currency preferences
- Professional template defaults
```

---

## 🌍 MULTILINGUAL IMPLEMENTATION

### **Translation System** (`/app/lib/i18n/translations/`)
```typescript
// Translation Files Structure
translations/
├── en-US.json    # English (US) - Base language
├── fr-FR.json    # French (France)
├── de-DE.json    # German (Germany)  
├── es-ES.json    # Spanish (Spain)
├── ar-SA.json    # Arabic (Saudi Arabia) - RTL
├── zh-CN.json    # Chinese (Simplified)
├── ja-JP.json    # Japanese
├── pt-BR.json    # Portuguese (Brazil)
├── it-IT.json    # Italian
├── ru-RU.json    # Russian
└── hi-IN.json    # Hindi (India)

// Translation Structure
{
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "save": "Save",
    "cancel": "Cancel"
  },
  "invoice": {
    "title": "Invoice",
    "number": "Invoice Number",
    "date": "Invoice Date",
    "dueDate": "Due Date",
    "billTo": "Bill To",
    "billFrom": "Bill From",
    "items": "Items",
    "subtotal": "Subtotal",
    "tax": "Tax",
    "total": "Total"
  },
  "nda": {
    "title": "Non-Disclosure Agreement",
    "disclosingParty": "Disclosing Party",
    "receivingParty": "Receiving Party",
    "purpose": "Purpose",
    "duration": "Duration"
  }
}
```

### **Cultural Context System** (`/app/lib/i18n/cultural-context.ts`)
```typescript
// Cultural Adaptations by Region
interface CulturalContext {
  locale: string;
  businessPractices: {
    formalityLevel: 'formal' | 'neutral' | 'casual';
    titleUsage: boolean;              // Use titles (Mr., Mrs., etc.)
    companyFirst: boolean;            // Company name before person name
    addressFormat: string;            // Address formatting pattern
  };
  legalTerminology: {
    contractLanguage: 'formal' | 'standard';
    jurisdictionRequired: boolean;
    witnessRequired: boolean;
    notarizationCommon: boolean;
  };
  financialPractices: {
    currencyPosition: 'before' | 'after';  // Currency symbol position
    numberFormat: string;             // Number formatting pattern
    taxDisplayed: boolean;            // Show tax separately
    paymentTermsStandard: string[];   // Common payment terms
  };
}

// Examples
'fr-FR': {
  businessPractices: {
    formalityLevel: 'formal',         // Use formal French business language
    titleUsage: true,                 // Include Monsieur/Madame
    companyFirst: true,               // Company before personal name
    addressFormat: 'european'        // European address formatting
  }
}

'ar-SA': {
  businessPractices: {
    formalityLevel: 'formal',         // Formal Arabic business language
    titleUsage: true,                 // Include Arabic titles
    companyFirst: false,              // Personal name first
    addressFormat: 'arabic'          // Arabic address formatting
  }
}
```

### **RTL Support Implementation**
```css
/* RTL Language Support */
[dir="rtl"] {
  text-align: right;
  direction: rtl;
}

[dir="rtl"] .flex {
  flex-direction: row-reverse;
}

[dir="rtl"] .ml-auto {
  margin-left: 0;
  margin-right: auto;
}

/* Arabic Font Support */
[lang="ar"] {
  font-family: 'Noto Sans Arabic', 'Arial', sans-serif;
  line-height: 1.8;
}
```

---

## 🔧 API ENDPOINTS COMPLETE SPECIFICATION

### **1. Single Document Generation** 
```
POST /api/generate
Content-Type: application/json

Request Body:
{
  "prompt": "Invoice ACME Corp $2500 for web development, due in 30 days",
  "documentType": "invoice",
  "userContext": {
    "companyName": "My Company Inc",
    "companyEmail": "billing@mycompany.com",
    "defaultCurrency": "USD",
    "defaultTaxRate": 0.08
  }
}

Response (Success):
{
  "success": true,
  "document": {
    "type": "invoice",
    "invoiceNumber": "INV-001",
    "date": "2025-09-08",
    "dueDate": "2025-10-08",
    "from": {
      "name": "My Company Inc",
      "email": "billing@mycompany.com"
    },
    "to": {
      "name": "ACME Corp"
    },
    "items": [
      {
        "description": "Frontend Development - Custom React Components",
        "quantity": 1,
        "rate": 1200,
        "amount": 1200
      },
      {
        "description": "Backend API Development - Database Integration",
        "quantity": 1,
        "rate": 1300,
        "amount": 1300
      }
    ],
    "subtotal": 2500,
    "taxRate": 0.08,
    "taxAmount": 200,
    "total": 2700,
    "currency": "USD",
    "locale": "en-US"
  }
}

Response (Error):
{
  "success": false,
  "error": "Validation error",
  "details": [
    {
      "field": "to.name",
      "message": "Client name is required"
    }
  ]
}
```

### **2. Batch Document Generation**
```
POST /api/generate-batch
Content-Type: application/json

Request Body:
{
  "prompts": [
    "Invoice ACME Corp $2500 for web development, due in 30 days",
    "Invoice XYZ Company $1200 for logo design, due in 15 days",
    "Invoice Tech Solutions $3500 for mobile app, due in 45 days"
  ],
  "documentType": "invoice",
  "userContext": {
    "companyName": "My Company Inc",
    "defaultCurrency": "USD",
    "defaultTaxRate": 0.08
  }
}

Response (Success):
{
  "success": true,
  "documents": [
    {
      "type": "invoice",
      "invoiceNumber": "INV-001",
      "to": { "name": "ACME Corp" },
      "total": 2700
      // ... full invoice object
    },
    {
      "type": "invoice",
      "invoiceNumber": "INV-002", 
      "to": { "name": "XYZ Company" },
      "total": 1296
      // ... full invoice object
    },
    {
      "type": "invoice",
      "invoiceNumber": "INV-003",
      "to": { "name": "Tech Solutions" },
      "total": 3780
      // ... full invoice object
    }
  ],
  "count": 3
}
```

### **3. Multilingual Document Generation**
```
POST /api/generate-multilingual
Content-Type: application/json

Request Body:
{
  "prompt": "Créer une facture pour ACME Corp 2500€ pour développement web, échéance 30 jours",
  "documentType": "invoice",
  "locale": "fr-FR",
  "culturalContext": true,
  "userContext": {
    "companyName": "Ma Société SARL",
    "defaultCurrency": "EUR"
  }
}

Response (Success):
{
  "success": true,
  "document": {
    "type": "invoice",
    // ... localized invoice with French labels and formatting
  },
  "metadata": {
    "locale": "fr-FR",
    "language": "French",
    "direction": "ltr",
    "currency": "EUR"
  },
  "localized_labels": {
    "invoice": "Facture",
    "date": "Date",
    "dueDate": "Date d'échéance",
    "billTo": "Facturer à",
    "total": "Total"
  }
}
```

### **4. Enhanced Document Generation**
```
POST /api/generate-enhanced
Content-Type: application/json

Request Body:
{
  "prompt": "Create professional invoice for consulting services",
  "documentType": "invoice",
  "userContext": {
    "companyName": "Consulting Pro LLC"
  }
}

Response (Success):
{
  "success": true,
  "document": {
    // ... standard invoice object
  },
  "metadata": {
    "confidence": 0.95,
    "processingTime": 1.2,
    "model": "gpt-4o",
    "version": "2.0.0"
  },
  "assumptions": [
    "Used standard consulting rates based on industry averages",
    "Applied 30-day payment terms as business standard",
    "Generated detailed service breakdown for professional presentation"
  ],
  "suggestions": [
    "Consider adding specific deliverables to line items",
    "Include payment methods for faster processing"
  ],
  "validation_notes": [
    "All required fields completed successfully",
    "Tax rate applied based on company location"
  ]
}
```

---

## 🎯 REACT COMPONENTS DETAILED IMPLEMENTATION

### **1. Invoice Form Component** (`/app/components/invoice-form.tsx`)
```typescript
interface InvoiceFormProps {
  initialData?: Partial<Invoice>;    // Pre-populated data
  onSubmit: (data: Invoice) => void; // Submit handler
  isSubmitting?: boolean;            // Loading state
  aiAssumptions?: string[];          // AI assumptions display
  defaultCurrency?: string;          // Default currency
  defaultLocale?: string;            // Default locale
  persistSettings?: (currency: string, locale: string) => void;
}

// Key Features
- React Hook Form with Zod validation
- Dynamic item array management (add/remove items)
- Real-time calculations (subtotal, tax, total)
- Currency and locale selection
- Date picker integration
- Email validation with warnings
- Auto-save functionality
- PDF preview integration
- Professional styling with animations
- Error handling and display
- Loading states and optimistic updates
- Company settings integration

// Item Management
- Add/remove invoice items dynamically
- Automatic amount calculation (quantity × rate)
- Professional service descriptions
- Real-time total updates
- Validation for all numeric fields

// Form Sections
1. Invoice Details (number, dates, currency)
2. Billing Information (from/to parties)
3. Line Items (dynamic array)
4. Totals (calculated automatically)
5. Terms and Notes
6. Actions (save, preview, download)
```

### **2. Company Settings Modal** (`/app/components/company-settings.tsx`)
```typescript
interface CompanySettingsProps {
  isOpen: boolean;                   // Modal visibility
  onClose: () => void;               // Close handler
  onSave: (settings: UserContext) => void; // Save handler
  initialSettings?: UserContext;     // Current settings
}

// Form Fields
- Company name, address, email, phone
- Default currency and locale selection
- Default tax rate (percentage input)
- Default payment terms
- Logo upload (future enhancement)
- Website URL
- Tax number/registration
- Bank details (optional)

// Features
- Form validation with Zod schema
- Currency selection with search
- Locale selection with country flags
- Persistent storage in localStorage
- Professional modal design with glass morphism
- Auto-population of invoice defaults
- Error handling and validation messages
```

### **3. PDF Preview Modal** (`/app/components/pdf-preview-modal.tsx`)
```typescript
interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;                  // Invoice data
  template?: TemplateType;           // Template selection
  onTemplateChange?: (template: TemplateType) => void;
  onDownload?: () => void;           // Download handler
}

// Features
- Real-time PDF preview in modal
- Template switching (Modern/Classic/Minimal)
- Theme selection (Primary/Neutral/Dark)
- Watermark toggle
- Company logo integration
- Download functionality
- Print option
- Mobile-responsive preview
- Loading states for PDF generation
- Error handling for preview failures

// Preview Options
- Template selection with live preview
- Theme customization
- Branding options (logo, colors)
- Watermark settings
- Quality settings
```

### **4. File Upload Component** (`/app/components/file-upload.tsx`)
```typescript
interface FileUploadProps {
  onFileUpload: (data: any[]) => void; // Parsed data handler
  supportedFormats: string[];          // Allowed file types
  maxFileSize: number;                 // Size limit in MB
  onError: (error: string) => void;    // Error handler
}

// Features
- Drag and drop interface
- Multiple file format support (CSV, Excel, TSV)
- File validation (size, format)
- Progress indicators
- Preview of parsed data
- Error handling and user feedback
- AI-powered data interpretation
- Column mapping assistance
- Batch processing preparation

// Supported Formats
- .csv (any delimiter)
- .xlsx, .xls (Excel)
- .tsv (tab-separated)
- Custom delimiter detection
- UTF-8 and other encoding support
```

### **5. Navigation Header** (`/app/components/navigation-header.tsx`)
```typescript
// Features
- Responsive design (mobile hamburger menu)
- Logo integration with animations
- Company settings access
- Breadcrumb navigation
- Glass morphism styling
- Professional business appearance
- User context awareness
- Quick access to main features

// Navigation Items
- Home / Dashboard
- Create Invoice (single)
- Create Batch Invoices
- Create NDA
- Demo Features
- Company Settings
- Help/Documentation
```

---

## 🔄 REACT HOOKS IMPLEMENTATION

### **1. Document Generation Hook** (`/app/hooks/use-generate-document.ts`)
```typescript
export function useGenerateDocument() {
  return useMutation({
    mutationFn: async (request: GenerateDocumentRequest) => {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Generation failed');
      }
      
      return response.json();
    },
    onError: (error) => {
      console.error('Document generation failed:', error);
      // Toast notification handling
    },
    onSuccess: (data) => {
      console.log('Document generated successfully:', data);
      // Success feedback
    }
  });
}

// Usage
const generateMutation = useGenerateDocument();
const handleGenerate = () => {
  generateMutation.mutate({
    prompt: "Invoice ACME Corp $2500",
    documentType: "invoice",
    userContext: companySettings
  });
};
```

### **2. Batch Generation Hook** (`/app/hooks/use-generate-batch-documents.ts`)
```typescript
export function useGenerateBatchDocuments() {
  return useMutation({
    mutationFn: async (request: GenerateBatchDocumentRequest) => {
      const response = await fetch('/api/generate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Batch generation failed');
      }
      
      return response.json();
    },
    onError: (error) => {
      console.error('Batch generation failed:', error);
    }
  });
}
```

### **3. Multilingual Hook** (`/app/hooks/use-generate-multilingual-document.ts`)
```typescript
export function useGenerateMultilingualDocument() {
  return useMutation({
    mutationFn: async (request: MultilingualGenerateRequest) => {
      const response = await fetch('/api/generate-multilingual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Multilingual generation failed');
      }
      
      return response.json();
    }
  });
}
```

### **4. User Context Hook** (`/app/hooks/use-persisted-settings.ts`)
```typescript
export function usePersistedSettings() {
  const [context, setContext] = useState<UserContext | null>(null);
  
  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('xinvoice-company-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setContext(UserContextSchema.parse(parsed));
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);
  
  const saveContext = useCallback((newContext: UserContext) => {
    setContext(newContext);
    localStorage.setItem('xinvoice-company-settings', JSON.stringify(newContext));
  }, []);
  
  return { context, saveContext };
}
```

---

## 📱 USER INTERFACE PAGES

### **1. Home Page** (`/app/page.tsx`)
```typescript
// Hero Section Features
- Animated logo and branding
- Glass morphism cards showcasing features
- Call-to-action buttons for main workflows
- Feature highlights with icons and descriptions
- Floating animations and 3D effects
- Professional gradient backgrounds
- Responsive mobile design

// Feature Cards
1. AI-Powered Generation
2. Multilingual Support
3. Batch Processing
4. Professional PDF Export
5. File Upload Support
6. Cultural Context
7. Real-time Collaboration
8. Professional Templates

// Navigation Options
- Create Single Invoice
- Create Batch Invoices
- Create NDA
- View Demo Features
- Access Company Settings
```

### **2. Single Invoice Page** (`/app/(app)/new/invoice/page.tsx`)
```typescript
// Page Workflow
1. Prompt Input Section
   - Large textarea for natural language input
   - Sample prompts for guidance
   - AI generation button with loading states
   - File upload alternative

2. Generated Invoice Form
   - Pre-populated form from AI generation
   - Editable fields with validation
   - Real-time calculations
   - PDF preview and download options

3. Company Settings Integration
   - Modal overlay for company details
   - Auto-population of billing information
   - Persistent settings storage

// Features
- Auto-save functionality
- Error handling and recovery
- Loading states and animations
- Professional business styling
- Mobile responsive design
- Breadcrumb navigation
- Toast notifications
```

### **3. Batch Invoice Page** (`/app/(app)/new/invoice-batch/page.tsx`)
```typescript
// Page Structure
1. Batch Input Section
   - Multiple prompt inputs (add/remove)
   - File upload for CSV/Excel
   - Smart processing detection
   - Batch generation button

2. Bulk Editing Interface
   - Generated invoices in separate sections
   - Individual editing capabilities
   - Quick overview of all invoices
   - Bulk operations (save all, download all)

3. Results Management
   - Success/error indicators per invoice
   - Bulk PDF download with staggered timing
   - Individual invoice actions
   - Batch statistics and summary

// Features
- Dynamic prompt management
- Individual invoice validation
- Bulk operations with progress tracking
- Error recovery for failed generations
- Professional batch workflow
- Mobile responsive interface
```

### **4. Multilingual Demo Page** (`/app/(app)/demo/multilang-pdf/page.tsx`)
```typescript
// Demo Features
- Language selection dropdown (11+ languages)
- Cultural context toggle
- Sample prompts in different languages
- Real-time document generation
- PDF preview in selected language
- Download functionality
- RTL support demonstration for Arabic

// Interactive Elements
- Language selector with flags
- Cultural context explanation
- Before/after comparison
- Live PDF preview
- Download buttons
- Feature explanations

// Supported Demo Languages
- English (Business formal)
- French (European business style)
- German (Formal business language)
- Spanish (Professional terminology)
- Arabic (RTL with business context)
- Chinese (Simplified business language)
- Japanese (Formal business culture)
- Portuguese (Brazilian business style)
- Italian (European business standards)
- Russian (CIS business practices)
- Hindi (Indian business context)
```

---

## 🗂️ ESSENTIAL CONFIGURATION FILES

### **1. package.json**
```json
{
  "name": "xinvoice",
  "version": "1.0.0",
  "description": "AI-powered document generation platform",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.87.1",
    "@heroicons/react": "^2.2.0",
    "@hookform/resolvers": "^5.2.1",
    "framer-motion": "^12.23.12",
    "jspdf": "^3.0.2",
    "jspdf-autotable": "^5.0.2",
    "next": "^14.2.5",
    "openai": "^5.19.1",
    "papaparse": "^5.5.3",
    "react": "^18",
    "react-dom": "^18",
    "react-hook-form": "^7.62.0",
    "react-hot-toast": "^2.6.0",
    "xlsx": "^0.18.5",
    "zod": "^3.25.76",
    "@google/generative-ai": "^0.24.1"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/papaparse": "^5.3.16",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.2.13",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
```

### **2. tailwind.config.js**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './packages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Xinvoice brand colors
        xinfinity: {
          'primary': '#1e40af',        // Blue 800
          'primary-light': '#3b82f6',  // Blue 500
          'secondary': '#06b6d4',      // Cyan 500
          'secondary-light': '#0891b2', // Cyan 600
          'accent': '#1e3a8a',         // Blue 900
          'accent-light': '#1d4ed8',   // Blue 700
          'surface': '#f8fafc',        // Gray 50
          'border': '#e2e8f0',         // Gray 200
          'foreground': '#0f172a',     // Gray 900
          'muted': '#64748b',          // Gray 500
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
          '100%': { boxShadow: '0 0 30px rgba(59, 130, 246, 0.8)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
```

### **3. tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

### **4. next.config.js**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  }
}

module.exports = nextConfig
```

### **5. Environment Variables** (`.env.local`)
```bash
# AI Providers
OPENAI_API_KEY=sk-your-openai-key-here
GOOGLE_AI_API_KEY=your-gemini-key-here
LLM_PROVIDER=openai

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Optional: Analytics
VERCEL_ANALYTICS_ID=your-analytics-id
```

---

## 🚀 DEPLOYMENT & PRODUCTION

### **Vercel Deployment Configuration**
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["iad1"],
  "functions": {
    "app/api/*/route.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### **Production Checklist**
- [ ] OpenAI API key configured in environment variables
- [ ] Google Gemini API key configured (optional fallback)
- [ ] Environment variables set correctly
- [ ] TypeScript compilation passes without errors
- [ ] All API endpoints tested and functional
- [ ] PDF generation working in production environment
- [ ] File upload functionality tested with various formats
- [ ] Multilingual features tested across all supported languages
- [ ] Performance optimization completed (lazy loading, code splitting)
- [ ] Error monitoring setup (Sentry recommended)
- [ ] Analytics tracking configured
- [ ] SEO optimization complete (meta tags, OpenGraph)
- [ ] Security headers configured
- [ ] Rate limiting implemented for API endpoints
- [ ] Backup strategy for user data

---

## 📋 IMPLEMENTATION CHECKLIST

### **Phase 1: Foundation (Days 1-3)**
- [ ] Next.js 14 project setup with TypeScript
- [ ] Tailwind CSS configuration with custom design system
- [ ] Core schemas definition (Invoice, NDA, UserContext)
- [ ] OpenAI integration setup
- [ ] Basic API endpoints (generate single document)
- [ ] Home page with hero section
- [ ] Navigation header component
- [ ] Logo component implementation

### **Phase 2: Core Features (Days 4-7)**
- [ ] Single invoice creation page
- [ ] Invoice form component with validation
- [ ] Company settings modal
- [ ] Basic PDF generation (single template)
- [ ] User context management
- [ ] Document context for session management
- [ ] Toast notification system
- [ ] Error handling and loading states

### **Phase 3: Advanced Features (Days 8-12)**
- [ ] Batch processing API endpoint
- [ ] Batch invoice creation page
- [ ] File upload component
- [ ] CSV/Excel parsing system
- [ ] Multiple PDF templates (Modern, Classic, Minimal)
- [ ] PDF preview modal
- [ ] Advanced form features (dynamic items, calculations)
- [ ] Professional UI/UX polish with animations

### **Phase 4: Multilingual System (Days 13-16)**
- [ ] Multilingual API endpoints
- [ ] Translation system implementation
- [ ] Cultural context integration
- [ ] RTL support for Arabic languages
- [ ] Multilingual PDF generator
- [ ] Demo page for multilingual features
- [ ] All 11+ language support complete

### **Phase 5: Enhanced Features (Days 17-20)**
- [ ] Enhanced prompt system
- [ ] NDA document type implementation
- [ ] Testing interfaces
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility
- [ ] Production deployment setup

### **Phase 6: Polish & Production (Days 21-25)**
- [ ] Comprehensive testing (unit, integration, E2E)
- [ ] Error monitoring integration
- [ ] Analytics setup
- [ ] SEO optimization
- [ ] Security hardening
- [ ] Documentation completion
- [ ] Production deployment
- [ ] Performance monitoring

---

## 🔍 TESTING & QUALITY ASSURANCE

### **Testing Strategy**
```typescript
// Unit Tests (Jest + React Testing Library)
- Component rendering and behavior
- Utility function validation
- Schema validation testing
- PDF generation testing
- File parsing testing

// Integration Tests
- API endpoint testing
- Database operations
- File upload workflow
- PDF generation pipeline
- Multilingual functionality

// End-to-End Tests (Playwright)
- Complete invoice creation workflow
- Batch processing from upload to download
- Multilingual document generation
- Company settings management
- Error handling scenarios

// Performance Tests
- API response times
- PDF generation speed
- File upload processing
- Large batch operations
- Memory usage optimization
```

### **Quality Metrics**
- **Performance**: Lighthouse score > 90
- **Accessibility**: WCAG 2.1 AA compliance
- **SEO**: Complete meta tags and OpenGraph
- **Type Safety**: 100% TypeScript coverage
- **Test Coverage**: > 80% code coverage
- **Error Rate**: < 1% in production
- **API Response Time**: < 3 seconds average

---

## 📚 REQUIRED ASSETS & SETUP

### **What You Need to Provide**
1. **OpenAI API Key** - For GPT-4o document generation
2. **Logo Asset** - SVG format for the "Xinvoice" brand
3. **Brand Colors** - If different from current Xinfinity palette
4. **Company Information** - Default company details for testing
5. **Domain/Hosting** - Vercel account for deployment

### **Optional Enhancements**
1. **Google Gemini API Key** - For AI provider fallback
2. **Custom Domain** - Professional domain for production
3. **Analytics Account** - Google Analytics or Vercel Analytics
4. **Error Monitoring** - Sentry account for error tracking
5. **Font Licenses** - If using custom fonts beyond Inter

---

## 🎯 SUCCESS CRITERIA

### **Functional Requirements**
- ✅ Generate invoices and NDAs from natural language prompts
- ✅ Support 11+ languages with cultural context
- ✅ Process batch uploads (CSV/Excel) with AI interpretation
- ✅ Export professional PDFs with multiple templates
- ✅ Real-time form validation and calculations
- ✅ Company settings persistence and integration
- ✅ Mobile-responsive design across all devices
- ✅ Error handling and recovery mechanisms

### **Performance Requirements**
- ✅ Page load time < 2 seconds
- ✅ API response time < 5 seconds
- ✅ PDF generation < 3 seconds
- ✅ File upload processing < 10 seconds for 1MB files
- ✅ Lighthouse performance score > 90
- ✅ Zero client-side JavaScript errors

### **User Experience Requirements**
- ✅ Intuitive navigation and workflow
- ✅ Professional business appearance
- ✅ Comprehensive error messaging
- ✅ Loading states for all operations
- ✅ Auto-save functionality
- ✅ Toast notifications for user feedback
- ✅ Accessible design (WCAG 2.1 AA)

---

## 🚀 FINAL IMPLEMENTATION NOTES

### **Development Timeline: 25 Days**
- **Week 1** (Days 1-7): Foundation and core features
- **Week 2** (Days 8-14): Advanced features and batch processing
- **Week 3** (Days 15-21): Multilingual system and enhancements
- **Week 4** (Days 22-25): Polish, testing, and production deployment

### **Team Requirements**
- **1 Full-Stack Developer** (TypeScript, React, Next.js, AI integration)
- **Optional: 1 UI/UX Designer** (if custom design modifications needed)

### **Budget Considerations**
- **OpenAI API Costs**: ~$50-100/month for moderate usage
- **Vercel Hosting**: Free tier suitable for MVP, Pro tier for production
- **Domain**: ~$15/year for custom domain
- **Monitoring Tools**: Sentry free tier available

---

This specification provides **everything needed** to rebuild the Xinvoice platform with **identical functionality, design, and features**. The implementation should result in a production-ready AI document generation platform that matches or exceeds the current system's capabilities.

**Total Estimated Development Time**: 25 working days
**Complexity Level**: Intermediate to Advanced
**Tech Stack Maturity**: Production-ready, well-documented libraries
**Scalability**: Designed for growth and enterprise usage

Provide this specification to an AI agent along with your OpenAI API key and logo assets, and they will have everything needed to build an exact replica of your current platform.
