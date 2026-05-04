import api from './axios'
import type { Page } from '@/types/common'
import type { DadosCadastroPaciente, Paciente, PacienteListagem } from '@/types/paciente'

export const pacientesApi = {
  listar: (page = 0, size = 10) =>
    api.get<Page<PacienteListagem>>(`/pacientes?page=${page}&size=${size}`).then((r) => r.data),
  detalhar: (id: number) => api.get<Paciente>(`/pacientes/${id}`).then((r) => r.data),
  cadastrar: (dados: DadosCadastroPaciente) =>
    api.post<Paciente>('/pacientes', dados).then((r) => r.data),
  excluir: (id: number) => api.delete(`/pacientes/${id}`),
}
