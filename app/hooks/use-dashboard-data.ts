import { useState, useEffect, useCallback } from 'react'

export interface DashboardStats {
  totalInvoices: {
    count: number
    label: string
  }
  paidThisMonth: {
    amount: number
    count: number
    label: string
  }
  outstanding: {
    amount: number
    count: number
    label: string
  }
  overdue: {
    amount: number
    count: number
    label: string
  }
}

export interface RecentInvoice {
  id: string
  invoiceNumber: string
  client: string
  clientEmail?: string
  amount: number
  status: string
  date: string
  dueDate: string
  createdAt: string
  updatedAt: string
}

export interface DashboardData {
  stats: DashboardStats
  recentInvoices: RecentInvoice[]
  metadata: {
    currency: string
    lastUpdated: string
  }
}

interface UseDashboardDataReturn {
  data: DashboardData | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDashboardData(): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/dashboard/stats')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Listen for invoice updates to refresh dashboard
  useEffect(() => {
    const handleInvoiceUpdate = () => {
      fetchData()
    }

    const handleDashboardFocus = () => {
      // Reset and refetch data when dashboard comes into focus
      setData(null)
      fetchData()
    }

    // Listen for custom events fired when invoices are created/updated
    window.addEventListener('invoiceCreated', handleInvoiceUpdate)
    window.addEventListener('invoiceUpdated', handleInvoiceUpdate)
    window.addEventListener('invoiceStatusChanged', handleInvoiceUpdate)
    window.addEventListener('dashboardFocus', handleDashboardFocus)
    window.addEventListener('focus', handleDashboardFocus)

    return () => {
      window.removeEventListener('invoiceCreated', handleInvoiceUpdate)
      window.removeEventListener('invoiceUpdated', handleInvoiceUpdate)
      window.removeEventListener('invoiceStatusChanged', handleInvoiceUpdate)
      window.removeEventListener('dashboardFocus', handleDashboardFocus)
      window.removeEventListener('focus', handleDashboardFocus)
    }
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  }
}

// Utility function to format currency
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

// Utility function to format date
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Utility function to get status color classes
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'bg-green-100 text-green-800'
    case 'sent':
      return 'bg-blue-100 text-blue-800'
    case 'viewed':
      return 'bg-purple-100 text-purple-800'
    case 'overdue':
      return 'bg-red-100 text-red-800'
    case 'draft':
      return 'bg-gray-100 text-gray-800'
    case 'cancelled':
      return 'bg-gray-100 text-gray-600'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}