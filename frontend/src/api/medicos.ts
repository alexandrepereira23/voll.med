import api from './axios'
import type { Page } from '@/types/common'
import type { DadosCadastroMedico, Medico, MedicoListagem } from '@/types/medico'

export const medicosApi = {
  listar: (page = 0, size = 10) =>
    api.get<Page<MedicoListagem>>(`/medicos?page=${page}&size=${size}`).then((r) => r.data),
  detalhar: (id: number) => api.get<Medico>(`/medicos/${id}`).then((r) => r.data),
  cadastrar: (dados: DadosCadastroMedico) => api.post<Medico>('/medicos', dados).then((r) => r.data),
  excluir: (id: number) => api.delete(`/medicos/${id}`),
}
