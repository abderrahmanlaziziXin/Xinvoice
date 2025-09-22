/**
 * Pricing Page - Transparent pricing for Xinvoice services
 */

import { Metadata } from 'next'
import { generateMetadata } from '../components/seo/seo-utils'
import { BreadcrumbStructuredData } from '../components/seo/structured-data'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xinvoice.com'

export const metadata: Metadata = generateMetadata({
  title: 'Pricing - Xinvoice AI Document Generator | Free & Pro Plans',
  description: 'Simple, transparent pricing for Xinvoice AI document generator. Start free with unlimited basic features. Pro plans available for advanced business needs.',
  keywords: [
    'Xinvoice pricing',
    'AI document generator cost',
    'invoice generator pricing',
    'business document pricing',
    'free document generator',
    'enterprise pricing',
    'subscription plans'
  ],
  canonical: `${baseUrl}/pricing`,
  image: `${baseUrl}/api/og-image?title=${encodeURIComponent('Xinvoice Pricing - Simple & Transparent')}&description=${encodeURIComponent('Start free with unlimited basic features. Pro plans for advanced business needs.')}`
})

export default function PricingPage() {
  const breadcrumbs = [
    { name: 'Home', url: baseUrl },
    { name: 'Pricing', url: `${baseUrl}/pricing` }
  ]

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for individuals and small businesses getting started',
      features: [
        'Generate up to 50 documents/month',
        'All AI-powered features',
        'Multi-language support (11+ languages)',
        'Multi-currency support (28+ currencies)',
        'Professional PDF export',
        'Basic templates (Modern, Classic, Minimal)',
        'Email support'
      ],
      cta: 'Start Free',
      href: '/demo/multilang-pdf',
      popular: false
    },
    {
      name: 'Pro',
      price: '$19',
      period: 'per month',
      description: 'Ideal for growing businesses with higher volume needs',
      features: [
        'Generate unlimited documents',
        'Advanced batch processing',
        'Priority AI processing',
        'Custom branding & templates',
        'Advanced export options',
        'API access',
        'Priority support',
        'Usage analytics',
        'Team collaboration tools'
      ],
      cta: 'Start Pro Trial',
      href: '/demo/multilang-pdf?plan=pro',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      description: 'Tailored solutions for large organizations',
      features: [
        'Everything in Pro',
        'Custom AI model training',
        'White-label solution',
        'On-premise deployment',
        'Custom integrations',
        'Dedicated account manager',
        '24/7 phone support',
        'SLA guarantees',
        'Advanced security features'
      ],
      cta: 'Contact Sales',
      href: '/support',
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <BreadcrumbStructuredData items={breadcrumbs} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Simple, Transparent
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              Pricing
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Start free and upgrade as you grow. No hidden fees, no surprises. 
            Just powerful AI document generation at your fingertips.
          </p>
          
          {/* Trust indicators */}
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No setup fees
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Cancel anytime
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              14-day free trial
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-sm border-2 p-8 ${
                plan.popular 
                  ? 'border-blue-600 ring-2 ring-blue-600 ring-opacity-20' 
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period !== 'contact us' && (
                    <span className="text-gray-500 ml-2">/{plan.period}</span>
                  )}
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.href}
                className={`block w-full text-center py-3 px-6 rounded-xl font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-8">
            {[
              {
                question: "Can I really use Xinvoice for free?",
                answer: "Yes! Our free plan includes all core AI features with a limit of 50 documents per month. Perfect for individuals and small businesses getting started."
              },
              {
                question: "What happens if I exceed the free plan limits?",
                answer: "If you reach the 50 document limit on the free plan, you'll be prompted to upgrade to Pro. No documents are lost - they're safely stored in your account."
              },
              {
                question: "Can I cancel my subscription anytime?",
                answer: "Absolutely. You can cancel your Pro subscription at any time with no cancellation fees. You'll continue to have access until the end of your billing period."
              },
              {
                question: "Is there a discount for annual billing?",
                answer: "Yes! Annual Pro subscribers save 20% compared to monthly billing. That's just $15.20 per month when billed annually."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}