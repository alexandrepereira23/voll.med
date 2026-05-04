import { useEffect, useState } from 'react'
import { Calendar, Plus, XCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Select } from '@/components/ui/Select'
import { Table } from '@/components/ui/Table'
import { consultasApi } from '@/api/consultas'
import { useAuth } from '@/hooks/useAuth'
import { formatDateTime } from '@/utils/date'
import { getApiErrorMessage } from '@/utils/apiError'
import type { Consulta, PrioridadeConsulta } from '@/types/consulta'
import type { Page } from '@/types/common'

interface FormData {
  idPaciente: string
  idMedico?: string
  data: string
  prioridade: PrioridadeConsulta
  consultaOrigemId?: string
  convenioId?: string
}

const prioridadeVariant: Record<PrioridadeConsulta, 'success' | 'warning' | 'danger'> = {
  ROTINA: 'success',
  PRIORITARIO: 'warning',
  URGENCIA: 'danger',
}

export function ConsultasPage() {
  const { user } = useAuth()
  const canWrite = user?.role === 'ROLE_FUNCIONARIO'
  const [page, setPage] = useState(0)
  const [data, setData] = useState<Page<Consulta> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { register, reset, handleSubmit, formState } = useForm<FormData>({ defaultValues: { prioridade: 'ROTINA' } })

  async function load(currentPage = page) {
    setLoading(true)
    setError(null)
    try {
      setData(await consultasApi.listar(currentPage))
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load(page)
  }, [page])

  async function onSubmit(form: FormData) {
    setError(null)
    try {
      await consultasApi.agendar({
        idPaciente: Number(form.idPaciente),
        idMedico: form.idMedico ? Number(form.idMedico) : undefined,
        data: form.data,
        prioridade: form.prioridade,
        consultaOrigemId: form.consultaOrigemId ? Number(form.consultaOrigemId) : undefined,
        convenioId: form.convenioId ? Number(form.convenioId) : undefined,
      })
      reset({ prioridade: 'ROTINA' })
      await load(0)
      setPage(0)
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  async function onCancel(id: number) {
    setError(null)
    try {
      await consultasApi.cancelar({ idConsulta: id, motivo: 'OUTROS', canceladoPor: 'CLINICA' })
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  return (
    <div>
      <PageHeader icon={<Calendar size={20} />} title="Consultas" />

      {canWrite && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-border shadow-sm p-6 mb-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Input label="ID do paciente" type="number" min={1} {...register('idPaciente', { required: true })} />
            <Input label="ID do médico" type="number" min={1} {...register('idMedico')} />
            <Input label="Data e hora" type="datetime-local" {...register('data', { required: true })} />
            <Select label="Prioridade" {...register('prioridade')}>
              <option value="ROTINA">Rotina</option>
              <option value="PRIORITARIO">Prioritário</option>
              <option value="URGENCIA">Urgência</option>
            </Select>
            <Input label="Consulta origem" type="number" min={1} {...register('consultaOrigemId')} />
            <Input label="Convênio" type="number" min={1} {...register('convenioId')} />
          </div>
          <div className="flex justify-end mt-5">
            <Button type="submit" loading={formState.isSubmitting}>
              <Plus size={16} />
              Agendar consulta
            </Button>
          </div>
        </form>
      )}

      {error && <p className="text-sm text-danger mb-4">{error}</p>}
      {loading && <p className="text-sm text-text-secondary">Carregando consultas...</p>}

      {!loading && data?.content.length === 0 && <EmptyState title="Nenhuma consulta encontrada" />}

      {!loading && data && data.content.length > 0 && (
        <>
          <Table headers={['Data', 'Paciente', 'Médico', 'Prioridade', 'Tipo', '']}>
            {data.content.map((item) => (
              <tr key={item.id} className="hover:bg-surface-hover transition-colors duration-150">
                <td className="px-4 py-3 font-medium text-text-primary">{formatDateTime(item.data)}</td>
                <td className="px-4 py-3 text-text-secondary">#{item.idPaciente}</td>
                <td className="px-4 py-3 text-text-secondary">#{item.idMedico}</td>
                <td className="px-4 py-3">
                  <Badge variant={prioridadeVariant[item.prioridade]}>{item.prioridade}</Badge>
                </td>
                <td className="px-4 py-3 text-text-secondary">{item.tipo}</td>
                <td className="px-4 py-3 text-right">
                  {canWrite && (
                    <button type="button" onClick={() => void onCancel(item.id)} className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10" title="Cancelar">
                      <XCircle size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </Table>
          <Pagination currentPage={data.number} totalPages={data.totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
