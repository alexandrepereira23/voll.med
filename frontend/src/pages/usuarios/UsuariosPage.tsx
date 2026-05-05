import { useState } from 'react'
import type { FormEvent } from 'react'
import { ShieldCheck, UserPlus } from 'lucide-react'
import { authApi } from '@/api/auth'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { CadastroUsuarioPayload, CadastroUsuarioRole, UsuarioDetalhamento } from '@/types/auth'
import { getApiErrorMessage } from '@/utils/apiError'
import { roleLabels } from '@/utils/roles'

const rolesCadastro: CadastroUsuarioRole[] = [
  'ROLE_FUNCIONARIO',
  'ROLE_MEDICO',
  'ROLE_AUDITOR',
  'ROLE_GESTOR',
]

const initialForm: CadastroUsuarioPayload = {
  login: '',
  senha: '',
  role: 'ROLE_FUNCIONARIO',
}

export function UsuariosPage() {
  const [form, setForm] = useState<CadastroUsuarioPayload>(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<UsuarioDetalhamento | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setCreated(null)

    try {
      const usuario = await authApi.cadastrarUsuario(form)
      setCreated(usuario)
      setForm(initialForm)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader icon={<ShieldCheck size={28} />} title="Usuários" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,520px)_1fr]">
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Novo acesso</h2>
            <p className="text-sm text-text-muted mt-1">
              Cadastre usuários operacionais sem conceder acesso administrativo técnico.
            </p>
          </div>

          {error && (
            <div className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          {created && (
            <div className="rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
              Usuário {created.login} cadastrado como {roleLabels[created.role]}.
            </div>
          )}

          <Input
            label="Login"
            type="email"
            value={form.login}
            onChange={(event) => setForm((current) => ({ ...current, login: event.target.value }))}
            placeholder="usuario@voll.med"
            required
          />

          <Input
            label="Senha"
            type="password"
            value={form.senha}
            onChange={(event) => setForm((current) => ({ ...current, senha: event.target.value }))}
            minLength={8}
            maxLength={128}
            required
          />

          <Select
            label="Perfil"
            value={form.role}
            onChange={(event) =>
              setForm((current) => ({ ...current, role: event.target.value as CadastroUsuarioRole }))
            }
          >
            {rolesCadastro.map((role) => (
              <option key={role} value={role}>
                {roleLabels[role]}
              </option>
            ))}
          </Select>

          <Button type="submit" loading={loading}>
            <UserPlus size={16} />
            Cadastrar usuário
          </Button>
        </form>

        <section className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-text-primary">Perfis permitidos</h2>
          <div className="mt-4 grid gap-3">
            {rolesCadastro.map((role) => (
              <div key={role} className="rounded-md border border-border px-4 py-3">
                <p className="font-medium text-text-primary">{roleLabels[role]}</p>
                <p className="text-sm text-text-muted mt-1">{role}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
