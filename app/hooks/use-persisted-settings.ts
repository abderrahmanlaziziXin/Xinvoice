import { useState, useEffect } from 'react'

type StorageKey = 'userSettings' | 'lastUsedCurrency' | 'lastUsedLocale' | 'companySettings'

interface UserSettings {
  companyName?: string
  companyAddress?: string
  companyEmail?: string
  companyPhone?: string
  defaultCurrency?: string
  defaultLocale?: string
  defaultTaxRate?: number
  logoUrl?: string
  website?: string
  taxNumber?: string
  bankDetails?: {
    accountName?: string
    accountNumber?: string
    routingNumber?: string
    bankName?: string
    iban?: string
    swift?: string
  }
}

export function useLocalStorage<T>(key: StorageKey, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return defaultValue
    }

    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  })

  const setStoredValue = (newValue: T | ((val: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue
      setValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [value, setStoredValue] as const
}

export function usePersistedUserSettings() {
  const [settings, setSettings] = useLocalStorage<UserSettings>('userSettings', {})

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateBankDetails = (bankDetails: Partial<UserSettings['bankDetails']>) => {
    setSettings(prev => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, ...bankDetails }
    }))
  }

  return {
    settings,
    setSettings,
    updateSetting,
    updateBankDetails
  }
}

export function usePersistedCurrency() {
  return useLocalStorage<string>('lastUsedCurrency', 'USD')
}

export function usePersistedLocale() {
  return useLocalStorage<string>('lastUsedLocale', 'en-US')
}

export function usePersistedSettings() {
  const { settings } = usePersistedUserSettings()
  
  return {
    userContext: {
      companyName: settings.companyName || '',
      companyAddress: settings.companyAddress || '',
      companyEmail: settings.companyEmail || '',
      companyPhone: settings.companyPhone || '',
      defaultCurrency: settings.defaultCurrency || 'USD',
      defaultLocale: settings.defaultLocale || 'en-US',
      defaultTaxRate: settings.defaultTaxRate || 0,
      logoUrl: settings.logoUrl || '',
      website: settings.website || '',
      taxNumber: settings.taxNumber || '',
      bankDetails: settings.bankDetails || {}
    }
  }
}
