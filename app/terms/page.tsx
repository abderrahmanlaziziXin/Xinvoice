/**
 * Terms of Service Page
 */

import { Metadata } from 'next'
import { generateMetadata } from '../components/seo/seo-utils'
import { BreadcrumbStructuredData } from '../components/seo/structured-data'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xinvoice.com'

export const metadata: Metadata = generateMetadata({
  title: 'Terms of Service - Xinvoice AI Document Generator',
  description: 'Terms of service and usage agreement for Xinvoice AI document generation platform. Learn about our service terms and user responsibilities.',
  keywords: [
    'terms of service',
    'user agreement',
    'Xinvoice terms',
    'service agreement',
    'usage terms',
    'legal terms',
    'terms and conditions'
  ],
  canonical: `${baseUrl}/terms`,
  image: `${baseUrl}/api/og-image?title=${encodeURIComponent('Terms of Service - Xinvoice')}&description=${encodeURIComponent('Our terms of service and usage agreement for AI document generation.')}`
})

export default function TermsPage() {
  const breadcrumbs = [
    { name: 'Home', url: baseUrl },
    { name: 'Terms of Service', url: `${baseUrl}/terms` }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <BreadcrumbStructuredData items={breadcrumbs} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="prose prose-lg max-w-none">
            <h2>Agreement to Terms</h2>
            <p>
              By accessing and using Xinvoice, you agree to be bound by these Terms of Service 
              and all applicable laws and regulations.
            </p>
            
            <h2>Service Description</h2>
            <p>
              Xinvoice provides AI-powered document generation services, including but not limited to 
              invoices, NDAs, and other business documents. Our services use advanced AI models to 
              create professional documents based on user input.
            </p>
            
            <h2>User Responsibilities</h2>
            <h3>Acceptable Use</h3>
            <p>You agree to use our services only for lawful purposes and in accordance with these terms. You will not:</p>
            <ul>
              <li>Generate documents for illegal or fraudulent purposes</li>
              <li>Attempt to reverse engineer or compromise our AI models</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
            </ul>
            
            <h3>Account Security</h3>
            <p>
              You are responsible for maintaining the security of your account and for all activities 
              that occur under your account.
            </p>
            
            <h2>Service Availability</h2>
            <p>
              We strive to provide reliable service but do not guarantee 100% uptime. We may 
              temporarily suspend services for maintenance or updates.
            </p>
            
            <h2>Intellectual Property</h2>
            <p>
              The Xinvoice platform, including our AI models and technology, is protected by 
              intellectual property laws. Documents you generate using our service belong to you, 
              but our underlying technology remains our property.
            </p>
            
            <h2>Limitation of Liability</h2>
            <p>
              Xinvoice provides services &ldquo;as is&rdquo; and makes no warranties about the accuracy or 
              completeness of generated documents. Users are responsible for reviewing and 
              verifying all generated content.
            </p>
            
            <h2>Data and Privacy</h2>
            <p>
              Your use of our services is also governed by our Privacy Policy, which explains 
              how we collect, use, and protect your information.
            </p>
            
            <h2>Modifications to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of 
              significant changes via email or through our platform.
            </p>
            
            <h2>Termination</h2>
            <p>
              Either party may terminate this agreement at any time. Upon termination, your 
              right to use our services ceases immediately.
            </p>
            
            <h2>Governing Law</h2>
            <p>
              These terms are governed by the laws of [Your Jurisdiction] without regard to 
              conflict of law principles.
            </p>
            
            <h2>Contact Information</h2>
            <p>
              For questions about these terms, please contact us at{' '}
              <a href="mailto:legal@xinvoice.com" className="text-blue-600 hover:text-blue-700">
                legal@xinvoice.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}