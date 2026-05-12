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
import { conveniosApi } from '@/api/convenios';
import { useAuth } from '@/hooks/useAuth';
import { canWrite } from '@/lib/rbac';
import { extractApiError } from '@/lib/utils';
import type { ConvenioListagem, ConvenioCadastro, ConvenioAtualizacao } from '@/types/api';

interface FormState {
  nome: string
  codigoAns: string
}

const emptyForm = (): FormState => ({ nome: '', codigoAns: '' });

export default function InsurancePage() {
  const { user } = useAuth();
  const allowWrite = canWrite(user?.role);

  const [convenios, setConvenios] = useState<ConvenioListagem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  const fetchConvenios = async (p = page) => {
    setLoading(true);
    try {
      const result = await conveniosApi.list(p);
      setConvenios(result.content);
      setTotalPages(result.totalPages);
    } catch {
      toast.error('Erro ao carregar convênios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConvenios(page);
  }, [page]);

  const filtered = search.trim()
    ? convenios.filter(c =>
        [c.nome, c.codigoAns]
          .some(v => v?.toLowerCase().includes(search.toLowerCase()))
      )
    : convenios;

  const handleOpenModal = (conv?: ConvenioListagem) => {
    if (conv) {
      setEditingId(conv.id);
      setFormData({ nome: conv.nome, codigoAns: conv.codigoAns ?? '' });
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

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      toast.error('Informe o nome do convênio');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const payload: ConvenioAtualizacao = {
          nome: formData.nome,
          ...(formData.codigoAns && { codigoAns: formData.codigoAns }),
        };
        await conveniosApi.update(editingId, payload);
        toast.success('Convênio atualizado');
      } else {
        const payload: ConvenioCadastro = {
          nome: formData.nome,
          ...(formData.codigoAns && { codigoAns: formData.codigoAns }),
        };
        await conveniosApi.create(payload);
        toast.success('Convênio cadastrado');
      }
      handleCloseModal();
      setPage(0);
      fetchConvenios(0);
    } catch (err: any) {
      toast.error(extractApiError(err, 'Erro ao salvar convênio'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await conveniosApi.remove(id);
      toast.success('Convênio inativado');
      fetchConvenios(page);
    } catch {
      toast.error('Erro ao inativar convênio');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          icon={Settings}
          title="Convênios"
          description="Gerencie convênios e planos aceitos pela clínica"
          actionLabel="Novo convênio"
          onAction={allowWrite ? () => handleOpenModal() : undefined}
        />

        <Card className="border-border">
          <div className="p-6">
            <SearchInput
              placeholder="Buscar por nome ou código ANS..."
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
                    <TableHead>Código ANS</TableHead>
                    {allowWrite && <TableHead>Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(conv => (
                    <TableRow key={conv.id}>
                      <TableCell className="font-medium">{conv.nome}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {conv.codigoAns ?? '—'}
                      </TableCell>
                      {allowWrite && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(conv)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(conv.id)}>
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
            title="Nenhum convênio encontrado"
            description={search ? 'Nenhum resultado para a busca.' : 'Cadastre o primeiro convênio para começar.'}
            actionLabel={allowWrite ? 'Novo convênio' : undefined}
            onAction={allowWrite ? () => handleOpenModal() : undefined}
          />
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Convênio' : 'Novo Convênio'}</DialogTitle>
            <DialogDescription>Preencha os dados do convênio abaixo</DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <Label className="mb-1.5 block" htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={e => setFormData(p => ({ ...p, nome: e.target.value }))}
                placeholder="Ex: Unimed"
              />
            </div>
            <div>
              <Label className="mb-1.5 block" htmlFor="codigoAns">Código ANS</Label>
              <Input
                id="codigoAns"
                value={formData.codigoAns}
                onChange={e => setFormData(p => ({ ...p, codigoAns: e.target.value }))}
                placeholder="Ex: 34028-1"
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
