import api from './axios'
import type { Page } from '@/types/common'
import type { DadosCadastroEspecialidade, Especialidade } from '@/types/especialidade'

export const especialidadesApi = {
  listar: (page = 0, size = 10) =>
    api.get<Page<Especialidade>>(`/especialidades?page=${page}&size=${size}`).then((r) => r.data),
  cadastrar: (dados: DadosCadastroEspecialidade) =>
    api.post<Especialidade>('/especialidades', dados).then((r) => r.data),
  atualizar: (id: number, dados: DadosCadastroEspecialidade) =>
    api.put<Especialidade>(`/especialidades/${id}`, dados).then((r) => r.data),
  excluir: (id: number) => api.delete(`/especialidades/${id}`),
}
