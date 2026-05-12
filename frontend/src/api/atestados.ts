import api from './axios'
import type { Page, AtestadoListagem, AtestadoCadastro } from '@/types/api'

export const atestadosApi = {
  listByPaciente: (pacienteId: number, page = 0, size = 10) =>
    api.get<Page<AtestadoListagem>>(`/atestados/paciente/${pacienteId}`, { params: { page, size } }).then(r => r.data),

  create: (data: AtestadoCadastro) =>
    api.post('/atestados', data).then(r => r.data),
}
