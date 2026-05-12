import api from './axios'
import type {
  Page,
  EspecialidadeListagem,
  EspecialidadeCadastro,
  EspecialidadeAtualizacao,
} from '@/types/api'

export const especialidadesApi = {
  list: (page = 0, size = 20) =>
    api.get<Page<EspecialidadeListagem>>('/especialidades', { params: { page, size } }).then(r => r.data),

  listAll: () =>
    api.get<Page<EspecialidadeListagem>>('/especialidades', { params: { page: 0, size: 100 } }).then(r => r.data.content),

  create: (data: EspecialidadeCadastro) =>
    api.post<EspecialidadeListagem>('/especialidades', data).then(r => r.data),

  update: (id: number, data: EspecialidadeAtualizacao) =>
    api.put<EspecialidadeListagem>(`/especialidades/${id}`, data).then(r => r.data),

  remove: (id: number) =>
    api.delete(`/especialidades/${id}`),
}
