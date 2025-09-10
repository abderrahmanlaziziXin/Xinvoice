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

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { context: userContext, updateContext } = useUserContext()
  const [currentLocale, setCurrentLocale] = useState<Locale>(
    userContext?.defaultLocale || 'en-US'
  )

  // Update locale when user context changes
  useEffect(() => {
    if (userContext?.defaultLocale && userContext.defaultLocale !== currentLocale) {
      setCurrentLocale(userContext.defaultLocale)
    }
  }, [userContext?.defaultLocale, currentLocale])

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
