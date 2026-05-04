import api from './axios'
import type { Page } from '@/types/common'
import type { DadosCadastroProntuario, Prontuario, ProntuarioListagem } from '@/types/prontuario'

export const prontuariosApi = {
  listar: (page = 0, size = 10) =>
    api.get<Page<ProntuarioListagem>>(`/prontuarios?page=${page}&size=${size}`).then((r) => r.data),
  detalhar: (id: number) => api.get<Prontuario>(`/prontuarios/${id}`).then((r) => r.data),
  cadastrar: (dados: DadosCadastroProntuario) =>
    api.post<Prontuario>('/prontuarios', dados).then((r) => r.data),
}
