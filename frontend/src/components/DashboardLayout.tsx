import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  BarChart3,
  BookOpen,
  Building2,
  ClipboardList,
  FileText,
  LogOut,
  Menu,
  Pill,
  Stethoscope,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: <BarChart3 className="h-5 w-5" /> },
  { label: 'Médicos', href: '/doctors', icon: <Stethoscope className="h-5 w-5" /> },
  { label: 'Pacientes', href: '/patients', icon: <Users className="h-5 w-5" /> },
  { label: 'Consultas', href: '/appointments', icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'Prontuários', href: '/medical-records', icon: <BookOpen className="h-5 w-5" /> },
  { label: 'Prescrições', href: '/prescriptions', icon: <Pill className="h-5 w-5" /> },
  { label: 'Atestados', href: '/certificates', icon: <FileText className="h-5 w-5" /> },
  { label: 'Especialidades', href: '/specialties', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Convênios', href: '/insurance', icon: <ClipboardList className="h-5 w-5" /> },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const initials = user?.login
    ? user.login.slice(0, 2).toUpperCase()
    : 'VM';

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-sidebar-border p-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
                <Stethoscope className="h-4 w-4 text-sidebar-primary-foreground" />
              </div>
              <span className="font-bold text-sidebar-foreground">Voll.med</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors block',
                      location === item.href
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-sidebar-border p-4">
            <Separator className="mb-4" />
            <div className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary/20">
                <span className="text-xs font-bold text-sidebar-primary">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">
                  {user?.login ?? 'Usuário'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.role?.replace('ROLE_', '') ?? ''}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1" />
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
