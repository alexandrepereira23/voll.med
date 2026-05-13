export type AcaoAuditoria = 'VISUALIZOU' | 'CRIOU' | 'EDITOU'

export interface AuditoriaListagem {
  id: number
  prontuarioId: number
  loginUsuario: string
  acao: AcaoAuditoria
  dataHora: string
  ipOrigem?: string
}
