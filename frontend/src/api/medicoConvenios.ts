import api from './axios';
import type { MedicoConvenioListagem, MedicoConvenioVinculo } from '@/types/api';

export const medicoConveniosApi = {
  list: (medicoId: number) =>
    api.get<MedicoConvenioListagem[]>(`/medicos/${medicoId}/convenios`).then(r => r.data),

  vincular: (medicoId: number, data: MedicoConvenioVinculo) =>
    api.post<MedicoConvenioListagem>(`/medicos/${medicoId}/convenios`, data).then(r => r.data),

  desvincular: (medicoId: number, convenioId: number) =>
    api.delete(`/medicos/${medicoId}/convenios/${convenioId}`),
};
