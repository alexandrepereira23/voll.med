import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { Role } from '@/types/auth'
import { canAccess, getDefaultPathForRole } from '@/utils/roles'

interface RoleRouteProps {
  roles: Role[]
}

export function RoleRoute({ roles }: RoleRouteProps) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!canAccess(user?.role, roles)) {
    return <Navigate to={getDefaultPathForRole(user?.role)} replace />
  }

  return <Outlet />
}
