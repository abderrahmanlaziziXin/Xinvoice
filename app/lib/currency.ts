import { Currency, Locale } from '../../packages/core'

/**
 * Currency symbols mapping
 */
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'CAD': 'C$',
  'AUD': 'A$',
  'JPY': '¥',
  'CHF': 'CHF',
  'SEK': 'kr',
  'NOK': 'kr',
  'DKK': 'kr',
  'PLN': 'zł',
  'CZK': 'Kč',
  'HUF': 'Ft',
  'RUB': '₽',
  'CNY': '¥',
  'INR': '₹',
  'BRL': 'R$',
  'MXN': '$',
  'ZAR': 'R',
  'DZD': 'د.ج',
  'MAD': 'د.م.',
  'TND': 'د.ت',
  'EGP': 'ج.م',
  'NGN': '₦',
  'KES': 'KSh',
  'GHS': '₵',
  'XOF': 'CFA',
  'XAF': 'FCFA'
}

/**
 * Currency names mapping
 */
export const CURRENCY_NAMES: Record<Currency, string> = {
  'USD': 'US Dollar',
  'EUR': 'Euro',
  'GBP': 'British Pound',
  'CAD': 'Canadian Dollar',
  'AUD': 'Australian Dollar',
  'JPY': 'Japanese Yen',
  'CHF': 'Swiss Franc',
  'SEK': 'Swedish Krona',
  'NOK': 'Norwegian Krone',
  'DKK': 'Danish Krone',
  'PLN': 'Polish Złoty',
  'CZK': 'Czech Koruna',
  'HUF': 'Hungarian Forint',
  'RUB': 'Russian Ruble',
  'CNY': 'Chinese Yuan',
  'INR': 'Indian Rupee',
  'BRL': 'Brazilian Real',
  'MXN': 'Mexican Peso',
  'ZAR': 'South African Rand',
  'DZD': 'Algerian Dinar',
  'MAD': 'Moroccan Dirham',
  'TND': 'Tunisian Dinar',
  'EGP': 'Egyptian Pound',
  'NGN': 'Nigerian Naira',
  'KES': 'Kenyan Shilling',
  'GHS': 'Ghanaian Cedi',
  'XOF': 'West African CFA Franc',
  'XAF': 'Central African CFA Franc'
}

/**
 * Locale to currency mapping (common defaults)
 */
export const LOCALE_CURRENCY_MAP: Record<string, Currency> = {
  'en-US': 'USD',
  'en-GB': 'GBP',
  'en-CA': 'CAD',
  'en-AU': 'AUD',
  'fr-FR': 'EUR',
  'fr-CA': 'CAD',
  'de-DE': 'EUR',
  'es-ES': 'EUR',
  'it-IT': 'EUR',
  'pt-BR': 'BRL',
  'pt-PT': 'EUR',
  'nl-NL': 'EUR',
  'sv-SE': 'SEK',
  'no-NO': 'NOK',
  'da-DK': 'DKK',
  'fi-FI': 'EUR',
  'pl-PL': 'PLN',
  'cs-CZ': 'CZK',
  'hu-HU': 'HUF',
  'ru-RU': 'RUB',
  'zh-CN': 'CNY',
  'ja-JP': 'JPY',
  'ar-EG': 'EGP',
  'ar-DZ': 'DZD',
  'ar-MA': 'MAD',
  'ar-TN': 'TND',
  'hi-IN': 'INR'
}

/**
 * Format currency amount according to locale and currency
 */
export function formatCurrency(
  amount: number, 
  currency: Currency = 'USD', 
  locale: Locale = 'en-US'
): string {
  try {
    // Validate inputs
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new Error('Invalid amount')
    }
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  } catch (error) {
    console.warn(`Currency formatting failed for ${locale} ${currency}:`, error)
    
    // Enhanced fallback formatting with Arabic locale support
    const symbol = CURRENCY_SYMBOLS[currency] || currency
    try {
      const formattedAmount = amount.toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
      
      // For RTL locales (Arabic), adjust symbol placement
      if (locale.startsWith('ar-')) {
        return `${formattedAmount} ${symbol}`
      }
      return `${symbol}${formattedAmount}`
    } catch (fallbackError) {
      // Final fallback - use English formatting
      const formattedAmount = amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
      return `${symbol}${formattedAmount}`
    }
  }
}

/**
 * Format number according to locale
 */
export function formatNumber(
  number: number, 
  locale: Locale = 'en-US',
  options?: Intl.NumberFormatOptions
): string {
  try {
    // Validate inputs
    if (typeof number !== 'number' || isNaN(number)) {
      throw new Error('Invalid number')
    }
    
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options
    }).format(number)
  } catch (error) {
    console.warn(`Number formatting failed for ${locale}:`, error)
    
    // Fallback to English formatting
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options
    }).format(number)
  }
}

/**
 * Format date according to locale
 */
export function formatDate(
  date: string | Date, 
  locale: Locale = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    // Validate date
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date')
    }
    
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    }).format(dateObj)
  } catch (error) {
    console.warn(`Date formatting failed for ${locale}:`, error)
    
    // Fallback to English formatting
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    }).format(dateObj)
  }
}

/**
 * Get currency symbol for a given currency
 */
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency] || currency
}

/**
 * Get currency name for a given currency
 */
export function getCurrencyName(currency: Currency): string {
  return CURRENCY_NAMES[currency] || currency
}

/**
 * Get suggested currency for a locale
 */
export function getSuggestedCurrency(locale: Locale): Currency {
  return LOCALE_CURRENCY_MAP[locale] || 'USD'
}

/**
 * Get popular currencies list for UI
 */
export function getPopularCurrencies(): Array<{code: Currency, name: string, symbol: string}> {
  const popular: Currency[] = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'BRL']
  return popular.map(currency => ({
    code: currency,
    name: CURRENCY_NAMES[currency],
    symbol: CURRENCY_SYMBOLS[currency]
  }))
}

/**
 * Get regional currencies for specific regions
 */
export function getRegionalCurrencies(region: 'africa' | 'europe' | 'asia' | 'americas'): Array<{code: Currency, name: string, symbol: string}> {
  const regions = {
    africa: ['DZD', 'MAD', 'TND', 'EGP', 'NGN', 'KES', 'GHS', 'ZAR', 'XOF', 'XAF'] as Currency[],
    europe: ['EUR', 'GBP', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RUB'] as Currency[],
    asia: ['CNY', 'JPY', 'INR'] as Currency[],
    americas: ['USD', 'CAD', 'BRL', 'MXN'] as Currency[]
  }
  
  return (regions[region] || []).map(currency => ({
    code: currency,
    name: CURRENCY_NAMES[currency],
    symbol: CURRENCY_SYMBOLS[currency]
  }))
}
