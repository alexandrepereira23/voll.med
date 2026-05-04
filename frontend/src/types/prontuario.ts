export interface ProntuarioListagem {
  id: number
  consultaId: number
  nomeMedico: string
  nomePaciente: string
  diagnostico: string
  dataRegistro: string
}

export interface Prontuario extends ProntuarioListagem {
  anamnese: string
  cid10?: string
  observacoes?: string
}

export interface DadosCadastroProntuario {
  consultaId: number
  anamnese: string
  diagnostico: string
  cid10?: string
  observacoes?: string
}
