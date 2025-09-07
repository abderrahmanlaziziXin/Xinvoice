import './globals.css'
import QueryProvider from './components/query-provider'
import { ToastProvider } from './components/toast-provider'
import { NavigationHeader } from './components/navigation-header'
import { DocumentProvider } from './context/document-context'
import { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Xinfinity AI - Enhanced Document Generation Platform',
  description: 'AI-powered document generation with advanced features, structured prompts, and multi-document support. Create professional invoices, NDAs, and more with GPT-4o intelligence.',
  keywords: 'AI, document generation, invoice, NDA, GPT-4o, automation, business documents',
  authors: [{ name: 'Xinfinity AI Team' }],
  creator: 'Xinfinity AI',
  publisher: 'Xinfinity AI',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'Xinfinity AI - Enhanced Document Generation Platform',
    description: 'AI-powered document generation with advanced features, structured prompts, and multi-document support.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Xinfinity AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Xinfinity AI - Enhanced Document Generation Platform',
    description: 'AI-powered document generation with advanced features, structured prompts, and multi-document support.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1e40af',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased font-sans">
        <QueryProvider>
          <DocumentProvider>
            <NavigationHeader />
            <main className="min-h-screen">
              {children}
            </main>
            <ToastProvider />
          </DocumentProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
