import api from './axios';
import type { Page, ConvenioPacienteListagem, ConvenioPacienteCadastro } from '@/types/api';

export const convenioPacienteApi = {
  list: (pacienteId: number) =>
    api.get<Page<ConvenioPacienteListagem>>(`/pacientes/${pacienteId}/convenios`).then(r => r.data),

  associar: (pacienteId: number, data: ConvenioPacienteCadastro) =>
    api.post<ConvenioPacienteListagem>(`/pacientes/${pacienteId}/convenios`, data).then(r => r.data),

  remover: (pacienteId: number, convenioPacienteId: number) =>
    api.delete(`/pacientes/${pacienteId}/convenios/${convenioPacienteId}`),
};
