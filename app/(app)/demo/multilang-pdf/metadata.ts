import { Metadata } from 'next'
import { generateMetadata, SEO_CONFIGS } from '../../../components/seo/seo-utils'
import { BreadcrumbStructuredData, ProductStructuredData } from '../../../components/seo/structured-data'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xinvoice.com'

export const metadata: Metadata = generateMetadata({
  ...SEO_CONFIGS.demo,
  canonical: `${baseUrl}/demo/multilang-pdf`,
  image: `${baseUrl}/api/og-image?title=${encodeURIComponent('Try Xinvoice Demo - AI Document Generator')}&description=${encodeURIComponent('Experience the power of AI document generation. Create professional invoices, NDAs, and business documents in 11+ languages.')}`,
  type: 'product'
})

// This will be included in the component
export const demoPageStructuredData = {
  breadcrumbs: [
    { name: 'Home', url: baseUrl },
    { name: 'Demo', url: `${baseUrl}/demo/multilang-pdf` }
  ],
  product: {
    name: 'Xinvoice Demo - AI Document Generator',
    description: 'Interactive demo of our AI-powered document generation platform. Create professional invoices and NDAs in multiple languages with real-time preview.',
    url: `${baseUrl}/demo/multilang-pdf`,
    features: [
      'Real-time AI document generation',
      'Multi-language support (11+ languages)',
      'Professional PDF export',
      'Customizable templates',
      'Batch processing capabilities',
      'Currency formatting (28+ currencies)'
    ]
  }
}