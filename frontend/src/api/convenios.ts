import api from './axios'
import type { Page } from '@/types/common'
import type { Convenio, DadosCadastroConvenio } from '@/types/convenio'

export const conveniosApi = {
  listar: (page = 0, size = 10) =>
    api.get<Page<Convenio>>(`/convenios?page=${page}&size=${size}`).then((r) => r.data),
  cadastrar: (dados: DadosCadastroConvenio) =>
    api.post<Convenio>('/convenios', dados).then((r) => r.data),
}
