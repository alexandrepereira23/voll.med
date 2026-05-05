import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { RoleRoute } from './RoleRoute'
import { Layout } from '@/components/layout/Layout'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { AtestadosPage } from '@/pages/atestados/AtestadosPage'
import { ConsultasPage } from '@/pages/consultas/ConsultasPage'
import { ConveniosPage } from '@/pages/convenios/ConveniosPage'
import { EspecialidadesPage } from '@/pages/especialidades/EspecialidadesPage'
import { IaPage } from '@/pages/ia/IaPage'
import { MedicosPage } from '@/pages/medicos/MedicosPage'
import { PacientesPage } from '@/pages/pacientes/PacientesPage'
import { PrescricoesPage } from '@/pages/prescricoes/PrescricoesPage'
import { ProntuariosPage } from '@/pages/prontuarios/ProntuariosPage'
import { UsuariosPage } from '@/pages/usuarios/UsuariosPage'
import { adminRoles, clinicalRoles } from '@/utils/roles'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route element={<RoleRoute roles={adminRoles} />}>
              <Route path="/usuarios" element={<UsuariosPage />} />
            </Route>
            <Route element={<RoleRoute roles={clinicalRoles} />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/medicos" element={<MedicosPage />} />
              <Route path="/pacientes" element={<PacientesPage />} />
              <Route path="/consultas" element={<ConsultasPage />} />
              <Route path="/prontuarios" element={<ProntuariosPage />} />
              <Route path="/prescricoes" element={<PrescricoesPage />} />
              <Route path="/atestados" element={<AtestadosPage />} />
              <Route path="/especialidades" element={<EspecialidadesPage />} />
            </Route>
            <Route element={<RoleRoute roles={['ROLE_FUNCIONARIO']} />}>
              <Route path="/convenios" element={<ConveniosPage />} />
            </Route>
            <Route element={<RoleRoute roles={['ROLE_MEDICO']} />}>
              <Route path="/ia" element={<IaPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
