/**
 * Privacy Policy Page
 */

import { Metadata } from 'next'
import { generateMetadata } from '../components/seo/seo-utils'
import { BreadcrumbStructuredData } from '../components/seo/structured-data'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xinvoice.com'

export const metadata: Metadata = generateMetadata({
  title: 'Privacy Policy - Xinvoice AI Document Generator',
  description: 'Learn how Xinvoice protects your privacy and handles your data. Comprehensive privacy policy for our AI document generation platform.',
  keywords: [
    'privacy policy',
    'data protection',
    'Xinvoice privacy',
    'AI data handling',
    'document security',
    'user privacy',
    'data security',
    'GDPR compliance'
  ],
  canonical: `${baseUrl}/privacy`,
  image: `${baseUrl}/api/og-image?title=${encodeURIComponent('Privacy Policy - Xinvoice')}&description=${encodeURIComponent('Learn how we protect your privacy and secure your data.')}`
})

export default function PrivacyPage() {
  const breadcrumbs = [
    { name: 'Home', url: baseUrl },
    { name: 'Privacy Policy', url: `${baseUrl}/privacy` }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <BreadcrumbStructuredData items={breadcrumbs} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="prose prose-lg max-w-none">
            <h2>Information We Collect</h2>
            <p>
              Xinvoice is committed to protecting your privacy. We collect only the information necessary 
              to provide our AI document generation services effectively.
            </p>
            
            <h3>Document Data</h3>
            <p>
              When you use our services, we process the information you provide to generate documents. 
              This may include business information, client details, and document content. This data is 
              processed securely and is not stored permanently unless you choose to save documents.
            </p>
            
            <h3>Usage Information</h3>
            <p>
              We collect analytics data to improve our services, including page views, feature usage, 
              and performance metrics. This data is anonymized and used solely for service improvement.
            </p>
            
            <h2>How We Use Your Information</h2>
            <ul>
              <li>To generate documents based on your requests</li>
              <li>To improve our AI models and service quality</li>
              <li>To provide customer support</li>
              <li>To send important service updates</li>
            </ul>
            
            <h2>Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data during transmission 
              and processing. All data is encrypted in transit and at rest.
            </p>
            
            <h2>Third-Party Services</h2>
            <p>
              We use trusted third-party services for analytics (Google Analytics) and AI processing 
              (OpenAI, Google). These services have their own privacy policies that govern how they 
              handle data.
            </p>
            
            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Request access to your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
            </ul>
            
            <h2>Contact Us</h2>
            <p>
              If you have questions about this privacy policy, please contact us at{' '}
              <a href="mailto:privacy@xinvoice.com" className="text-blue-600 hover:text-blue-700">
                privacy@xinvoice.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}