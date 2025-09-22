/**
 * SEO Testing and Validation Utilities
 */

export interface SEOTestResult {
  test: string
  passed: boolean
  message: string
  severity: 'error' | 'warning' | 'info'
}

export interface PageSEOAnalysis {
  url: string
  title: string
  description: string
  keywords: string
  issues: SEOTestResult[]
  score: number
}

/**
 * Validate page metadata for SEO compliance
 */
export function validatePageSEO(metadata: {
  title?: string
  description?: string
  keywords?: string
  canonical?: string
  openGraph?: any
  twitter?: any
}): SEOTestResult[] {
  const results: SEOTestResult[] = []

  // Title validation
  if (!metadata.title) {
    results.push({
      test: 'Title Tag',
      passed: false,
      message: 'Missing title tag',
      severity: 'error'
    })
  } else {
    const titleLength = metadata.title.length
    if (titleLength < 30) {
      results.push({
        test: 'Title Length',
        passed: false,
        message: `Title too short (${titleLength} chars). Recommended: 30-60 chars`,
        severity: 'warning'
      })
    } else if (titleLength > 60) {
      results.push({
        test: 'Title Length',
        passed: false,
        message: `Title too long (${titleLength} chars). Recommended: 30-60 chars`,
        severity: 'warning'
      })
    } else {
      results.push({
        test: 'Title Length',
        passed: true,
        message: `Title length optimal (${titleLength} chars)`,
        severity: 'info'
      })
    }
  }

  // Description validation
  if (!metadata.description) {
    results.push({
      test: 'Meta Description',
      passed: false,
      message: 'Missing meta description',
      severity: 'error'
    })
  } else {
    const descLength = metadata.description.length
    if (descLength < 120) {
      results.push({
        test: 'Description Length',
        passed: false,
        message: `Description too short (${descLength} chars). Recommended: 120-160 chars`,
        severity: 'warning'
      })
    } else if (descLength > 160) {
      results.push({
        test: 'Description Length',
        passed: false,
        message: `Description too long (${descLength} chars). Recommended: 120-160 chars`,
        severity: 'warning'
      })
    } else {
      results.push({
        test: 'Description Length',
        passed: true,
        message: `Description length optimal (${descLength} chars)`,
        severity: 'info'
      })
    }
  }

  // Keywords validation
  if (!metadata.keywords || metadata.keywords.trim() === '') {
    results.push({
      test: 'Meta Keywords',
      passed: false,
      message: 'Missing meta keywords',
      severity: 'warning'
    })
  } else {
    const keywordCount = metadata.keywords.split(',').length
    if (keywordCount > 10) {
      results.push({
        test: 'Keyword Count',
        passed: false,
        message: `Too many keywords (${keywordCount}). Recommended: 5-10 keywords`,
        severity: 'warning'
      })
    } else {
      results.push({
        test: 'Meta Keywords',
        passed: true,
        message: `Keywords present (${keywordCount} keywords)`,
        severity: 'info'
      })
    }
  }

  // Open Graph validation
  if (!metadata.openGraph) {
    results.push({
      test: 'Open Graph',
      passed: false,
      message: 'Missing Open Graph metadata',
      severity: 'error'
    })
  } else {
    results.push({
      test: 'Open Graph',
      passed: true,
      message: 'Open Graph metadata present',
      severity: 'info'
    })
  }

  // Twitter Cards validation
  if (!metadata.twitter) {
    results.push({
      test: 'Twitter Cards',
      passed: false,
      message: 'Missing Twitter Card metadata',
      severity: 'warning'
    })
  } else {
    results.push({
      test: 'Twitter Cards',
      passed: true,
      message: 'Twitter Card metadata present',
      severity: 'info'
    })
  }

  // Canonical URL validation
  if (!metadata.canonical) {
    results.push({
      test: 'Canonical URL',
      passed: false,
      message: 'Missing canonical URL',
      severity: 'warning'
    })
  } else {
    results.push({
      test: 'Canonical URL',
      passed: true,
      message: 'Canonical URL present',
      severity: 'info'
    })
  }

  return results
}

