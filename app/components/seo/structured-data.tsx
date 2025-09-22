/**
 * Structured Data Components for SEO
 * Generates JSON-LD structured data for better search engine understanding
 */

import Script from 'next/script'

interface OrganizationProps {
  name?: string
  description?: string
  url?: string
  logo?: string
  email?: string
  phone?: string
  address?: {
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
  }
}

export function OrganizationStructuredData({
  name = "Xinvoice",
  description = "AI-powered document generation platform for creating professional invoices, NDAs, and business documents with intelligent automation.",
  url = "https://www.xinfinitylabs.com",
  logo = "https://www.xinfinitylabs.com/logo.svg",
  email = "support@xinfinitylabs.com",
  phone = "+1-555-XINVOICE"
}: OrganizationProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "description": description,
    "url": url,
    "logo": {
      "@type": "ImageObject",
      "url": logo,
      "width": "512",
      "height": "512"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "email": email,
      "telephone": phone,
      "contactType": "customer service"
    },
    "sameAs": [
      "https://twitter.com/xinvoice",
      "https://linkedin.com/company/xinvoice",
      "https://github.com/xinvoice"
    ],
    "foundingDate": "2024",
    "industry": "Software Development",
    "numberOfEmployees": "1-10"
  }

  return (
    <Script
      id="organization-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface SoftwareApplicationProps {
  name?: string
  description?: string
  url?: string
  version?: string
  price?: string
  currency?: string
  operatingSystem?: string
  applicationCategory?: string
  features?: string[]
}

export function SoftwareApplicationStructuredData({
  name = "Xinvoice",
  description = "AI-powered document generation platform that creates professional invoices, NDAs, and business documents with intelligent automation, multi-language support, and advanced batch processing.",
  url = "https://www.xinfinitylabs.com",
  version = "1.0.0",
  price = "0",
  currency = "USD",
  operatingSystem = "Any",
  applicationCategory = "BusinessApplication",
  features = [
    "AI-powered document generation",
    "Multi-language support (11+ languages)",
    "Batch document processing",
    "Professional PDF export",
    "Multi-currency support (28+ currencies)",
    "Real-time document preview",
    "Intelligent file parsing",
    "Customizable templates"
  ]
}: SoftwareApplicationProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": name,
    "description": description,
    "url": url,
    "applicationCategory": applicationCategory,
    "operatingSystem": operatingSystem,
    "softwareVersion": version,
    "offers": {
      "@type": "Offer",
      "price": price,
      "priceCurrency": currency,
      "availability": "https://schema.org/InStock"
    },
    "featureList": features,
    "screenshot": "https://www.xinfinitylabs.com/screenshot.png",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Xinfinity Labs",
      "logo": "https://www.xinfinitylabs.com/logo.svg"
    }
  }

  return (
    <Script
      id="software-app-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface WebSiteProps {
  name?: string
  description?: string
  url?: string
}

export function WebSiteStructuredData({
  name = "Xinvoice",
  description = "AI-powered document generation platform",
  url = "https://www.xinfinitylabs.com"
}: WebSiteProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": name,
    "description": description,
    "url": url,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${url}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "author": {
      "@type": "Organization",
      "name": "Xinvoice Team"
    }
  }

  return (
    <Script
      id="website-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface ProductProps {
  name?: string
  description?: string
  url?: string
  image?: string
  brand?: string
  category?: string
  features?: string[]
}

export function ProductStructuredData({
  name = "Xinvoice Document Generator",
  description = "Professional AI-powered document generation tool for creating invoices, NDAs, and business documents with advanced automation and multi-language support.",
  url = "https://www.xinfinitylabs.com/demo/multilang-pdf",
  image = "https://www.xinfinitylabs.com/product-image.png",
  brand = "Xinvoice",
  category = "Business Software",
  features = [
    "AI Document Generation",
    "Multi-language Support",
    "Batch Processing",
    "PDF Export",
    "Template Customization"
  ]
}: ProductProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "url": url,
    "image": image,
    "brand": {
      "@type": "Brand",
      "name": brand
    },
    "category": category,
    "additionalProperty": features.map(feature => ({
      "@type": "PropertyValue",
      "name": "Feature",
      "value": feature
    })),
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "price": "0",
      "priceCurrency": "USD",
      "priceValidUntil": "2025-12-31"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127"
    }
  }

  return (
    <Script
      id="product-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface BreadcrumbProps {
  items: Array<{
    name: string
    url: string
  }>
}

export function BreadcrumbStructuredData({ items }: BreadcrumbProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }

  return (
    <Script
      id="breadcrumb-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface FAQProps {
  questions: Array<{
    question: string
    answer: string
  }>
}

export function FAQStructuredData({ questions }: FAQProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map(qa => ({
      "@type": "Question",
      "name": qa.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": qa.answer
      }
    }))
  }

  return (
    <Script
      id="faq-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}