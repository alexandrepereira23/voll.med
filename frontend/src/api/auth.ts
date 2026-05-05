import api from './axios'
import type { CadastroUsuarioPayload, LoginPayload, TokenResponse, UsuarioDetalhamento } from '@/types/auth'

export const authApi = {
  login: (dados: LoginPayload) =>
    api.post<TokenResponse>('/auth/login', dados).then((r) => r.data),
  cadastrarUsuario: (dados: CadastroUsuarioPayload) =>
    api.post<UsuarioDetalhamento>('/auth/cadastro', dados).then((r) => r.data),
}
