/**
 * About Page
 */

import { Metadata } from 'next'
import { generateMetadata } from '../components/seo/seo-utils'
import { BreadcrumbStructuredData } from '../components/seo/structured-data'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xinvoice.com'

export const metadata: Metadata = generateMetadata({
  title: 'About Xinvoice - AI-Powered Document Generation Platform',
  description: 'Learn about Xinvoice, the leading AI document generation platform. Our mission, technology, and commitment to revolutionizing business document creation.',
  keywords: [
    'about Xinvoice',
    'AI document company',
    'business automation',
    'document generation platform',
    'AI technology',
    'business solutions',
    'company story',
    'mission statement'
  ],
  canonical: `${baseUrl}/about`,
  image: `${baseUrl}/api/og-image?title=${encodeURIComponent('About Xinvoice - AI Document Generation')}&description=${encodeURIComponent('Learn about our mission to revolutionize business document creation with AI.')}`
})

export default function AboutPage() {
  const breadcrumbs = [
    { name: 'Home', url: baseUrl },
    { name: 'About', url: `${baseUrl}/about` }
  ]

  const stats = [
    { number: '50,000+', label: 'Documents Generated' },
    { number: '11+', label: 'Languages Supported' },
    { number: '28+', label: 'Currencies Supported' },
    { number: '99.9%', label: 'Uptime Reliability' }
  ]

  const team = [
    {
      name: 'AI Research Team',
      role: 'Machine Learning & NLP',
      description: 'Experts in GPT-4o, Gemini, and natural language processing'
    },
    {
      name: 'Product Team', 
      role: 'User Experience & Design',
      description: 'Designing intuitive interfaces for complex AI capabilities'
    },
    {
      name: 'Engineering Team',
      role: 'Platform Development',
      description: 'Building scalable infrastructure for enterprise-grade document generation'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <BreadcrumbStructuredData items={breadcrumbs} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            About
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              Xinvoice
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We&apos;re revolutionizing business document creation with AI-powered automation, 
            making professional document generation accessible to everyone.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-8">
              At Xinvoice, we believe that creating professional business documents shouldn&apos;t be 
              complicated, time-consuming, or expensive. Our mission is to democratize access to 
              high-quality document generation through the power of artificial intelligence.
            </p>
            <div className="bg-white rounded-2xl p-8 shadow-sm border">
              <blockquote className="text-xl italic text-gray-700">
                &ldquo;Every business deserves professional documents. AI makes it possible for everyone, 
                regardless of size or resources, to create documents that look and feel enterprise-grade.&rdquo;
              </blockquote>
              <cite className="block mt-4 text-gray-500">— The Xinvoice Team</cite>
            </div>
          </div>
        </div>

        {/* Technology Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Technology</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Cutting-Edge AI</h3>
              <p className="text-gray-600 mb-6">
                Xinvoice leverages the latest advances in artificial intelligence, including 
                GPT-4o and Google&apos;s Gemini models, to understand natural language and generate 
                professional documents that match your specific needs.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Advanced natural language processing
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Context-aware content generation
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Multi-language and cultural adaptation
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Intelligent data extraction and formatting
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🤖</div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Core</h4>
                <p className="text-gray-600 text-sm">
                  Our AI models are continuously trained on business document patterns to 
                  ensure professional quality and accuracy.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Simplicity First</h3>
              <p className="text-gray-600">
                We believe powerful technology should be simple to use. Every feature we build 
                prioritizes user experience and ease of use.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🌍 Global Accessibility</h3>
              <p className="text-gray-600">
                Business is global, and so are we. Our multi-language, multi-currency support 
                ensures everyone can create professional documents.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🔒 Privacy & Security</h3>
              <p className="text-gray-600">
                Your business data is sacred. We implement industry-leading security practices 
                to protect your information at every step.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">⚡ Continuous Innovation</h3>
              <p className="text-gray-600">
                AI technology evolves rapidly, and so do we. We&apos;re constantly improving our 
                models and features to serve you better.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Join Thousands of Satisfied Users</h2>
          <p className="text-xl opacity-90 mb-8">
            Experience the future of document generation with our AI-powered platform.
          </p>
          <a
            href="/demo/multilang-pdf"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            Try Xinvoice Free
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}