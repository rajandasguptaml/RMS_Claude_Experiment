// Stub session hook. Real Cubix SSO integration belongs to bolt-shell-and-check-in-1.
// This placeholder lets auth-gated routes render during isolated development.
export function useSession() {
  return { authenticated: true, user: null }
}
