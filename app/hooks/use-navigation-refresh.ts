import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function useNavigationRefresh() {
  const router = useRouter()

  const navigateWithRefresh = useCallback((href: string, delay = 100) => {
    // Trigger dashboard data reset if navigating to dashboard
    if (href.includes('/dashboard') && !href.includes('/dashboard/invoices/') && !href.includes('/dashboard/clients/')) {
      window.dispatchEvent(new CustomEvent('dashboardFocus'))
    }
    
    // Clear any potential state conflicts
    setTimeout(() => {
      router.refresh()
      router.push(href)
    }, delay)
  }, [router])

  const refreshAndStay = useCallback(() => {
    router.refresh()
  }, [router])

  const navigateToDashboard = useCallback(() => {
    // Force dashboard data reset
    window.dispatchEvent(new CustomEvent('dashboardFocus'))
    router.push('/dashboard')
  }, [router])

  return {
    navigateWithRefresh,
    refreshAndStay,
    navigateToDashboard,
    router
  }
}