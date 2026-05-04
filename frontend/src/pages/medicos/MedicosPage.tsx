import { useEffect, useState } from 'react'
import { Plus, Stethoscope, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Select } from '@/components/ui/Select'
import { Table } from '@/components/ui/Table'
import { especialidadesApi } from '@/api/especialidades'
import { medicosApi } from '@/api/medicos'
import { useAuth } from '@/hooks/useAuth'
import { getApiErrorMessage } from '@/utils/apiError'
import type { Page } from '@/types/common'
import type { Especialidade } from '@/types/especialidade'
import type { MedicoListagem } from '@/types/medico'

interface FormData {
  nome: string
  email: string
  telefone: string
  crm: string
  especialidadeId: string
  logradouro: string
  bairro: string
  cep: string
  cidade: string
  uf: string
  numero?: string
  complemento?: string
}

export function MedicosPage() {
  const { user } = useAuth()
  const canWrite = user?.role === 'ROLE_FUNCIONARIO'
  const [page, setPage] = useState(0)
  const [data, setData] = useState<Page<MedicoListagem> | null>(null)
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { register, reset, handleSubmit, formState } = useForm<FormData>()

  async function load(currentPage = page) {
    setLoading(true)
    setError(null)
    try {
      const [medicosPage, especialidadesPage] = await Promise.all([
        medicosApi.listar(currentPage),
        especialidadesApi.listar(0, 100),
      ])
      setData(medicosPage)
      setEspecialidades(especialidadesPage.content)
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
      await medicosApi.cadastrar({
        nome: form.nome,
        email: form.email,
        telefone: form.telefone,
        crm: form.crm,
        especialidadeId: Number(form.especialidadeId),
        endereco: {
          logradouro: form.logradouro,
          bairro: form.bairro,
          cep: form.cep,
          cidade: form.cidade,
          uf: form.uf,
          numero: form.numero,
          complemento: form.complemento,
        },
      })
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
      await medicosApi.excluir(id)
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  return (
    <div>
      <PageHeader icon={<Stethoscope size={20} />} title="Médicos" />

      {canWrite && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-border shadow-sm p-6 mb-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Nome" {...register('nome', { required: true })} />
            <Input label="E-mail" type="email" {...register('email', { required: true })} />
            <Input label="Telefone" {...register('telefone', { required: true })} />
            <Input label="CRM" {...register('crm', { required: true })} />
            <Select label="Especialidade" {...register('especialidadeId', { required: true })}>
              <option value="">Selecione</option>
              {especialidades.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </Select>
            <Input label="CEP" {...register('cep', { required: true })} />
            <Input label="Logradouro" {...register('logradouro', { required: true })} />
            <Input label="Bairro" {...register('bairro', { required: true })} />
            <Input label="Cidade" {...register('cidade', { required: true })} />
            <Input label="UF" maxLength={2} {...register('uf', { required: true })} />
            <Input label="Número" {...register('numero')} />
            <Input label="Complemento" {...register('complemento')} />
          </div>
          <div className="flex justify-end mt-5">
            <Button type="submit" loading={formState.isSubmitting}>
              <Plus size={16} />
              Cadastrar médico
            </Button>
          </div>
        </form>
      )}

      {error && <p className="text-sm text-danger mb-4">{error}</p>}
      {loading && <p className="text-sm text-text-secondary">Carregando médicos...</p>}

      {!loading && data?.content.length === 0 && <EmptyState title="Nenhum médico cadastrado" />}

      {!loading && data && data.content.length > 0 && (
        <>
          <Table headers={['Nome', 'E-mail', 'CRM', 'Especialidade', '']}>
            {data.content.map((item) => (
              <tr key={item.id} className="hover:bg-surface-hover transition-colors duration-150">
                <td className="px-4 py-3 font-medium text-text-primary">{item.nome}</td>
                <td className="px-4 py-3 text-text-secondary">{item.email}</td>
                <td className="px-4 py-3 text-text-secondary">{item.crm}</td>
                <td className="px-4 py-3 text-text-secondary">{item.especialidade}</td>
                <td className="px-4 py-3 text-right">
                  {canWrite && (
                    <button type="button" onClick={() => void onDelete(item.id)} className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10" title="Inativar">
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
