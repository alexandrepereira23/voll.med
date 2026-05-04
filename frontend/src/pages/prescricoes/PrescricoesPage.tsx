import { useState } from 'react'
import { Pill, Plus, Search } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Table } from '@/components/ui/Table'
import { Textarea } from '@/components/ui/Textarea'
import { prescricoesApi } from '@/api/prescricoes'
import { useAuth } from '@/hooks/useAuth'
import { formatDateTime } from '@/utils/date'
import { getApiErrorMessage } from '@/utils/apiError'
import type { Prescricao, TipoPrescricao } from '@/types/prescricao'

interface SearchForm {
  prontuarioId: string
}

interface CreateForm {
  prontuarioId: string
  tipo: TipoPrescricao
  medicamento: string
  dosagem: string
  posologia: string
  duracao: string
}

export function PrescricoesPage() {
  const { user } = useAuth()
  const canWrite = user?.role === 'ROLE_MEDICO'
  const [items, setItems] = useState<Prescricao[]>([])
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchForm = useForm<SearchForm>()
  const createForm = useForm<CreateForm>({ defaultValues: { tipo: 'SIMPLES' } })

  async function onSearch(form: SearchForm) {
    setError(null)
    try {
      const data = await prescricoesApi.listarPorProntuario(Number(form.prontuarioId))
      setItems(data.content)
      setSearched(true)
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  async function onCreate(form: CreateForm) {
    setError(null)
    try {
      await prescricoesApi.cadastrar({
        prontuarioId: Number(form.prontuarioId),
        tipo: form.tipo,
        itens: [{
          medicamento: form.medicamento,
          dosagem: form.dosagem,
          posologia: form.posologia,
          duracao: form.duracao,
        }],
      })
      createForm.reset({ tipo: 'SIMPLES' })
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  return (
    <div>
      <PageHeader icon={<Pill size={20} />} title="Prescrições" />

      {canWrite && (
        <form onSubmit={createForm.handleSubmit(onCreate)} className="bg-white rounded-lg border border-border shadow-sm p-6 mb-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="ID do prontuário" type="number" min={1} {...createForm.register('prontuarioId', { required: true })} />
            <Select label="Tipo" {...createForm.register('tipo')}>
              <option value="SIMPLES">Simples</option>
              <option value="ESPECIAL">Especial</option>
            </Select>
            <Input label="Medicamento" {...createForm.register('medicamento', { required: true })} />
            <Input label="Dosagem" {...createForm.register('dosagem', { required: true })} />
            <Textarea label="Posologia" {...createForm.register('posologia', { required: true })} />
            <Input label="Duração" {...createForm.register('duracao', { required: true })} />
          </div>
          <div className="flex justify-end mt-5">
            <Button type="submit" loading={createForm.formState.isSubmitting}>
              <Plus size={16} />
              Criar prescrição
            </Button>
          </div>
        </form>
      )}

      <form onSubmit={searchForm.handleSubmit(onSearch)} className="bg-white rounded-lg border border-border shadow-sm p-6 mb-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <Input label="Buscar por prontuário" type="number" min={1} {...searchForm.register('prontuarioId', { required: true })} />
          <Button type="submit" variant="secondary" loading={searchForm.formState.isSubmitting}>
            <Search size={16} />
            Buscar
          </Button>
        </div>
      </form>

      {error && <p className="text-sm text-danger mb-4">{error}</p>}

      {searched && items.length === 0 && <EmptyState title="Nenhuma prescrição encontrada" />}

      {items.length > 0 && (
        <Table headers={['Emissão', 'Validade', 'Tipo', 'Itens']}>
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-surface-hover transition-colors duration-150">
              <td className="px-4 py-3 font-medium text-text-primary">{formatDateTime(item.dataEmissao)}</td>
              <td className="px-4 py-3 text-text-secondary">{formatDateTime(item.dataValidade)}</td>
              <td className="px-4 py-3"><Badge>{item.tipo}</Badge></td>
              <td className="px-4 py-3 text-text-secondary">{item.itens.length}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  )
}
