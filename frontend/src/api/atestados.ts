import api from './axios'
import type { Page } from '@/types/common'
import type { Atestado, DadosCadastroAtestado } from '@/types/atestado'

export const atestadosApi = {
  listarPorPaciente: (pacienteId: number, page = 0, size = 10) =>
    api.get<Page<Atestado>>(`/atestados/paciente/${pacienteId}?page=${page}&size=${size}`).then((r) => r.data),
  detalhar: (id: number) => api.get<Atestado>(`/atestados/${id}`).then((r) => r.data),
  cadastrar: (dados: DadosCadastroAtestado) =>
    api.post<Atestado>('/atestados', dados).then((r) => r.data),
}
