'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface DocumentData {
  type: 'invoice' | 'nda'
  data: any
  timestamp: number
}

interface DocumentContextType {
  saveDocument: (type: 'invoice' | 'nda', data: any) => void
  getDocument: (type: 'invoice' | 'nda') => any
  clearDocument: (type: 'invoice' | 'nda') => void
  hasDocument: (type: 'invoice' | 'nda') => boolean
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined)

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<Record<string, DocumentData>>({})

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('documentDrafts')
      if (saved) {
        const parsed = JSON.parse(saved)
        setDocuments(parsed)
      }
    } catch (error) {
      console.error('Error loading document drafts:', error)
    }
  }, [])

  // Save to localStorage whenever documents change
  useEffect(() => {
    try {
      localStorage.setItem('documentDrafts', JSON.stringify(documents))
    } catch (error) {
      console.error('Error saving document drafts:', error)
    }
  }, [documents])

  const saveDocument = (type: 'invoice' | 'nda', data: any) => {
    setDocuments(prev => ({
      ...prev,
      [type]: {
        type,
        data,
        timestamp: Date.now()
      }
    }))
  }

  const getDocument = (type: 'invoice' | 'nda') => {
    const doc = documents[type]
    if (!doc) return null
    
    // Return data if it's less than 24 hours old
    const isExpired = Date.now() - doc.timestamp > 24 * 60 * 60 * 1000
    if (isExpired) {
      clearDocument(type)
      return null
    }
    
    return doc.data
  }

  const clearDocument = (type: 'invoice' | 'nda') => {
    setDocuments(prev => {
      const updated = { ...prev }
      delete updated[type]
      return updated
    })
  }

  const hasDocument = (type: 'invoice' | 'nda') => {
    return getDocument(type) !== null
  }

  return (
    <DocumentContext.Provider value={{
      saveDocument,
      getDocument,
      clearDocument,
      hasDocument
    }}>
      {children}
    </DocumentContext.Provider>
  )
}

export function useDocumentContext() {
  const context = useContext(DocumentContext)
  if (context === undefined) {
    throw new Error('useDocumentContext must be used within a DocumentProvider')
  }
  return context
}
