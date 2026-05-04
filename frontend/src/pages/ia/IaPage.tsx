import { useState } from 'react'
import { Bot, FileText, History, Stethoscope } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { iaApi } from '@/api/ia'
import { getApiErrorMessage } from '@/utils/apiError'

type Mode = 'pre' | 'laudo' | 'resumo'

interface FormData {
  mode: Mode
  consultaId?: string
  prontuarioId?: string
  pacienteId?: string
  sintomas?: string
  anotacoes?: string
}

const modeIcons: Record<Mode, JSX.Element> = {
  pre: <Stethoscope size={16} />,
  laudo: <FileText size={16} />,
  resumo: <History size={16} />,
}

export function IaPage() {
  const [answer, setAnswer] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { register, watch, handleSubmit, formState } = useForm<FormData>({ defaultValues: { mode: 'pre' } })
  const mode = watch('mode')

  async function onSubmit(form: FormData) {
    setError(null)
    setAnswer(null)
    try {
      if (form.mode === 'pre') {
        const data = await iaApi.preDiagnostico({ consultaId: Number(form.consultaId), sintomas: form.sintomas ?? '' })
        setAnswer(data.resposta)
      }
      if (form.mode === 'laudo') {
        const data = await iaApi.gerarLaudo({ prontuarioId: Number(form.prontuarioId), anotacoes: form.anotacoes ?? '' })
        setAnswer(data.resposta)
      }
      if (form.mode === 'resumo') {
        const data = await iaApi.resumoHistorico(Number(form.pacienteId))
        setAnswer(data.resposta)
      }
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  return (
    <div>
      <PageHeader icon={<Bot size={20} />} title="IA Clínica" />

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-border shadow-sm p-6 mb-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Select label="Recurso" {...register('mode')}>
            <option value="pre">Pré-diagnóstico</option>
            <option value="laudo">Gerar laudo</option>
            <option value="resumo">Resumo histórico</option>
          </Select>

          {mode === 'pre' && (
            <>
              <Input label="ID da consulta" type="number" min={1} {...register('consultaId', { required: true })} />
              <Textarea label="Sintomas" className="md:col-span-2" {...register('sintomas', { required: true })} />
            </>
          )}

          {mode === 'laudo' && (
            <>
              <Input label="ID do prontuário" type="number" min={1} {...register('prontuarioId', { required: true })} />
              <Textarea label="Anotações" className="md:col-span-2" {...register('anotacoes', { required: true })} />
            </>
          )}

          {mode === 'resumo' && (
            <Input label="ID do paciente" type="number" min={1} {...register('pacienteId', { required: true })} />
          )}
        </div>

        <div className="flex justify-end mt-5">
          <Button type="submit" loading={formState.isSubmitting}>
            {modeIcons[mode]}
            Gerar resposta
          </Button>
        </div>
      </form>

      {error && <p className="text-sm text-danger mb-4">{error}</p>}

      {answer && (
        <div className="bg-white rounded-lg border border-border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-3">Resposta</h2>
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{answer}</p>
        </div>
      )}
    </div>
  )
}
