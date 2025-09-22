import { Metadata } from 'next'
import { generateMetadata, SEO_CONFIGS } from '../components/seo/seo-utils'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xinvoice.com'

export const metadata: Metadata = generateMetadata({
  ...SEO_CONFIGS.support,
  canonical: `${baseUrl}/support`,
  image: `${baseUrl}/api/og-image?title=${encodeURIComponent('Support & Help Center - Xinvoice')}&description=${encodeURIComponent('Get help with Xinvoice AI document generator. Find tutorials, FAQs, and support.')}`
})

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}