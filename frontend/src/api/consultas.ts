import api from './axios'
import type {
  Page,
  ConsultaAgendamento,
  ConsultaCancelamento,
  ConsultaListagem,
} from '@/types/api'

export const consultasApi = {
  list: (page = 0, size = 10) =>
    api.get<Page<ConsultaListagem>>('/consultas', { params: { page, size } }).then(r => r.data),

  schedule: (data: ConsultaAgendamento) =>
    api.post<ConsultaListagem>('/consultas', data).then(r => r.data),

  cancel: (data: ConsultaCancelamento) =>
    api.delete('/consultas', { data }).then(r => r.data),
}
