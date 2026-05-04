export type TipoPrescricao = 'SIMPLES' | 'ESPECIAL'

export interface PrescricaoItem {
  medicamento: string
  dosagem: string
  posologia: string
  duracao: string
}

export interface Prescricao {
  id: number
  prontuarioId: number
  tipo: TipoPrescricao
  dataEmissao: string
  dataValidade: string
  itens: PrescricaoItem[]
}

export interface DadosCadastroPrescricao {
  prontuarioId: number
  tipo: TipoPrescricao
  itens: PrescricaoItem[]
}
