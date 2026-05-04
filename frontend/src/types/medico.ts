import type { Endereco } from './common'

export interface MedicoListagem {
  id: number
  nome: string
  email: string
  crm: string
  especialidade: string
}

export interface Medico extends MedicoListagem {
  telefone: string
  endereco: Endereco
}

export interface DadosCadastroMedico {
  nome: string
  email: string
  telefone: string
  crm: string
  especialidadeId: number
  endereco: Endereco
}