/**
 * Calculate SEO score based on test results
 */
export function calculateSEOScore(results: SEOTestResult[]): number {
  let score = 100
  
  results.forEach(result => {
    if (!result.passed) {
      switch (result.severity) {
        case 'error':
          score -= 20
          break
        case 'warning':
          score -= 10
          break
        case 'info':
          score -= 0
          break
      }
    }
  })
  
  return Math.max(0, score)
}

/**
 * Generate SEO recommendations based on test results
 */
export function generateSEORecommendations(results: SEOTestResult[]): string[] {
  const recommendations: string[] = []
  
  const errors = results.filter(r => !r.passed && r.severity === 'error')
  const warnings = results.filter(r => !r.passed && r.severity === 'warning')
  
  if (errors.length > 0) {
    recommendations.push('🚨 Critical Issues Found:')
    errors.forEach(error => {
      recommendations.push(`  • ${error.message}`)
    })
  }
  
  if (warnings.length > 0) {
    recommendations.push('⚠️ Improvements Recommended:')
    warnings.forEach(warning => {
      recommendations.push(`  • ${warning.message}`)
    })
  }
  
  if (errors.length === 0 && warnings.length === 0) {
    recommendations.push('✅ Excellent! Your SEO is well optimized.')
  }
  
  return recommendations
}

/**
 * Test structured data validity
 */
export function validateStructuredData(structuredData: any): SEOTestResult[] {
  const results: SEOTestResult[] = []
  
  if (!structuredData) {
    results.push({
      test: 'Structured Data',
      passed: false,
      message: 'No structured data found',
      severity: 'warning'
    })
    return results
  }
  
  // Check for required fields
  if (!structuredData['@context']) {
    results.push({
      test: 'JSON-LD Context',
      passed: false,
      message: 'Missing @context in structured data',
      severity: 'error'
    })
  }
  
  if (!structuredData['@type']) {
    results.push({
      test: 'JSON-LD Type',
      passed: false,
      message: 'Missing @type in structured data',
      severity: 'error'
    })
  }
  
  results.push({
    test: 'Structured Data',
    passed: true,
    message: 'Structured data present and valid',
    severity: 'info'
  })
  
  return results
}

/**
 * Common SEO best practices checklist
 */
export const SEO_CHECKLIST = [
  {
    category: 'Basic SEO',
    items: [
      'Title tag present (30-60 characters)',
      'Meta description present (120-160 characters)',
      'H1 tag present and unique',
      'URL is descriptive and clean',
      'Meta keywords present (5-10 keywords)',
      'Canonical URL specified'
    ]
  },
  {
    category: 'Social Media',
    items: [
      'Open Graph tags present',
      'Twitter Card tags present',
      'Social media images optimized (1200x630)',
      'Open Graph description present'
    ]
  },
  {
    category: 'Technical SEO',
    items: [
      'Robots meta tag configured',
      'XML sitemap present',
      'Robots.txt file present',
      'Schema.org structured data implemented',
      'Page load speed optimized',
      'Mobile-friendly design'
    ]
  },
  {
    category: 'Content Quality',
    items: [
      'Unique and valuable content',
      'Proper heading hierarchy (H1-H6)',
      'Internal linking strategy',
      'Alt text for images',
      'Content length adequate (>300 words)',
      'Keyword density appropriate (1-3%)'
    ]
  }
]

/**
 * Performance metrics for SEO
 */
export interface SEOMetrics {
  coreWebVitals: {
    lcp: number // Largest Contentful Paint
    fid: number // First Input Delay
    cls: number // Cumulative Layout Shift
  }
  lighthouse: {
    performance: number
    accessibility: number
    bestPractices: number
    seo: number
  }
  searchConsole: {
    impressions: number
    clicks: number
    ctr: number
    averagePosition: number
  }
}