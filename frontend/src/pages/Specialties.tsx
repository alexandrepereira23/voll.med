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
import { Settings, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { especialidadesApi } from '@/api/especialidades';
import { useAuth } from '@/hooks/useAuth';
import { canWrite } from '@/lib/rbac';
import { extractApiError } from '@/lib/utils';
import type { EspecialidadeListagem } from '@/types/api';

export default function Specialties() {
  const { user } = useAuth();
  const allowWrite = canWrite(user?.role);

  const [specialties, setSpecialties] = useState<EspecialidadeListagem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchSpecialties = async (p = page) => {
    setLoading(true);
    try {
      const result = await especialidadesApi.list(p, 20);
      setSpecialties(result.content);
      setTotalPages(result.totalPages);
    } catch {
      toast.error('Erro ao carregar especialidades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialties(page);
  }, [page]);

  const filtered = search.trim()
    ? specialties.filter(s => s.nome.toLowerCase().includes(search.toLowerCase()))
    : specialties;

  const handleOpenModal = (spec?: EspecialidadeListagem) => {
    if (spec) {
      setEditingId(spec.id);
      setNome(spec.nome);
    } else {
      setEditingId(null);
      setNome('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setNome('');
  };

  const handleSave = async () => {
    if (!nome.trim()) {
      toast.error('Informe o nome da especialidade');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await especialidadesApi.update(editingId, { nome });
        toast.success('Especialidade atualizada');
      } else {
        await especialidadesApi.create({ nome });
        toast.success('Especialidade cadastrada');
      }
      handleCloseModal();
      setPage(0);
      fetchSpecialties(0);
    } catch (err: any) {
      toast.error(extractApiError(err, 'Erro ao salvar especialidade'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await especialidadesApi.remove(id);
      toast.success('Especialidade inativada');
      fetchSpecialties(page);
    } catch {
      toast.error('Erro ao inativar especialidade');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          icon={Settings}
          title="Especialidades"
          description="Gerencie as especialidades médicas disponíveis na clínica"
          actionLabel="Nova especialidade"
          onAction={allowWrite ? () => handleOpenModal() : undefined}
        />

        <Card className="border-border">
          <div className="p-6">
            <SearchInput
              placeholder="Buscar por nome..."
              value={search}
              onChange={setSearch}
            />
          </div>
        </Card>

        {loading ? (
          <Card className="border-border p-12 text-center text-muted-foreground">
            Carregando...
          </Card>
        ) : filtered.length > 0 ? (
          <Card className="border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    {allowWrite && <TableHead>Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(spec => (
                    <TableRow key={spec.id}>
                      <TableCell className="font-medium">{spec.nome}</TableCell>
                      {allowWrite && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(spec)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(spec.id)}>
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
            icon={Settings}
            title="Nenhuma especialidade encontrada"
            description={search ? 'Nenhum resultado para a busca.' : 'Cadastre a primeira especialidade para começar.'}
            actionLabel={allowWrite ? 'Nova especialidade' : undefined}
            onAction={allowWrite ? () => handleOpenModal() : undefined}
          />
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Especialidade' : 'Nova Especialidade'}</DialogTitle>
            <DialogDescription>Preencha os dados da especialidade abaixo</DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <Label className="mb-1.5 block" htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Ex: Cardiologia"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button variant="outline" onClick={handleCloseModal} disabled={saving}>Cancelar</Button>
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
