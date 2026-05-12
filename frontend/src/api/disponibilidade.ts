import api from './axios';
import type { DisponibilidadeListagem, DisponibilidadeCadastro } from '@/types/api';

export const disponibilidadeApi = {
  list: (medicoId: number) =>
    api.get<DisponibilidadeListagem[]>(`/medicos/${medicoId}/disponibilidade`).then(r => r.data),

  create: (medicoId: number, data: DisponibilidadeCadastro) =>
    api.post<DisponibilidadeListagem>(`/medicos/${medicoId}/disponibilidade`, data).then(r => r.data),

  remove: (medicoId: number, disponibilidadeId: number) =>
    api.delete(`/medicos/${medicoId}/disponibilidade/${disponibilidadeId}`),
};
