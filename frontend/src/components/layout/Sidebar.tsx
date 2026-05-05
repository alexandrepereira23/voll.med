import { LogOut, Stethoscope } from 'lucide-react'
import { NavItem } from './NavItem'
import { useAuth } from '@/hooks/useAuth'
import { canAccess, navItems, roleLabels } from '@/utils/roles'

export function Sidebar() {
  const { user, logout } = useAuth()
  const visibleItems = navItems.filter((item) => canAccess(user?.role, item.roles))

  return (
    <aside className="w-60 h-screen sticky top-0 bg-surface flex flex-col flex-shrink-0">
      <div className="px-5 py-6 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center">
            <Stethoscope size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary leading-none">Voll.med</p>
            <p className="text-xs text-text-muted mt-0.5">Sistema Clínico</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {visibleItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{user?.login}</p>
            <p className="text-xs text-text-muted">{user?.role ? roleLabels[user.role] : ''}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10 transition-colors duration-150 flex-shrink-0"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
