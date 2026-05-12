import api from './axios'
import type { Page, PrescricaoListagem, PrescricaoDetalhamento, PrescricaoCadastro } from '@/types/api'

export const prescricoesApi = {
  listByProntuario: (prontuarioId: number, page = 0, size = 10) =>
    api.get<Page<PrescricaoListagem>>(`/prescricoes/prontuario/${prontuarioId}`, { params: { page, size } }).then(r => r.data),

  get: (id: number) =>
    api.get<PrescricaoDetalhamento>(`/prescricoes/${id}`).then(r => r.data),

  create: (data: PrescricaoCadastro) =>
    api.post<PrescricaoDetalhamento>('/prescricoes', data).then(r => r.data),
}
