import type { ReactNode } from 'react'
import {
  Bot,
  Calendar,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  Pill,
  ShieldCheck,
  Star,
  Stethoscope,
  Users,
} from 'lucide-react'
import type { Role } from '@/types/auth'

export const roleLabels: Record<Role, string> = {
  ROLE_ADMIN: 'Administrador',
  ROLE_FUNCIONARIO: 'Funcionário',
  ROLE_MEDICO: 'Médico',
  ROLE_AUDITOR: 'Auditor',
  ROLE_GESTOR: 'Gestor',
}

export const clinicalRoles: Role[] = [
  'ROLE_FUNCIONARIO',
  'ROLE_MEDICO',
  'ROLE_AUDITOR',
  'ROLE_GESTOR',
]

export const adminRoles: Role[] = ['ROLE_ADMIN']

export interface NavItemConfig {
  to: string
  icon: ReactNode
  label: string
  roles: Role[]
}

export const navItems: NavItemConfig[] = [
  { to: '/usuarios', icon: <ShieldCheck size={18} />, label: 'Usuários', roles: adminRoles },
  { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard', roles: clinicalRoles },
  { to: '/medicos', icon: <Stethoscope size={18} />, label: 'Médicos', roles: clinicalRoles },
  { to: '/pacientes', icon: <Users size={18} />, label: 'Pacientes', roles: clinicalRoles },
  { to: '/consultas', icon: <Calendar size={18} />, label: 'Consultas', roles: clinicalRoles },
  { to: '/prontuarios', icon: <FileText size={18} />, label: 'Prontuários', roles: clinicalRoles },
  { to: '/prescricoes', icon: <Pill size={18} />, label: 'Prescrições', roles: clinicalRoles },
  { to: '/atestados', icon: <ClipboardList size={18} />, label: 'Atestados', roles: clinicalRoles },
  { to: '/especialidades', icon: <Star size={18} />, label: 'Especialidades', roles: clinicalRoles },
  { to: '/convenios', icon: <CreditCard size={18} />, label: 'Convênios', roles: ['ROLE_FUNCIONARIO'] },
  { to: '/ia', icon: <Bot size={18} />, label: 'IA Clínica', roles: ['ROLE_MEDICO'] },
]

export function getDefaultPathForRole(role?: Role) {
  if (role === 'ROLE_ADMIN') return '/usuarios'
  return '/'
}

export function canAccess(role: Role | undefined, roles: Role[]) {
  return !!role && roles.includes(role)
}
