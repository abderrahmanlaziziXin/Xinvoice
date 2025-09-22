/**
 * Features Page - Comprehensive overview of Xinvoice capabilities
 */

import { Metadata } from 'next'
import { generateMetadata } from '../components/seo/seo-utils'
import { BreadcrumbStructuredData, ProductStructuredData } from '../components/seo/structured-data'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xinvoice.com'

export const metadata: Metadata = generateMetadata({
  title: 'Features - Xinvoice AI Document Generator | Complete Feature List',
  description: 'Discover all features of Xinvoice AI document generator: multi-language support, batch processing, 28+ currencies, professional templates, and intelligent automation.',
  keywords: [
    'AI document features',
    'invoice generator features',
    'multi-language documents',
    'batch document processing',
    'AI automation features',
    'professional document templates',
    'currency support',
    'PDF generation features'
  ],
  canonical: `${baseUrl}/features`,
  image: `${baseUrl}/api/og-image?title=${encodeURIComponent('Xinvoice Features - AI Document Generator')}&description=${encodeURIComponent('Discover all the powerful features of our AI document generation platform.')}`
})

export default function FeaturesPage() {
  const breadcrumbs = [
    { name: 'Home', url: baseUrl },
    { name: 'Features', url: `${baseUrl}/features` }
  ]

  const features = [
    {
      title: 'AI-Powered Generation',
      description: 'Advanced GPT-4o and Gemini AI models for intelligent document creation',
      icon: '🤖',
      details: [
        'Natural language processing',
        'Context-aware content generation',
        'Professional formatting',
        'Smart data extraction'
      ]
    },
    {
      title: 'Multi-Language Support',
      description: 'Create documents in 11+ languages with cultural context',
      icon: '🌍',
      details: [
        'English, French, German, Spanish',
        'Arabic, Chinese, Japanese',
        'Portuguese, Italian, Russian, Hindi',
        'RTL text support',
        'Cultural business practices'
      ]
    },
    {
      title: 'Batch Processing',
      description: 'Generate hundreds of documents simultaneously',
      icon: '⚡',
      details: [
        'CSV/Excel file upload',
        'Intelligent parsing',
        'Bulk operations',
        'Progress tracking'
      ]
    },
    {
      title: 'Multi-Currency',
      description: 'Support for 28+ global currencies',
      icon: '💰',
      details: [
        'USD, EUR, GBP, CAD, AUD',
        'Regional formatting',
        'Currency symbols',
        'Exchange rate support'
      ]
    },
    {
      title: 'Professional Templates',
      description: 'Beautiful, customizable document templates',
      icon: '📄',
      details: [
        'Modern, Classic, Minimal designs',
        'Brand customization',
        'Logo integration',
        'Color schemes'
      ]
    },
    {
      title: 'Real-Time Preview',
      description: 'See your documents as you create them',
      icon: '👁️',
      details: [
        'Live PDF preview',
        'Interactive editing',
        'Template switching',
        'Instant feedback'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <BreadcrumbStructuredData items={breadcrumbs} />
      <ProductStructuredData
        name="Xinvoice AI Document Generator"
        description="Professional AI-powered document generation with comprehensive features for business automation"
        features={features.map(f => f.title)}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Powerful Features for
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              AI Document Generation
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover all the advanced capabilities that make Xinvoice the most comprehensive 
            AI-powered document generation platform for businesses.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 mb-6">{feature.description}</p>
              <ul className="space-y-2">
                {feature.details.map((detail, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience These Features?</h2>
          <p className="text-xl opacity-90 mb-8">
            Try our AI document generator with all features included - completely free!
          </p>
          <a
            href="/demo/multilang-pdf"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            Start Free Trial
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}