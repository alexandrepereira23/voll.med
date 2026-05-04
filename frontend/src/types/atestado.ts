export interface Atestado {
  id: number
  prontuarioId: number
  diasAfastamento: number
  cid10?: string
  dataEmissao: string
  observacoes?: string
}

export interface DadosCadastroAtestado {
  prontuarioId: number
  diasAfastamento: number
  cid10?: string
  observacoes?: string
}
