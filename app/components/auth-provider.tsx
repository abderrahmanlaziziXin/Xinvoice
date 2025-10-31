"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Add error boundary for NextAuth issues
  return (
    <SessionProvider 
      // Reduce refetch interval to avoid constant API calls
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  );
}
