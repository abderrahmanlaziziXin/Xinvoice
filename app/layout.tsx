import "./globals.css";
import QueryProvider from "./components/query-provider";
import { ToastProvider } from "./components/toast-provider";
import { NavigationHeader } from "./components/navigation-header";
import { Footer } from "./components/footer";
import { DocumentProvider } from "./context/document-context";
import { LocaleProvider } from "./lib/i18n/context";
import { Analytics } from "@vercel/analytics/next";
import { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import { 
  OrganizationStructuredData,
  SoftwareApplicationStructuredData,
  WebSiteStructuredData,
  FAQStructuredData
} from "./components/seo/structured-data";
import { DEFAULT_FAQ, generateMetadata, SEO_CONFIGS } from "./components/seo/seo-utils";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.xinfinitylabs.com';

export const metadata: Metadata = generateMetadata({
  ...SEO_CONFIGS.home,
  canonical: baseUrl,
  image: `${baseUrl}/og-image.png`,
  alternateLocales: ['en-US', 'fr-FR', 'de-DE', 'es-ES', 'ar-SA', 'zh-CN', 'ja-JP']
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#667eea" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" }
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preconnect for performance optimization */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Preload critical resources */}
        <link
          rel="preload"
          href="/logo.svg"
          as="image"
          type="image/svg+xml"
        />
        
        {/* Additional favicons and logo references */}
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.svg" />
        <link rel="mask-icon" href="/logo.svg" color="#667eea" />
        
        {/* Search Console Verification (add your verification code) */}
        <meta name="google-site-verification" content="your-google-site-verification-code" />
        
        {/* Additional meta tags for better SEO */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="format-detection" content="telephone=no" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        
        {/* Apple-specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Xinvoice" />
        
        {/* Microsoft-specific meta tags */}
        <meta name="msapplication-TileColor" content="#667eea" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={baseUrl} />
        
        {/* Additional favicons */}
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Open Graph and Twitter meta tags */}
        <meta property="og:image" content={`${baseUrl}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:logo" content={`${baseUrl}/logo.svg`} />
        <meta name="twitter:image" content={`${baseUrl}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        
        {/* Schema.org logo markup for Google */}
        <meta itemProp="logo" content={`${baseUrl}/logo.svg`} />
        <meta itemProp="image" content={`${baseUrl}/og-image.png`} />
      </head>
      <body className="antialiased font-sans">
        {/* Skip to main content for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-black p-2 rounded z-50"
        >
          Skip to main content
        </a>

        {/* Structured Data */}
        <OrganizationStructuredData />
        <SoftwareApplicationStructuredData />
        <WebSiteStructuredData />
        <FAQStructuredData questions={DEFAULT_FAQ} />

        {/* Google tag (gtag.js) - Optimized with Next.js Script */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17553744861"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17553744861', {
              page_title: document.title,
              page_location: window.location.href
            });
            
            // Enhanced ecommerce tracking
            gtag('config', 'AW-17553744861', {
              send_page_view: false,
              custom_map: {
                'custom_parameter': 'document_type'
              }
            });
          `}
        </Script>
        
        {/* Google Search Console verification script */}
        <Script
          id="search-console-verification"
          strategy="afterInteractive"
        >
          {`
            // Add any additional Google Search Console verification if needed
          `}
        </Script>
        
        <QueryProvider>
          <DocumentProvider>
            <LocaleProvider>
              <NavigationHeader />
              <main id="main-content" className="min-h-screen" role="main">
                {children}
              </main>
              <Footer />
              <ToastProvider />
            </LocaleProvider>
          </DocumentProvider>
          <Analytics />
          <SpeedInsights />
        </QueryProvider>
      </body>
    </html>
  );
}
