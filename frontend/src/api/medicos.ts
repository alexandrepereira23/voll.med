import api from './axios'
import type {
  Page,
  MedicoCadastro,
  MedicoAtualizacao,
  MedicoListagem,
  MedicoDetalhamento,
} from '@/types/api'

export const medicosApi = {
  list: (page = 0, size = 10) =>
    api.get<Page<MedicoListagem>>('/medicos', { params: { page, size } }).then(r => r.data),

  get: (id: number) =>
    api.get<MedicoDetalhamento>(`/medicos/${id}`).then(r => r.data),

  create: (data: MedicoCadastro) =>
    api.post<MedicoDetalhamento>('/medicos', data).then(r => r.data),

  update: (data: MedicoAtualizacao) =>
    api.put<MedicoDetalhamento>('/medicos', data).then(r => r.data),

  remove: (id: number) =>
    api.delete(`/medicos/${id}`),
}
