import api from './axios'
import type {
  Page,
  PacienteCadastro,
  PacienteAtualizacao,
  PacienteListagem,
  PacienteDetalhamento,
} from '@/types/api'

export const pacientesApi = {
  list: (page = 0, size = 10) =>
    api.get<Page<PacienteListagem>>('/pacientes', { params: { page, size } }).then(r => r.data),

  get: (id: number) =>
    api.get<PacienteDetalhamento>(`/pacientes/${id}`).then(r => r.data),

  create: (data: PacienteCadastro) =>
    api.post<PacienteDetalhamento>('/pacientes', data).then(r => r.data),

  update: (data: PacienteAtualizacao) =>
    api.put<PacienteDetalhamento>('/pacientes', data).then(r => r.data),

  remove: (id: number) =>
    api.delete(`/pacientes/${id}`),
}
