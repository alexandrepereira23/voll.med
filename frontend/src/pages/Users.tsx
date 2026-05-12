import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserCog, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/api/auth';
import { medicosApi } from '@/api/medicos';
import type { UsuarioDetalhamento } from '@/types/auth';
import type { CadastroUsuarioRole } from '@/types/auth';
import type { MedicoListagem } from '@/types/api';

const roleLabels: Record<string, string> = {
  ROLE_FUNCIONARIO: 'Funcionário',
  ROLE_MEDICO: 'Médico',
  ROLE_AUDITOR: 'Auditor',
  ROLE_GESTOR: 'Gestor',
};

interface FormState {
  login: string
  senha: string
  role: CadastroUsuarioRole | ''
  medicoId: string
}

const emptyForm = (): FormState => ({ login: '', senha: '', role: '', medicoId: '' });

export default function Users() {
  const [users, setUsers] = useState<UsuarioDetalhamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [doctors, setDoctors] = useState<MedicoListagem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  const fetchUsers = async (p = page) => {
    setLoading(true);
    try {
      const result = await authApi.listUsers(p);
      setUsers(result.content);
      setTotalPages(result.totalPages);
    } catch {
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  useEffect(() => {
    if (formData.role === 'ROLE_MEDICO' && doctors.length === 0) {
      medicosApi.list(0, 100).then(r => setDoctors(r.content)).catch(() => {});
    }
  }, [formData.role]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(emptyForm());
  };

  const handleSave = async () => {
    if (!formData.login || !formData.senha || !formData.role) {
      toast.error('Preencha login, senha e perfil');
      return;
    }
    if (formData.role === 'ROLE_MEDICO' && !formData.medicoId) {
      toast.error('Selecione o médico vinculado ao usuário');
      return;
    }
    setSaving(true);
    try {
      await authApi.cadastrarUsuario({
        login: formData.login,
        senha: formData.senha,
        role: formData.role as CadastroUsuarioRole,
        ...(formData.medicoId && { medicoId: Number(formData.medicoId) }),
      });
      toast.success('Usuário cadastrado com sucesso');
      handleCloseModal();
      setPage(0);
      fetchUsers(0);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        toast.error('Login já cadastrado');
      } else if (status === 403) {
        toast.error('Perfil ADMIN não é permitido');
      } else {
        toast.error(err?.response?.data?.mensagem ?? 'Erro ao cadastrar usuário');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          icon={UserCog}
          title="Usuários"
          description="Gerencie os usuários do sistema e seus perfis de acesso"
          actionLabel="Novo usuário"
          onAction={() => { setFormData(emptyForm()); setIsModalOpen(true); }}
        />

        {loading ? (
          <Card className="border-border p-12 text-center text-muted-foreground">
            Carregando...
          </Card>
        ) : users.length > 0 ? (
          <Card className="border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Login</TableHead>
                    <TableHead>Perfil</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.login}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {roleLabels[u.role] ?? u.role}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-6 py-3">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4 mr-1" />Anterior
                </Button>
                <span className="text-sm text-muted-foreground">Página {page + 1} de {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                  Próxima<ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <EmptyState
            icon={UserCog}
            title="Nenhum usuário cadastrado"
            description="Cadastre o primeiro usuário para dar acesso ao sistema."
            actionLabel="Novo usuário"
            onAction={() => { setFormData(emptyForm()); setIsModalOpen(true); }}
          />
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription>Preencha os dados de acesso do novo usuário</DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <Label className="mb-1.5 block" htmlFor="login">Login (e-mail) *</Label>
              <Input
                id="login"
                type="email"
                value={formData.login}
                onChange={e => setFormData(p => ({ ...p, login: e.target.value }))}
                placeholder="usuario@vollmed.com"
              />
            </div>
            <div>
              <Label className="mb-1.5 block" htmlFor="senha">Senha * (mín. 8 caracteres)</Label>
              <Input
                id="senha"
                type="password"
                value={formData.senha}
                onChange={e => setFormData(p => ({ ...p, senha: e.target.value }))}
                placeholder="••••••••"
              />
            </div>
            <div>
              <Label className="mb-1.5 block" htmlFor="role">Perfil *</Label>
              <Select
                value={formData.role}
                onValueChange={v => setFormData(p => ({ ...p, role: v as CadastroUsuarioRole, medicoId: '' }))}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.role === 'ROLE_MEDICO' && (
              <div>
                <Label className="mb-1.5 block" htmlFor="medicoId">Médico vinculado * (deve estar cadastrado primeiro)</Label>
                <Select
                  value={formData.medicoId}
                  onValueChange={v => {
                    const doc = doctors.find(d => String(d.id) === v);
                    setFormData(p => ({ ...p, medicoId: v, login: doc?.email ?? p.login }));
                  }}
                >
                  <SelectTrigger id="medicoId">
                    <SelectValue placeholder="Selecione o médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map(d => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.nome} — {d.especialidade} (CRM {d.crm})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  O médico precisa estar cadastrado em "Médicos" antes de vincular.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button variant="outline" onClick={handleCloseModal} disabled={saving}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
