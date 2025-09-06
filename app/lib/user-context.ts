'use client'

import { UserContext } from '../../packages/core/schemas'

const USER_CONTEXT_KEY = 'mvp-user-context'

export class UserContextManager {
  static get(): UserContext | null {
    if (typeof window === 'undefined') return null
    
    try {
      const stored = localStorage.getItem(USER_CONTEXT_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  static save(context: Partial<UserContext>): void {
    if (typeof window === 'undefined') return
    
    const current = this.get() || {}
    const updated = { ...current, ...context }
    
    localStorage.setItem(USER_CONTEXT_KEY, JSON.stringify(updated))
  }

  static clear(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(USER_CONTEXT_KEY)
  }

  static update(updates: Partial<UserContext>): UserContext {
    const current = this.get() || {}
    const updated: UserContext = { 
      defaultCurrency: 'USD',
      defaultLocale: 'en-US',
      defaultTaxRate: 0.08,
      ...current, 
      ...updates 
    }
    this.save(updated)
    return updated
  }
}

// Hook for React components
import { useState, useEffect } from 'react'

export function useUserContext() {
  const [context, setContext] = useState<UserContext | null>(null)

  useEffect(() => {
    setContext(UserContextManager.get())
  }, [])

  const updateContext = (updates: Partial<UserContext>) => {
    const updated = UserContextManager.update(updates)
    setContext(updated)
    return updated
  }

  const clearContext = () => {
    UserContextManager.clear()
    setContext(null)
  }

  return {
    context,
    updateContext,
    clearContext,
    hasContext: !!context
  }
}
