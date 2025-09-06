import { useState, useCallback } from 'react'

interface Toast {
  id: string
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    setToasts(prev => [...prev, newToast])
    
    // Auto-dismiss after duration (default 5 seconds)
    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [removeToast])

  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  const success = useCallback((message: string, duration?: number) => {
    addToast({ message, type: 'success', duration })
  }, [addToast])

  const error = useCallback((message: string, duration = 8000) => {
    addToast({ message, type: 'error', duration })
  }, [addToast])

  const info = useCallback((message: string, duration?: number) => {
    addToast({ message, type: 'info', duration })
  }, [addToast])

  const warning = useCallback((message: string, duration?: number) => {
    addToast({ message, type: 'warning', duration })
  }, [addToast])

  // PDF-specific toast helpers
  const pdfSuccess = useCallback((filename: string) => {
    success(`PDF downloaded: ${filename}`, 4000)
  }, [success])

  const pdfError = useCallback((errorMessage: string) => {
    error(`PDF generation failed: ${errorMessage}`, 10000)
  }, [error])

  const batchProgress = useCallback((completed: number, total: number) => {
    info(`Batch processing: ${completed}/${total} PDFs completed`, 2000)
  }, [info])

  return {
    toasts,
    addToast,
    removeToast,
    dismissAll,
    success,
    error,
    info,
    warning,
    pdfSuccess,
    pdfError,
    batchProgress
  }
}

export default useToast
