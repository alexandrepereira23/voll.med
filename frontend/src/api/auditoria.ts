import api from './axios';
import type { Page } from '@/types/api';
import type { AuditoriaListagem } from '@/types/auditoria';

export const auditoriaApi = {
  listByProntuario: (prontuarioId: number, page = 0, size = 20) =>
    api
      .get<Page<AuditoriaListagem>>(`/auditoria/prontuarios/${prontuarioId}`, {
        params: { page, size, sort: 'dataHora,desc' },
      })
      .then(r => r.data),
};
