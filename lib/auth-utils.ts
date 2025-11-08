import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextRequest } from "next/server"
import { cookies } from "next/headers"

/**
 * Get the current user's ID from the session
 * Works in both API routes and server components
 */
export async function getUserId(request?: NextRequest): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions)
    return session?.user?.id || null
  } catch (error) {
    console.error('Error getting user session:', error)
    return null
  }
}

/**
 * Get the current user's ID and throw if not authenticated
 */
export async function requireUserId(request?: NextRequest): Promise<string> {
  const userId = await getUserId(request)
  if (!userId) {
    throw new Error('Authentication required')
  }
  return userId
}

/**
 * Legacy function for backward compatibility
 * Falls back to demo mode if no session
 */
export function resolveUserId(): string | null {
  // For backward compatibility during transition
  if (process.env.DEMO_MODE === 'true') return 'demo-user-1'
  if (process.env.DEFAULT_USER_ID) return process.env.DEFAULT_USER_ID
  return null
}

/**
 * Get user ID from session or fall back to demo mode
 */
export async function getUserIdWithFallback(request?: NextRequest): Promise<string | null> {
  // Try to get from NextAuth session first
  const sessionUserId = await getUserId(request)
  if (sessionUserId) return sessionUserId
  
  // Check for demo session cookie
  try {
    const cookieStore = cookies()
    const demoSession = cookieStore.get('demo-session')
    if (demoSession?.value === 'active') {
      return 'demo-user-1'
    }
  } catch (error) {
    // Cookie access might fail in some contexts, ignore
  }
  
  // Fall back to legacy demo mode
  return resolveUserId()
}