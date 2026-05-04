export type TipoConvenio = 'PARTICULAR' | 'PLANO'

export interface Convenio {
  id: number
  nome: string
  codigoANS: string
  tipo: TipoConvenio
}

export interface DadosCadastroConvenio {
  nome: string
  codigoANS: string
  tipo: TipoConvenio
}
