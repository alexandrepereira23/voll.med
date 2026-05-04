import { useState } from 'react'
import { ClipboardList, Plus, Search } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Table } from '@/components/ui/Table'
import { Textarea } from '@/components/ui/Textarea'
import { atestadosApi } from '@/api/atestados'
import { useAuth } from '@/hooks/useAuth'
import { formatDateTime } from '@/utils/date'
import { getApiErrorMessage } from '@/utils/apiError'
import type { Atestado } from '@/types/atestado'

interface SearchForm {
  pacienteId: string
}

interface CreateForm {
  prontuarioId: string
  diasAfastamento: string
  cid10?: string
  observacoes?: string
}

export function AtestadosPage() {
  const { user } = useAuth()
  const canWrite = user?.role === 'ROLE_MEDICO'
  const [items, setItems] = useState<Atestado[]>([])
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchForm = useForm<SearchForm>()
  const createForm = useForm<CreateForm>()

  async function onSearch(form: SearchForm) {
    setError(null)
    try {
      const data = await atestadosApi.listarPorPaciente(Number(form.pacienteId))
      setItems(data.content)
      setSearched(true)
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  async function onCreate(form: CreateForm) {
    setError(null)
    try {
      await atestadosApi.cadastrar({
        prontuarioId: Number(form.prontuarioId),
        diasAfastamento: Number(form.diasAfastamento),
        cid10: form.cid10,
        observacoes: form.observacoes,
      })
      createForm.reset()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  return (
    <div>
      <PageHeader icon={<ClipboardList size={20} />} title="Atestados" />

      {canWrite && (
        <form onSubmit={createForm.handleSubmit(onCreate)} className="bg-white rounded-lg border border-border shadow-sm p-6 mb-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="ID do prontuário" type="number" min={1} {...createForm.register('prontuarioId', { required: true })} />
            <Input label="Dias de afastamento" type="number" min={1} {...createForm.register('diasAfastamento', { required: true })} />
            <Input label="CID-10" {...createForm.register('cid10')} />
            <Textarea label="Observações" {...createForm.register('observacoes')} />
          </div>
          <div className="flex justify-end mt-5">
            <Button type="submit" loading={createForm.formState.isSubmitting}>
              <Plus size={16} />
              Emitir atestado
            </Button>
          </div>
        </form>
      )}

      <form onSubmit={searchForm.handleSubmit(onSearch)} className="bg-white rounded-lg border border-border shadow-sm p-6 mb-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <Input label="Buscar por paciente" type="number" min={1} {...searchForm.register('pacienteId', { required: true })} />
          <Button type="submit" variant="secondary" loading={searchForm.formState.isSubmitting}>
            <Search size={16} />
            Buscar
          </Button>
        </div>
      </form>

      {error && <p className="text-sm text-danger mb-4">{error}</p>}
      {searched && items.length === 0 && <EmptyState title="Nenhum atestado encontrado" />}

      {items.length > 0 && (
        <Table headers={['Emissão', 'Prontuário', 'Dias', 'CID-10']}>
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-surface-hover transition-colors duration-150">
              <td className="px-4 py-3 font-medium text-text-primary">{formatDateTime(item.dataEmissao)}</td>
              <td className="px-4 py-3 text-text-secondary">#{item.prontuarioId}</td>
              <td className="px-4 py-3 text-text-secondary">{item.diasAfastamento}</td>
              <td className="px-4 py-3 text-text-secondary">{item.cid10 ?? '-'}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  )
}
