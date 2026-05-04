import api from './axios'
import type { Page } from '@/types/common'
import type { Consulta, DadosAgendamentoConsulta, DadosCancelamentoConsulta } from '@/types/consulta'

export const consultasApi = {
  listar: (page = 0, size = 10) =>
    api.get<Page<Consulta>>(`/consultas?page=${page}&size=${size}`).then((r) => r.data),
  agendar: (dados: DadosAgendamentoConsulta) =>
    api.post<Consulta>('/consultas', dados).then((r) => r.data),
  cancelar: (dados: DadosCancelamentoConsulta) => api.delete('/consultas', { data: dados }),
}
