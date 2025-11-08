import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect dashboard routes
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          // Check for NextAuth token first
          if (token) return true
          
          // Check for demo session cookie
          const demoSession = req.cookies.get('demo-session')
          if (demoSession?.value === 'active') {
            return true
          }
          
          return false
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*']
}