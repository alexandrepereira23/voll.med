import api from './axios'
import type {
  Page,
  ConvenioListagem,
  ConvenioCadastro,
  ConvenioAtualizacao,
} from '@/types/api'

export const conveniosApi = {
  list: (page = 0, size = 10) =>
    api.get<Page<ConvenioListagem>>('/convenios', { params: { page, size } }).then(r => r.data),

  listAll: () =>
    api.get<Page<ConvenioListagem>>('/convenios', { params: { page: 0, size: 100 } }).then(r => r.data.content),

  create: (data: ConvenioCadastro) =>
    api.post<ConvenioListagem>('/convenios', data).then(r => r.data),

  update: (id: number, data: ConvenioAtualizacao) =>
    api.put<ConvenioListagem>(`/convenios/${id}`, data).then(r => r.data),

  remove: (id: number) =>
    api.delete(`/convenios/${id}`),
}
