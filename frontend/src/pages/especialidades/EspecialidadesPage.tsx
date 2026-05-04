import { useEffect, useState } from 'react'
import { Plus, Star, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Table } from '@/components/ui/Table'
import { especialidadesApi } from '@/api/especialidades'
import { useAuth } from '@/hooks/useAuth'
import { getApiErrorMessage } from '@/utils/apiError'
import type { Especialidade } from '@/types/especialidade'
import type { Page } from '@/types/common'

interface FormData {
  nome: string
}

export function EspecialidadesPage() {
  const { user } = useAuth()
  const canWrite = user?.role === 'ROLE_ADMIN'
  const [page, setPage] = useState(0)
  const [data, setData] = useState<Page<Especialidade> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { register, reset, handleSubmit, formState } = useForm<FormData>()

  async function load(currentPage = page) {
    setLoading(true)
    setError(null)
    try {
      setData(await especialidadesApi.listar(currentPage))
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
      await especialidadesApi.cadastrar({ nome: form.nome.trim() })
      reset()
      await load(0)
      setPage(0)
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  async function onDelete(id: number) {
    setError(null)
    try {
      await especialidadesApi.excluir(id)
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  return (
    <div>
      <PageHeader icon={<Star size={20} />} title="Especialidades" />

      {canWrite && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-border shadow-sm p-6 mb-6">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <Input label="Nova especialidade" placeholder="Ex: Cardiologia" {...register('nome', { required: true })} />
            <Button type="submit" loading={formState.isSubmitting}>
              <Plus size={16} />
              Cadastrar
            </Button>
          </div>
        </form>
      )}

      {error && <p className="text-sm text-danger mb-4">{error}</p>}
      {loading && <p className="text-sm text-text-secondary">Carregando especialidades...</p>}

      {!loading && data?.content.length === 0 && (
        <EmptyState title="Nenhuma especialidade cadastrada" description="Cadastre especialidades para vincular médicos." />
      )}

      {!loading && data && data.content.length > 0 && (
        <>
          <Table headers={['Nome', 'Status', '']}>
            {data.content.map((item) => (
              <tr key={item.id} className="hover:bg-surface-hover transition-colors duration-150">
                <td className="px-4 py-3 font-medium text-text-primary">{item.nome}</td>
                <td className="px-4 py-3 text-text-secondary">{item.ativo === false ? 'Inativa' : 'Ativa'}</td>
                <td className="px-4 py-3 text-right">
                  {canWrite && (
                    <button
                      type="button"
                      onClick={() => void onDelete(item.id)}
                      className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10"
                      title="Inativar"
                    >
                      <Trash2 size={16} />
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
