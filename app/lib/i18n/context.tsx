/**
 * Locale Context for Platform-wide Internationalization
 */

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Locale } from '../../../packages/core/schemas'
import { useUserContext } from '../user-context'

interface LocaleContextType {
  currentLocale: Locale
  setLocale: (locale: Locale) => void
  direction: 'ltr' | 'rtl'
  isRTL: boolean
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

// Browser language detection utility
function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') return 'en-US'
  
  const supportedLocales: Locale[] = [
    'en-US', 'en-GB', 'fr-FR', 'fr-CA', 'de-DE', 'es-ES',
    'ar-DZ', 'ar-MA', 'ar-SA', 'ar-AE'
  ]
  
  // Get browser language with fallbacks
  const browserLang = navigator.language || navigator.languages?.[0] || 'en-US'
  
  // Direct match
  if (supportedLocales.includes(browserLang as Locale)) {
    return browserLang as Locale
  }
  
  // Language family match (e.g., 'fr' -> 'fr-FR', 'ar' -> 'ar-DZ')
  const langCode = browserLang.split('-')[0]
  const fallbackMap: Record<string, Locale> = {
    'en': 'en-US',
    'fr': 'fr-FR', 
    'de': 'de-DE',
    'es': 'es-ES',
    'ar': 'ar-DZ'
  }
  
  return fallbackMap[langCode] || 'en-US'
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { context: userContext, updateContext } = useUserContext()
  const [currentLocale, setCurrentLocale] = useState<Locale>(() => {
    // Priority: user context > browser language > default
    return userContext?.defaultLocale || getBrowserLocale()
  })

  // Update locale when user context changes
  useEffect(() => {
    if (userContext?.defaultLocale && userContext.defaultLocale !== currentLocale) {
      setCurrentLocale(userContext.defaultLocale)
    }
  }, [userContext?.defaultLocale, currentLocale])

  // Initialize with browser language on first load
  useEffect(() => {
    if (!userContext?.defaultLocale) {
      const browserLocale = getBrowserLocale()
      setCurrentLocale(browserLocale)
      updateContext({ defaultLocale: browserLocale })
    }
  }, [userContext?.defaultLocale, updateContext])

  const setLocale = (locale: Locale) => {
    setCurrentLocale(locale)
    updateContext({ defaultLocale: locale })
  }

  const isRTL = currentLocale.startsWith('ar-') || 
                currentLocale.startsWith('he-') || 
                currentLocale.startsWith('fa-')
                
  const direction: 'ltr' | 'rtl' = isRTL ? 'rtl' : 'ltr'

  // Apply direction to document
  useEffect(() => {
    document.documentElement.dir = direction
    document.documentElement.lang = currentLocale.split('-')[0]
  }, [direction, currentLocale])

  const value: LocaleContextType = {
    currentLocale,
    setLocale,
    direction,
    isRTL
  }

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}

export function useTranslations() {
  const { currentLocale } = useLocale()
  const { getTranslation } = require('./index')
  
  const t = (keyPath: string) => getTranslation(currentLocale, keyPath)
  
  return { t, locale: currentLocale }
}
