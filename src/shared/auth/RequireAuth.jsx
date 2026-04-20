import { Navigate } from 'react-router-dom'
import { useSession } from './useSession.js'

export function RequireAuth({ children, redirectTo = '/login' }) {
  const { authenticated } = useSession()
  if (!authenticated) return <Navigate to={redirectTo} replace />
  return children
}
