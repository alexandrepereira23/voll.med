import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/common'

export function getApiErrorMessage(error: unknown) {
  const data = (error as AxiosError<ApiError>).response?.data
  return data?.mensagem ?? data?.message ?? 'Não foi possível concluir a operação.'
}
