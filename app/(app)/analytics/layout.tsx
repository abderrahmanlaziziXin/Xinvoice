import { Metadata } from 'next'
import { generateMetadata, SEO_CONFIGS } from '../../components/seo/seo-utils'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xinvoice.com'

export const metadata: Metadata = generateMetadata({
  ...SEO_CONFIGS.analytics,
  canonical: `${baseUrl}/analytics`,
  image: `${baseUrl}/api/og-image?title=${encodeURIComponent('AI Analytics & Insights - Document Generation Performance')}&description=${encodeURIComponent('Comprehensive analytics and insights for your AI-generated documents.')}`
})

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}