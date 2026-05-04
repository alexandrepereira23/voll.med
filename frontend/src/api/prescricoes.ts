import api from './axios'
import type { Page } from '@/types/common'
import type { DadosCadastroPrescricao, Prescricao } from '@/types/prescricao'

export const prescricoesApi = {
  listarPorProntuario: (prontuarioId: number, page = 0, size = 10) =>
    api.get<Page<Prescricao>>(`/prescricoes/prontuario/${prontuarioId}?page=${page}&size=${size}`).then((r) => r.data),
  detalhar: (id: number) => api.get<Prescricao>(`/prescricoes/${id}`).then((r) => r.data),
  cadastrar: (dados: DadosCadastroPrescricao) =>
    api.post<Prescricao>('/prescricoes', dados).then((r) => r.data),
}
