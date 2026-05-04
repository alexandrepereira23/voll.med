import { useEffect, useState } from 'react'
import { CreditCard, Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Select } from '@/components/ui/Select'
import { Table } from '@/components/ui/Table'
import { conveniosApi } from '@/api/convenios'
import { useAuth } from '@/hooks/useAuth'
import { getApiErrorMessage } from '@/utils/apiError'
import type { Convenio, TipoConvenio } from '@/types/convenio'
import type { Page } from '@/types/common'

interface FormData {
  nome: string
  codigoANS: string
  tipo: TipoConvenio
}

export function ConveniosPage() {
  const { user } = useAuth()
  const canWrite = user?.role === 'ROLE_FUNCIONARIO' || user?.role === 'ROLE_ADMIN'
  const [page, setPage] = useState(0)
  const [data, setData] = useState<Page<Convenio> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { register, reset, handleSubmit, formState } = useForm<FormData>({ defaultValues: { tipo: 'PLANO' } })

  async function load(currentPage = page) {
    setLoading(true)
    setError(null)
    try {
      setData(await conveniosApi.listar(currentPage))
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
      await conveniosApi.cadastrar(form)
      reset({ tipo: 'PLANO' })
      await load(0)
      setPage(0)
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  return (
    <div>
      <PageHeader icon={<CreditCard size={20} />} title="Convênios" />

      {canWrite && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-border shadow-sm p-6 mb-6">
          <div className="grid gap-4 md:grid-cols-[1fr_160px_180px_auto] md:items-end">
            <Input label="Nome" {...register('nome', { required: true })} />
            <Input label="Código ANS" {...register('codigoANS', { required: true })} />
            <Select label="Tipo" {...register('tipo')}>
              <option value="PLANO">Plano</option>
              <option value="PARTICULAR">Particular</option>
            </Select>
            <Button type="submit" loading={formState.isSubmitting}>
              <Plus size={16} />
              Cadastrar
            </Button>
          </div>
        </form>
      )}

      {error && <p className="text-sm text-danger mb-4">{error}</p>}
      {loading && <p className="text-sm text-text-secondary">Carregando convênios...</p>}

      {!loading && data?.content.length === 0 && <EmptyState title="Nenhum convênio cadastrado" />}

      {!loading && data && data.content.length > 0 && (
        <>
          <Table headers={['Nome', 'Código ANS', 'Tipo']}>
            {data.content.map((item) => (
              <tr key={item.id} className="hover:bg-surface-hover transition-colors duration-150">
                <td className="px-4 py-3 font-medium text-text-primary">{item.nome}</td>
                <td className="px-4 py-3 text-text-secondary">{item.codigoANS}</td>
                <td className="px-4 py-3">
                  <Badge>{item.tipo}</Badge>
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
