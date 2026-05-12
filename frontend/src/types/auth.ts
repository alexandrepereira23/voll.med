export type Role =
  | 'ROLE_ADMIN'
  | 'ROLE_FUNCIONARIO'
  | 'ROLE_MEDICO'
  | 'ROLE_AUDITOR'
  | 'ROLE_GESTOR'

export interface User {
  login: string
  role: Role
}

export interface LoginPayload {
  login: string
  senha: string
}

export interface TokenResponse {
  tokenJWT: string
}

export type CadastroUsuarioRole = Exclude<Role, 'ROLE_ADMIN'>

export interface CadastroUsuarioPayload {
  login: string
  senha: string
  role: CadastroUsuarioRole
  medicoId?: number
}

export interface UsuarioDetalhamento {
  id: number
  login: string
  role: CadastroUsuarioRole
}

export interface JwtPayload {
  sub: string
  role: string
  exp: number
}
