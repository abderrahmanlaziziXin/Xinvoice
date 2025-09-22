/**
 * Breadcrumb Navigation Component
 * Provides hierarchical navigation with structured data
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

export interface BreadcrumbItem {
  name: string
  url: string
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center space-x-2 text-sm ${className}`}
    >
      <Link 
        href="/" 
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Home"
      >
        <HomeIcon className="w-4 h-4" />
        <span className="sr-only">Home</span>
      </Link>
      
      {items.map((item, index) => (
        <motion.div
          key={item.url}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center"
        >
          <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-2" />
          {item.current || index === items.length - 1 ? (
            <span 
              className="text-gray-900 font-medium"
              aria-current="page"
            >
              {item.name}
            </span>
          ) : (
            <Link 
              href={item.url}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {item.name}
            </Link>
          )}
        </motion.div>
      ))}
    </nav>
  )
}

// Higher-order component that includes structured data
interface BreadcrumbWithStructuredDataProps extends BreadcrumbProps {
  structuredData?: boolean
}

export function BreadcrumbWithStructuredData({ 
  items, 
  className = '',
  structuredData = true 
}: BreadcrumbWithStructuredDataProps) {
  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": process.env.NEXT_PUBLIC_SITE_URL || 'https://xinvoice.com'
                },
                ...items.map((item, index) => ({
                  "@type": "ListItem",
                  "position": index + 2,
                  "name": item.name,
                  "item": item.url
                }))
              ]
            })
          }}
        />
      )}
      <Breadcrumb items={items} className={className} />
    </>
  )
}