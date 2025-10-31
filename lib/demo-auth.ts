// Demo mode configuration for AI agent testing
// This bypasses NextAuth completely when DEMO_MODE is enabled

export const isDemoMode = process.env.DEMO_MODE === 'true' || process.env.NODE_ENV === 'development'

export const demoSession = {
  user: {
    id: 'demo-user-id',
    name: 'Demo User',
    email: 'demo@example.com',
    image: null
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
}

// Mock session hook for demo mode
export function useDemoSession() {
  if (isDemoMode) {
    return {
      data: demoSession,
      status: 'authenticated'
    }
  }
  
  // Return null to fall back to real NextAuth
  return null
}