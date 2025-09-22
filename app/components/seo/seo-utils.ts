/**
 * SEO Utilities and Metadata Generation
 * Provides utilities for generating SEO-optimized metadata
 */

import { Metadata } from 'next'

interface SEOConfig {
  title: string
  description: string
  keywords?: string[] | readonly string[]
  canonical?: string
  noindex?: boolean
  nofollow?: boolean
  image?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  locale?: string
  alternateLocales?: string[]
}

export function generateMetadata(config: SEOConfig): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.xinfinitylabs.com'
  const {
    title,
    description,
    keywords = [],
    canonical,
    noindex = false,
    nofollow = false,
    image = `${baseUrl}/og-image.png`,
    type = 'website',
    publishedTime,
    modifiedTime,
    author = 'Xinvoice Team',
    section,
    locale = 'en_US',
    alternateLocales = []
  } = config

  // Convert readonly array to mutable array
  const keywordsArray = Array.isArray(keywords) ? [...keywords] : keywords

  const metadata: Metadata = {
    title: title,
    description: description,
    keywords: keywordsArray.join(', '),
    authors: [{ name: author }],
    creator: 'Xinvoice',
    publisher: 'Xinvoice',
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: title,
      description: description,
      url: canonical || baseUrl,
      siteName: 'Xinvoice',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale,
      type: type === 'product' ? 'website' : type, // OpenGraph doesn't support 'product' type
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [image],
      creator: '@xinvoice',
      site: '@xinvoice',
    },
    alternates: {
      canonical: canonical,
      languages: alternateLocales.reduce((acc, locale) => {
        acc[locale] = `${baseUrl}/${locale}`
        return acc
      }, {} as Record<string, string>),
    },
  }

  // Add article-specific metadata
  if (type === 'article') {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime: publishedTime,
      modifiedTime: modifiedTime,
      authors: [author],
      section: section,
    }
  }

  return metadata
}

// Predefined SEO configurations for common pages
export const SEO_CONFIGS = {
  home: {
    title: 'Xinvoice - AI-Powered Document Generation Platform | Create Professional Invoices & NDAs',
    description: 'Generate professional invoices, NDAs, and business documents with AI automation. Support for 11+ languages, 28+ currencies, batch processing, and real-time PDF preview. Start free today!',
    keywords: [
      'AI invoice generator',
      'document automation',
      'business document creation',
      'NDA generator',
      'multi-language invoices',
      'batch document processing',
      'professional PDF generator',
      'business automation tool',
      'invoice software',
      'document management',
      'AI-powered business tools',
      'automated invoicing'
    ],
  },
  demo: {
    title: 'Try Xinvoice Demo - AI Document Generator | Free Online Tool',
    description: 'Experience the power of AI document generation. Create professional invoices, NDAs, and business documents in 11+ languages with our free online demo. No signup required!',
    keywords: [
      'AI document demo',
      'free invoice generator',
      'online document creator',
      'NDA generator demo',
      'business document tool',
      'multi-language generator',
      'PDF creator online',
      'document automation demo',
      'professional invoice maker',
      'AI business tools'
    ],
  },
  analytics: {
    title: 'AI Analytics & Insights - Document Generation Performance | Xinvoice',
    description: 'Comprehensive analytics and insights for your AI-generated documents. Track performance, user feedback, and optimization recommendations for better document generation.',
    keywords: [
      'AI analytics',
      'document performance',
      'generation insights',
      'business intelligence',
      'AI metrics',
      'document statistics',
      'performance tracking',
      'user analytics',
      'AI optimization'
    ],
  },
  support: {
    title: 'Support & Help Center - Xinvoice AI Document Generator',
    description: 'Get help with Xinvoice AI document generator. Find tutorials, FAQs, and support for creating professional invoices, NDAs, and business documents.',
    keywords: [
      'Xinvoice support',
      'document generator help',
      'AI tool support',
      'invoice help',
      'NDA generator support',
      'business document assistance',
      'technical support',
      'user guide',
      'tutorials'
    ],
  },
} as const

// Generate rich keywords for different document types
export const DOCUMENT_KEYWORDS = {
  invoice: [
    'AI invoice generator',
    'professional invoice creator',
    'automated invoicing',
    'business invoice software',
    'multi-currency invoices',
    'invoice automation',
    'PDF invoice generator',
    'online invoice maker',
    'invoice template generator',
    'smart invoicing tool'
  ],
  nda: [
    'NDA generator',
    'non-disclosure agreement creator',
    'legal document generator',
    'confidentiality agreement maker',
    'business NDA template',
    'automated legal documents',
    'professional NDA creator',
    'legal agreement generator',
    'contract automation',
    'business legal tools'
  ],
  general: [
    'AI document generation',
    'business document automation',
    'professional document creator',
    'multi-language documents',
    'batch document processing',
    'smart document tools',
    'automated business forms',
    'document template generator',
    'AI-powered business tools',
    'enterprise document solutions'
  ]
} as const

// Generate FAQ data for structured data
export const DEFAULT_FAQ = [
  {
    question: "How does Xinvoice's AI document generation work?",
    answer: "Xinvoice uses advanced AI models (GPT-4o and Gemini) to automatically generate professional documents based on your natural language descriptions. Simply describe what you need, and our AI creates structured, professional documents instantly."
  },
  {
    question: "What types of documents can I create with Xinvoice?",
    answer: "You can create professional invoices, NDAs (Non-Disclosure Agreements), and various business documents. Our platform supports multi-language generation, batch processing, and customizable templates."
  },
  {
    question: "Does Xinvoice support multiple languages and currencies?",
    answer: "Yes! Xinvoice supports 11+ languages including English, French, German, Spanish, Arabic, Chinese, Japanese, and more. We also support 28+ currencies with proper regional formatting."
  },
  {
    question: "Can I process multiple documents at once?",
    answer: "Absolutely! Xinvoice offers advanced batch processing capabilities. You can upload CSV/Excel files or provide multiple text prompts to generate hundreds of documents simultaneously."
  },
  {
    question: "Is my data secure with Xinvoice?",
    answer: "Yes, we take data security seriously. All document generation is processed securely, and we don't store your sensitive business information. Our platform follows industry-standard security practices."
  },
  {
    question: "Can I customize the document templates?",
    answer: "Yes! Xinvoice offers multiple professional templates (Modern, Classic, Minimal) and allows customization of layouts, colors, and branding to match your business needs."
  }
]