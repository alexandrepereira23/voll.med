import type { Endereco } from './common'

export interface PacienteListagem {
  id: number
  nome: string
  email: string
  cpf: string
}

export interface Paciente extends PacienteListagem {
  telefone: string
  endereco: Endereco
  ativo: boolean
}

export interface DadosCadastroPaciente {
  nome: string
  email: string
  telefone: string
  cpf: string
  endereco: Endereco
}
