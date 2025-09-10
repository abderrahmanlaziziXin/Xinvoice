/**
 * Enhanced PDF Theme System for Xinfoice Platform
 * 
 * This module provides a comprehensive theming system for PDF generation
 * that matches the platform's visual identity including:
 * - Color schemes (Primary, Neutral, Dark)
 * - Typography (Inter font family)
 * - Glass-morphism effects
 * - Gradient treatments
 * - Consistent spacing (Fibonacci-based)
 */

export interface PDFTheme {
  name: string
  colors: {
    primary: string
    primaryLight: string
    secondary: string
    secondaryLight: string
    accent: string
    accentLight: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    borderLight: string
    tableHeader: string
    tableRowEven: string
    tableRowOdd: string
    success: string
    warning: string
    error: string
  }
  fonts: {
    primary: string
    secondary: string
    monospace: string
  }
  spacing: {
    margin: number
    sectionGap: number
    lineHeight: number
    borderRadius: number
  }
  effects: {
    headerGradient: boolean
    glassMorphism: boolean
    shadows: boolean
  }
}

/**
 * Primary Theme - Matches the main platform design
 * Uses the signature blue-cyan gradient system
 */
export const PRIMARY_THEME: PDFTheme = {
  name: 'Primary',
  colors: {
    primary: '#1e40af',      // --xinfinity-primary
    primaryLight: '#3b82f6', // --xinfinity-primary-light
    secondary: '#06b6d4',    // --xinfinity-secondary
    secondaryLight: '#0891b2', // --xinfinity-secondary-light
    accent: '#1e3a8a',       // --xinfinity-accent
    accentLight: '#1d4ed8',  // --xinfinity-accent-light
    background: '#ffffff',
    surface: '#f8fafc',      // --xinfinity-gray-50
    text: '#1e293b',         // --xinfinity-gray-800
    textSecondary: '#64748b', // --xinfinity-gray-500
    border: '#e2e8f0',       // --xinfinity-gray-200
    borderLight: '#f1f5f9',  // --xinfinity-gray-100
    tableHeader: '#06b6d4',  // Use your secondary brand color (cyan) for headers - more visible
    tableRowEven: '#ffffff',
    tableRowOdd: '#f8fafc',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626'
  },
  fonts: {
    primary: 'Inter',
    secondary: 'Inter',
    monospace: 'Monaco'
  },
  spacing: {
    margin: 15,              // 1.5cm equivalent
    sectionGap: 12,
    lineHeight: 1.5,
    borderRadius: 3
  },
  effects: {
    headerGradient: true,
    glassMorphism: false,    // PDF doesn't support backdrop blur
    shadows: true
  }
}

/**
 * Neutral Theme - Clean, professional appearance
 * Uses grayscale with subtle blue accents
 */
export const NEUTRAL_THEME: PDFTheme = {
  name: 'Neutral',
  colors: {
    primary: '#475569',      // --xinfinity-gray-600
    primaryLight: '#64748b', // --xinfinity-gray-500
    secondary: '#94a3b8',    // --xinfinity-gray-400
    secondaryLight: '#cbd5e1', // --xinfinity-gray-300
    accent: '#1e293b',       // --xinfinity-gray-800
    accentLight: '#334155',  // --xinfinity-gray-700
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    tableHeader: '#06b6d4',  // Use your secondary brand color (cyan) even in neutral theme
    tableRowEven: '#ffffff',
    tableRowOdd: '#f8fafc',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626'
  },
  fonts: {
    primary: 'Inter',
    secondary: 'Inter',
    monospace: 'Monaco'
  },
  spacing: {
    margin: 15,
    sectionGap: 12,
    lineHeight: 1.5,
    borderRadius: 3
  },
  effects: {
    headerGradient: false,
    glassMorphism: false,
    shadows: false
  }
}

/**
 * Dark Theme - Modern dark mode appearance using Xinfinity brand colors
 * Updated to use your logo colors instead of black backgrounds
 */
export const DARK_THEME: PDFTheme = {
  name: 'Dark',
  colors: {
    primary: '#1e40af',      // Your primary brand color
    primaryLight: '#3b82f6', // Your primary light brand color
    secondary: '#06b6d4',    // Your secondary brand color
    secondaryLight: '#22d3ee',
    accent: '#1e3a8a',       // Your accent brand color
    accentLight: '#1d4ed8',  // Your accent light brand color
    background: '#f8fafc',   // Light background instead of dark - no more black!
    surface: '#ffffff',      // White surface instead of dark
    text: '#1e293b',         // Dark text for readability
    textSecondary: '#64748b', // Your brand gray for secondary text
    border: '#e2e8f0',       // Light border using your brand colors
    borderLight: '#f1f5f9',  // Lighter border
    tableHeader: '#06b6d4',  // Use your secondary brand color (cyan) for headers - more visible
    tableRowEven: '#f8fafc', // Light alternating rows using your brand colors
    tableRowOdd: '#ffffff',  // White alternating rows
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  fonts: {
    primary: 'Inter',
    secondary: 'Inter',
    monospace: 'Monaco'
  },
  spacing: {
    margin: 15,
    sectionGap: 12,
    lineHeight: 1.5,
    borderRadius: 3
  },
  effects: {
    headerGradient: true,
    glassMorphism: false,
    shadows: true
  }
}

/**
 * Collection of all available themes
 */
export const PDF_THEMES = {
  primary: PRIMARY_THEME,
  neutral: NEUTRAL_THEME,
  dark: DARK_THEME
} as const

export type PDFThemeName = keyof typeof PDF_THEMES

/**
 * Get theme by name with fallback to primary (your brand colors)
 */
export function getTheme(themeName?: PDFThemeName): PDFTheme {
  return PDF_THEMES[themeName || 'primary']
}

/**
 * Font size scale based on platform design system
 * Uses a harmonious scale for better readability
 */
export const FONT_SCALE = {
  title: 24,        // Large titles (Invoice, NDA)
  heading: 16,      // Section headers
  subheading: 14,   // Subsection headers
  body: 11,         // Main body text
  small: 9,         // Small details
  tiny: 8           // Footnotes, page numbers
} as const

/**
 * Spacing scale based on Fibonacci sequence
 * Matches the platform's spacing system
 */
export const SPACING_SCALE = {
  xs: 2,    // 0.125rem equivalent
  sm: 4,    // 0.25rem equivalent
  md: 8,    // 0.5rem equivalent
  lg: 13,   // 0.8rem equivalent
  xl: 21,   // 1.3rem equivalent
  '2xl': 34, // 2.1rem equivalent
  '3xl': 55  // 3.4rem equivalent
} as const

/**
 * Color utilities for RGB conversion (jsPDF compatibility)
 */
export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result 
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ]
    : [0, 0, 0]
}

/**
 * Convert hex color to jsPDF-compatible RGB array (0-1 range)
 */
export function hexToRgbNormalized(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex)
  return [r / 255, g / 255, b / 255]
}

/**
 * Generate gradient effect simulation for headers using your brand colors
 * Since jsPDF doesn't support real gradients, we create a subtle effect
 */
export function createGradientEffect(theme: PDFTheme): {
  startColor: [number, number, number]
  endColor: [number, number, number]
  steps: number
} {
  return {
    startColor: hexToRgbNormalized(theme.colors.secondary), // Start with cyan for visibility
    endColor: hexToRgbNormalized(theme.colors.primary),     // End with blue
    steps: 5 // Number of gradient steps to simulate
  }
}
