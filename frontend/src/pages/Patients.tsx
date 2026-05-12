import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { SearchInput } from '@/components/SearchInput';
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
import { Users, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { pacientesApi } from '@/api/pacientes';
import { useAuth } from '@/hooks/useAuth';
import { canWrite } from '@/lib/rbac';
import { extractApiError } from '@/lib/utils';
import type {
  PacienteListagem,
  PacienteDetalhamento,
  PacienteCadastro,
  PacienteAtualizacao,
  EnderecoPayload,
} from '@/types/api';

type FormEndereco = Partial<EnderecoPayload>;

interface FormState {
  nome: string
  email: string
  telefone: string
  cpf: string
  endereco: FormEndereco
}

const emptyForm = (): FormState => ({
  nome: '',
  email: '',
  telefone: '',
  cpf: '',
  endereco: {},
});

export default function Patients() {
  const { user } = useAuth();
  const allowWrite = canWrite(user?.role);

  const [patients, setPatients] = useState<PacienteListagem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  const fetchPatients = async (p = page) => {
    setLoading(true);
    try {
      const result = await pacientesApi.list(p);
      setPatients(result.content);
      setTotalPages(result.totalPages);
    } catch {
      toast.error('Erro ao carregar pacientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(page);
  }, [page]);

  const filteredPatients = search.trim()
    ? patients.filter(p =>
        [p.nome, p.cpf, p.email]
          .some(v => v?.toLowerCase().includes(search.toLowerCase()))
      )
    : patients;

  const handleOpenModal = async (patient?: PacienteListagem) => {
    if (patient) {
      try {
        const detail: PacienteDetalhamento = await pacientesApi.get(patient.id);
        setEditingId(patient.id);
        setFormData({
          nome: detail.nome,
          email: detail.email,
          telefone: detail.telefone,
          cpf: detail.cpf,
          endereco: { ...detail.endereco },
        });
      } catch {
        toast.error('Erro ao carregar dados do paciente');
        return;
      }
    } else {
      setEditingId(null);
      setFormData(emptyForm());
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(emptyForm());
  };

  const setEndereco = (field: keyof EnderecoPayload, value: string) => {
    setFormData(prev => ({ ...prev, endereco: { ...prev.endereco, [field]: value } }));
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.email || !formData.cpf || !formData.telefone) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const payload: PacienteAtualizacao = {
          id: editingId,
          nome: formData.nome,
          telefone: formData.telefone,
          endereco: formData.endereco as EnderecoPayload,
        };
        await pacientesApi.update(payload);
        toast.success('Paciente atualizado com sucesso');
      } else {
        const payload: PacienteCadastro = {
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          cpf: formData.cpf.replace(/\D/g, ''),
          endereco: formData.endereco as EnderecoPayload,
        };
        await pacientesApi.create(payload);
        toast.success('Paciente cadastrado com sucesso');
      }
      handleCloseModal();
      setPage(0);
      fetchPatients(0);
    } catch (err: any) {
      toast.error(extractApiError(err, 'Erro ao salvar paciente'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await pacientesApi.remove(id);
      toast.success('Paciente inativado com sucesso');
      fetchPatients(page);
    } catch {
      toast.error('Erro ao inativar paciente');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          icon={Users}
          title="Pacientes"
          description="Gerencie os pacientes cadastrados na clínica"
          actionLabel="Novo paciente"
          onAction={allowWrite ? () => handleOpenModal() : undefined}
        />

        <Card className="border-border">
          <div className="p-6">
            <SearchInput
              placeholder="Buscar por nome, CPF ou e-mail..."
              value={search}
              onChange={setSearch}
            />
          </div>
        </Card>

        {loading ? (
          <Card className="border-border p-12 text-center text-muted-foreground">
            Carregando...
          </Card>
        ) : filteredPatients.length > 0 ? (
          <Card className="border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>E-mail</TableHead>
                    {allowWrite && <TableHead>Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.nome}</TableCell>
                      <TableCell>{patient.cpf}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{patient.email}</TableCell>
                      {allowWrite && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(patient)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(patient.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-6 py-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page + 1} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <EmptyState
            icon={Users}
            title="Nenhum paciente encontrado"
            description={search ? 'Nenhum resultado para a busca.' : 'Cadastre o primeiro paciente para começar.'}
            actionLabel={allowWrite ? 'Novo paciente' : undefined}
            onAction={allowWrite ? () => handleOpenModal() : undefined}
          />
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Paciente' : 'Novo Paciente'}</DialogTitle>
            <DialogDescription>Preencha os dados do paciente abaixo</DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-semibold mb-5 text-foreground">Dados Pessoais</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block" htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={e => setFormData(p => ({ ...p, nome: e.target.value }))}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block" htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled={!!editingId}
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block" htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={e => setFormData(p => ({ ...p, telefone: e.target.value }))}
                    placeholder="(62) 99999-0000"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block" htmlFor="cpf">CPF * (11 dígitos)</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    disabled={!!editingId}
                    onChange={e => setFormData(p => ({ ...p, cpf: e.target.value }))}
                    placeholder="00000000000"
                    maxLength={14}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-5 text-foreground">Endereço</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block" htmlFor="cep">CEP * (8 dígitos)</Label>
                  <Input
                    id="cep"
                    value={formData.endereco.cep ?? ''}
                    onChange={e => setEndereco('cep', e.target.value)}
                    placeholder="74000000"
                    maxLength={8}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block" htmlFor="uf">UF *</Label>
                  <Input
                    id="uf"
                    value={formData.endereco.uf ?? ''}
                    onChange={e => setEndereco('uf', e.target.value.toUpperCase())}
                    placeholder="GO"
                    maxLength={2}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="mb-1.5 block" htmlFor="cidade">Cidade *</Label>
                  <Input
                    id="cidade"
                    value={formData.endereco.cidade ?? ''}
                    onChange={e => setEndereco('cidade', e.target.value)}
                    placeholder="Goiânia"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="mb-1.5 block" htmlFor="logradouro">Logradouro *</Label>
                  <Input
                    id="logradouro"
                    value={formData.endereco.logradouro ?? ''}
                    onChange={e => setEndereco('logradouro', e.target.value)}
                    placeholder="Avenida Goiás"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block" htmlFor="bairro">Bairro *</Label>
                  <Input
                    id="bairro"
                    value={formData.endereco.bairro ?? ''}
                    onChange={e => setEndereco('bairro', e.target.value)}
                    placeholder="Centro"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block" htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={formData.endereco.numero ?? ''}
                    onChange={e => setEndereco('numero', e.target.value)}
                    placeholder="1000"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="mb-1.5 block" htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={formData.endereco.complemento ?? ''}
                    onChange={e => setEndereco('complemento', e.target.value)}
                    placeholder="Apto 101"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleCloseModal} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : editingId ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
