export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface Endereco {
  logradouro: string
  bairro: string
  cep: string
  cidade: string
  uf: string
  complemento?: string
  numero?: string
}

export interface ApiError {
  message?: string
  mensagem?: string
  [field: string]: string | undefined
}
