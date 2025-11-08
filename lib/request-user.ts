// Unified user resolution logic.
// In production you should replace this with real auth (NextAuth / custom JWT etc.)
// For now we support:
//  - DEMO_MODE=true  => returns 'demo-user-1'
//  - DEFAULT_USER_ID env var => returns its value
//  - Otherwise returns null (caller should handle 401)

import { prisma } from '@/lib/prisma';

export function resolveUserId(): string | null {
  if (process.env.DEMO_MODE === 'true') return 'demo-user-1';
  if (process.env.DEFAULT_USER_ID) return process.env.DEFAULT_USER_ID;
  // Attempt auto-provision if database available
  if (process.env.DATABASE_URL) {
    // Use a cached global to avoid repeated creation
    // @ts-ignore
    if (!global.__AUTO_USER_ID) {
      const generated = 'auto-user-' + Math.random().toString(36).slice(2, 10);
      // Fire and forget creation (no await to keep function sync); errors ignored
      prisma.user?.create?.({
        data: {
          id: generated,
          name: 'Auto Provisioned User',
          email: 'auto-user@example.com'
        }
      }).catch(() => {});
      // @ts-ignore
      global.__AUTO_USER_ID = generated;
    }
    // @ts-ignore
    return global.__AUTO_USER_ID as string;
  }
  return null;
}

export function requireUserId(): string {
  const uid = resolveUserId();
  if (!uid) throw new Error('User not authenticated (DEFAULT_USER_ID missing and DEMO_MODE not enabled)');
  return uid;
}