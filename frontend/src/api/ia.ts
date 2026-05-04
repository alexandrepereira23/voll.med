import api from './axios'
import type { IaResposta } from '@/types/ia'

export const iaApi = {
  preDiagnostico: (dados: { consultaId: number; sintomas: string }) =>
    api.post<IaResposta>('/ia/pre-diagnostico', dados).then((r) => r.data),
  gerarLaudo: (dados: { prontuarioId: number; anotacoes: string }) =>
    api.post<IaResposta>('/ia/gerar-laudo', dados).then((r) => r.data),
  resumoHistorico: (pacienteId: number) =>
    api.get<IaResposta>(`/ia/resumo-historico/${pacienteId}`).then((r) => r.data),
}
