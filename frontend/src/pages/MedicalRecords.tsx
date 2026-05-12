import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { SearchInput } from '@/components/SearchInput';
import { EmptyState } from '@/components/EmptyState';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { prontuariosApi } from '@/api/prontuarios';
import { consultasApi } from '@/api/consultas';
import { useAuth } from '@/hooks/useAuth';
import { extractApiError } from '@/lib/utils';
import type { ProntuarioListagem, ConsultaListagem } from '@/types/api';

export default function MedicalRecords() {
  const { user } = useAuth();
  const isMedico = user?.role === 'ROLE_MEDICO';

  const [records, setRecords] = useState<ProntuarioListagem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [consultas, setConsultas] = useState<ConsultaListagem[]>([]);
  const [createForm, setCreateForm] = useState({
    consultaId: '', anamnese: '', diagnostico: '', cid10: '', observacoes: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchRecords = (p = 0) => {
    setLoading(true);
    prontuariosApi.list(p)
      .then(r => { setRecords(r.content); setTotalPages(r.totalPages); })
      .catch(() => toast.error('Erro ao carregar prontuários'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRecords(page); }, [page]);

  const handleOpenCreate = async () => {
    setCreateForm({ consultaId: '', anamnese: '', diagnostico: '', cid10: '', observacoes: '' });
    setIsCreateOpen(true);
    if (consultas.length === 0) {
      try {
        const r = await consultasApi.list(0, 100);
        setConsultas(r.content);
      } catch {
        toast.error('Erro ao carregar consultas');
      }
    }
  };

  const handleCreate = async () => {
    if (!createForm.consultaId || !createForm.anamnese.trim() || !createForm.diagnostico.trim()) {
      toast.error('Preencha consulta, anamnese e diagnóstico');
      return;
    }
    setSaving(true);
    try {
      await prontuariosApi.create({
        consultaId: Number(createForm.consultaId),
        anamnese: createForm.anamnese,
        diagnostico: createForm.diagnostico,
        ...(createForm.cid10 && { cid10: createForm.cid10 }),
        ...(createForm.observacoes && { observacoes: createForm.observacoes }),
      });
      toast.success('Prontuário criado com sucesso');
      setIsCreateOpen(false);
      setPage(0);
      fetchRecords(0);
    } catch (err: any) {
      toast.error(extractApiError(err, 'Erro ao criar prontuário'));
    } finally {
      setSaving(false);
    }
  };

  const filtered = search.trim()
    ? records.filter(r =>
        [r.nomePaciente, r.diagnostico]
          .some(v => v?.toLowerCase().includes(search.toLowerCase()))
      )
    : records;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

  const formatConsulta = (c: ConsultaListagem) =>
    `${c.nomePaciente} — ${new Date(c.dataHora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}`;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          icon={FileText}
          title="Prontuários"
          description="Consulte e acompanhe o histórico clínico dos pacientes"
          actionLabel={isMedico ? 'Novo Prontuário' : undefined}
          onAction={isMedico ? handleOpenCreate : undefined}
        />

        <Card className="border-border">
          <div className="p-6">
            <SearchInput
              placeholder="Buscar por paciente ou diagnóstico..."
              value={search}
              onChange={setSearch}
            />
          </div>
        </Card>

        {loading ? (
          <Card className="border-border p-12 text-center text-muted-foreground">Carregando...</Card>
        ) : filtered.length > 0 ? (
          <Card className="border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Diagnóstico</TableHead>
                    <TableHead>Data do Registro</TableHead>
                    <TableHead>Consulta #</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(record => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.nomePaciente}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {record.diagnostico}
                      </TableCell>
                      <TableCell>{formatDate(record.dataRegistro)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">#{record.consultaId}</TableCell>
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
            icon={FileText}
            title="Nenhum prontuário encontrado"
            description={search ? 'Nenhum resultado para a busca.' : 'Prontuários são criados pelos médicos ao registrar uma consulta.'}
          />
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Prontuário</DialogTitle>
            <DialogDescription>Registre o prontuário da consulta realizada</DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <Label className="mb-1.5 block" htmlFor="consultaId">Consulta *</Label>
              <Select
                value={createForm.consultaId}
                onValueChange={v => setCreateForm(p => ({ ...p, consultaId: v }))}
              >
                <SelectTrigger id="consultaId">
                  <SelectValue placeholder="Selecione a consulta" />
                </SelectTrigger>
                <SelectContent>
                  {consultas.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {formatConsulta(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1.5 block" htmlFor="diagnostico">Diagnóstico *</Label>
              <Input
                id="diagnostico"
                value={createForm.diagnostico}
                onChange={e => setCreateForm(p => ({ ...p, diagnostico: e.target.value }))}
                placeholder="Ex: Sinusite aguda"
              />
            </div>

            <div>
              <Label className="mb-1.5 block" htmlFor="cid10">CID-10</Label>
              <Input
                id="cid10"
                value={createForm.cid10}
                onChange={e => setCreateForm(p => ({ ...p, cid10: e.target.value }))}
                placeholder="Ex: J01.9"
              />
            </div>

            <div>
              <Label className="mb-1.5 block" htmlFor="anamnese">Anamnese *</Label>
              <textarea
                id="anamnese"
                value={createForm.anamnese}
                onChange={e => setCreateForm(p => ({ ...p, anamnese: e.target.value }))}
                placeholder="Queixa principal e histórico relatado pelo paciente..."
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>

            <div>
              <Label className="mb-1.5 block" htmlFor="observacoes">Observações / Conduta</Label>
              <textarea
                id="observacoes"
                value={createForm.observacoes}
                onChange={e => setCreateForm(p => ({ ...p, observacoes: e.target.value }))}
                placeholder="Recomendações, conduta médica, retorno..."
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={saving}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? 'Salvando...' : 'Criar Prontuário'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
