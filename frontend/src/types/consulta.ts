export type PrioridadeConsulta = 'ROTINA' | 'PRIORITARIO' | 'URGENCIA'
export type TipoConsulta = 'NORMAL' | 'RETORNO'
export type MotivoCancelamento = 'PACIENTE_DESISTIU' | 'MEDICO_CANCELOU' | 'OUTROS'

export interface Consulta {
  id: number
  idMedico: number
  idPaciente: number
  data: string
  prioridade: PrioridadeConsulta
  tipo: TipoConsulta
  convenioId?: number
  motivoCancelamento?: MotivoCancelamento
}

export interface DadosAgendamentoConsulta {
  idPaciente: number
  idMedico?: number
  data: string
  prioridade: PrioridadeConsulta
  consultaOrigemId?: number
  convenioId?: number
}

export interface DadosCancelamentoConsulta {
  idConsulta: number
  motivo: MotivoCancelamento
  canceladoPor?: 'PACIENTE' | 'CLINICA'
}
