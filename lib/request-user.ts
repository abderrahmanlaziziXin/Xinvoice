// Unified user resolution logic.
// In production you should replace this with real auth (NextAuth / custom JWT etc.)
// For now we support:
//  - DEMO_MODE=true  => returns 'demo-user-1'
//  - DEFAULT_USER_ID env var => returns its value
//  - Otherwise returns null (caller should handle 401)

export function resolveUserId(): string | null {
  if (process.env.DEMO_MODE === 'true') return 'demo-user-1';
  if (process.env.DEFAULT_USER_ID) return process.env.DEFAULT_USER_ID;
  return null;
}

export function requireUserId(): string {
  const uid = resolveUserId();
  if (!uid) throw new Error('User not authenticated (DEFAULT_USER_ID missing and DEMO_MODE not enabled)');
  return uid;
}