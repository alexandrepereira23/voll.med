import { useEffect, useState } from 'react'
import { FileText, Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Table } from '@/components/ui/Table'
import { Textarea } from '@/components/ui/Textarea'
import { prontuariosApi } from '@/api/prontuarios'
import { useAuth } from '@/hooks/useAuth'
import { formatDateTime } from '@/utils/date'
import { getApiErrorMessage } from '@/utils/apiError'
import type { Page } from '@/types/common'
import type { ProntuarioListagem } from '@/types/prontuario'

interface FormData {
  consultaId: string
  anamnese: string
  diagnostico: string
  cid10?: string
  observacoes?: string
}

export function ProntuariosPage() {
  const { user } = useAuth()
  const canWrite = user?.role === 'ROLE_MEDICO'
  const [page, setPage] = useState(0)
  const [data, setData] = useState<Page<ProntuarioListagem> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { register, reset, handleSubmit, formState } = useForm<FormData>()

  async function load(currentPage = page) {
    setLoading(true)
    setError(null)
    try {
      setData(await prontuariosApi.listar(currentPage))
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
      await prontuariosApi.cadastrar({
        consultaId: Number(form.consultaId),
        anamnese: form.anamnese,
        diagnostico: form.diagnostico,
        cid10: form.cid10,
        observacoes: form.observacoes,
      })
      reset()
      await load(0)
      setPage(0)
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  return (
    <div>
      <PageHeader icon={<FileText size={20} />} title="Prontuários" />

      {canWrite && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-border shadow-sm p-6 mb-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="ID da consulta" type="number" min={1} {...register('consultaId', { required: true })} />
            <Input label="CID-10" {...register('cid10')} />
            <Textarea label="Anamnese" {...register('anamnese', { required: true })} />
            <Textarea label="Diagnóstico" {...register('diagnostico', { required: true })} />
            <Textarea label="Observações" className="md:col-span-2" {...register('observacoes')} />
          </div>
          <div className="flex justify-end mt-5">
            <Button type="submit" loading={formState.isSubmitting}>
              <Plus size={16} />
              Criar prontuário
            </Button>
          </div>
        </form>
      )}

      {error && <p className="text-sm text-danger mb-4">{error}</p>}
      {loading && <p className="text-sm text-text-secondary">Carregando prontuários...</p>}

      {!loading && data?.content.length === 0 && <EmptyState title="Nenhum prontuário encontrado" />}

      {!loading && data && data.content.length > 0 && (
        <>
          <Table headers={['Registro', 'Paciente', 'Médico', 'Diagnóstico']}>
            {data.content.map((item) => (
              <tr key={item.id} className="hover:bg-surface-hover transition-colors duration-150">
                <td className="px-4 py-3 font-medium text-text-primary">{formatDateTime(item.dataRegistro)}</td>
                <td className="px-4 py-3 text-text-secondary">{item.nomePaciente}</td>
                <td className="px-4 py-3 text-text-secondary">{item.nomeMedico}</td>
                <td className="px-4 py-3 text-text-secondary">{item.diagnostico}</td>
              </tr>
            ))}
          </Table>
          <Pagination currentPage={data.number} totalPages={data.totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
