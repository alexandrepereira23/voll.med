import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
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
import { Pill, Plus, Trash2, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { prescricoesApi } from '@/api/prescricoes';
import { prontuariosApi } from '@/api/prontuarios';
import { pacientesApi } from '@/api/pacientes';
import { useAuth } from '@/hooks/useAuth';
import { extractApiError } from '@/lib/utils';
import type {
  PrescricaoListagem, PrescricaoDetalhamento, ProntuarioListagem, PacienteListagem,
  TipoPrescricao, ItemPrescricaoCadastro,
} from '@/types/api';

const tipoLabel: Record<TipoPrescricao, string> = {
  SIMPLES: 'Simples (30 dias)',
  ESPECIAL: 'Especial / Controle (60 dias)',
};

const emptyItem = (): ItemPrescricaoCadastro => ({
  medicamento: '', dosagem: '', posologia: '', duracao: '',
});

export default function Prescriptions() {
  const { user } = useAuth();
  const isMedico = user?.role === 'ROLE_MEDICO';

  // --- seleção ---
  const [patients, setPatients] = useState<PacienteListagem[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedPacienteId, setSelectedPacienteId] = useState('');

  const [prontuarios, setProntuarios] = useState<ProntuarioListagem[]>([]);
  const [loadingProntuarios, setLoadingProntuarios] = useState(false);
  const [selectedProntuarioId, setSelectedProntuarioId] = useState('');

  // --- lista de prescrições ---
  const [prescricoes, setPrescricoes] = useState<PrescricaoListagem[]>([]);
  const [loadingPresc, setLoadingPresc] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // --- modal detalhe ---
  const [detail, setDetail] = useState<PrescricaoDetalhamento | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleViewDetail = (id: number) => {
    setDetail(null);
    setLoadingDetail(true);
    prescricoesApi.get(id)
      .then(setDetail)
      .catch(() => toast.error('Erro ao carregar prescrição'))
      .finally(() => setLoadingDetail(false));
  };

  // --- modal criar ---
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [tipo, setTipo] = useState<TipoPrescricao>('SIMPLES');
  const [itens, setItens] = useState<ItemPrescricaoCadastro[]>([emptyItem()]);
  const [saving, setSaving] = useState(false);

  // carregar pacientes
  useEffect(() => {
    setLoadingPatients(true);
    pacientesApi.list(0, 200)
      .then(r => setPatients(r.content))
      .catch(() => toast.error('Erro ao carregar pacientes'))
      .finally(() => setLoadingPatients(false));
  }, []);

  // carregar prontuários ao selecionar paciente
  useEffect(() => {
    setSelectedProntuarioId('');
    setProntuarios([]);
    setPrescricoes([]);
    if (!selectedPacienteId) return;
    setLoadingProntuarios(true);
    prontuariosApi.listByPaciente(Number(selectedPacienteId), 0, 50)
      .then(r => setProntuarios(r.content))
      .catch(() => toast.error('Erro ao carregar prontuários'))
      .finally(() => setLoadingProntuarios(false));
  }, [selectedPacienteId]);

  // carregar prescrições ao selecionar prontuário
  const fetchPrescricoes = (p = 0) => {
    if (!selectedProntuarioId) return;
    setLoadingPresc(true);
    prescricoesApi.listByProntuario(Number(selectedProntuarioId), p)
      .then(r => { setPrescricoes(r.content); setTotalPages(r.totalPages); })
      .catch(err => {
        const status = err?.response?.status;
        if (status === 403) toast.error('Acesso negado a este prontuário');
        else toast.error('Erro ao carregar prescrições');
        setPrescricoes([]);
      })
      .finally(() => setLoadingPresc(false));
  };

  useEffect(() => {
    setPage(0);
    fetchPrescricoes(0);
  }, [selectedProntuarioId]);

  // --- itens helpers ---
  const updateItem = (idx: number, field: keyof ItemPrescricaoCadastro, value: string) =>
    setItens(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));

  const removeItem = (idx: number) =>
    setItens(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

  // --- criar prescrição ---
  const handleOpenCreate = () => {
    setTipo('SIMPLES');
    setItens([emptyItem()]);
    setIsCreateOpen(true);
  };

  const handleCreate = async () => {
    const invalid = itens.some(it =>
      !it.medicamento.trim() || !it.dosagem.trim() || !it.posologia.trim() || !it.duracao.trim()
    );
    if (invalid) { toast.error('Preencha todos os campos de cada medicamento'); return; }

    setSaving(true);
    try {
      await prescricoesApi.create({
        prontuarioId: Number(selectedProntuarioId),
        tipo,
        itens,
      });
      toast.success('Prescrição criada com sucesso');
      setIsCreateOpen(false);
      fetchPrescricoes(0);
    } catch (err: any) {
      toast.error(extractApiError(err, 'Erro ao criar prescrição'));
    } finally {
      setSaving(false);
    }
  };

  const selectedPaciente = patients.find(p => String(p.id) === selectedPacienteId);
  const selectedProntuario = prontuarios.find(p => String(p.id) === selectedProntuarioId);

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          icon={Pill}
          title="Prescrições"
          description="Consulte prescrições por paciente e prontuário"
          actionLabel={isMedico && selectedProntuarioId ? 'Nova Prescrição' : undefined}
          onAction={isMedico && selectedProntuarioId ? handleOpenCreate : undefined}
        />

        {/* Filtros */}
        <Card className="border-border">
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">Paciente</Label>
              <Select
                value={selectedPacienteId}
                onValueChange={setSelectedPacienteId}
                disabled={loadingPatients}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingPatients ? 'Carregando...' : 'Selecione o paciente'} />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.nome} — {p.cpf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1.5 block">Prontuário</Label>
              <Select
                value={selectedProntuarioId}
                onValueChange={setSelectedProntuarioId}
                disabled={!selectedPacienteId || loadingProntuarios}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedPacienteId ? 'Selecione o paciente primeiro'
                    : loadingProntuarios ? 'Carregando...'
                    : prontuarios.length === 0 ? 'Nenhum prontuário encontrado'
                    : 'Selecione o prontuário'
                  } />
                </SelectTrigger>
                <SelectContent>
                  {prontuarios.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      #{p.id} — {p.diagnostico} ({formatDate(p.dataRegistro)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Lista */}
        {loadingPresc ? (
          <Card className="border-border p-12 text-center text-muted-foreground">Carregando...</Card>
        ) : selectedProntuarioId && prescricoes.length > 0 ? (
          <Card className="border-border overflow-hidden">
            <div className="px-6 py-3 border-b bg-muted/30">
              <p className="text-sm font-medium">
                Prescrições — {selectedPaciente?.nome} / Prontuário #{selectedProntuario?.id}: {selectedProntuario?.diagnostico}
              </p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data de Emissão</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescricoes.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>#{p.id}</TableCell>
                      <TableCell>{tipoLabel[p.tipo] ?? p.tipo}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.dataEmissao ? formatDate(p.dataEmissao) : '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.dataValidade ? formatDate(p.dataValidade) : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(p.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-6 py-3">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => { setPage(p => p - 1); fetchPrescricoes(page - 1); }}>
                  <ChevronLeft className="h-4 w-4 mr-1" />Anterior
                </Button>
                <span className="text-sm text-muted-foreground">Página {page + 1} de {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => { setPage(p => p + 1); fetchPrescricoes(page + 1); }}>
                  Próxima<ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </Card>
        ) : selectedProntuarioId && !loadingPresc ? (
          <EmptyState
            icon={Pill}
            title="Nenhuma prescrição encontrada"
            description={`Nenhuma prescrição registrada para o prontuário #${selectedProntuarioId}.${isMedico ? ' Use o botão "Nova Prescrição" para criar.' : ''}`}
          />
        ) : !selectedPacienteId ? (
          <EmptyState
            icon={Pill}
            title="Selecione um paciente"
            description="Escolha o paciente e o prontuário para visualizar as prescrições."
          />
        ) : !selectedProntuarioId ? (
          <EmptyState
            icon={Pill}
            title="Selecione um prontuário"
            description="Escolha o prontuário do paciente para visualizar as prescrições."
          />
        ) : null}
      </div>

      {/* Modal detalhe */}
      <Dialog open={!!detail || loadingDetail} onOpenChange={open => { if (!open) { setDetail(null); setLoadingDetail(false); } }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prescrição #{detail?.id}</DialogTitle>
            <DialogDescription>
              {detail ? `${tipoLabel[detail.tipo]} — Emitida em ${formatDate(detail.dataEmissao)}${detail.dataValidade ? ` · Válida até ${formatDate(detail.dataValidade)}` : ''}` : 'Carregando...'}
            </DialogDescription>
          </DialogHeader>

          {loadingDetail && !detail ? (
            <div className="py-8 text-center text-muted-foreground">Carregando...</div>
          ) : detail ? (
            <div className="space-y-3">
              {detail.itens.map((item, idx) => (
                <div key={item.id} className="rounded-md border border-border p-4 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Medicamento {idx + 1}
                  </p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    <div><span className="text-muted-foreground">Medicamento:</span> <span className="font-medium">{item.medicamento}</span></div>
                    <div><span className="text-muted-foreground">Dosagem:</span> <span className="font-medium">{item.dosagem}</span></div>
                    <div><span className="text-muted-foreground">Posologia:</span> <span className="font-medium">{item.posologia}</span></div>
                    <div><span className="text-muted-foreground">Duração:</span> <span className="font-medium">{item.duracao}</span></div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Modal criar prescrição */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Prescrição</DialogTitle>
            <DialogDescription>
              Prontuário #{selectedProntuarioId} — {selectedProntuario?.diagnostico}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Tipo */}
            <div>
              <Label className="mb-1.5 block">Tipo de receita *</Label>
              <Select value={tipo} onValueChange={v => setTipo(v as TipoPrescricao)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SIMPLES">Simples (validade 30 dias)</SelectItem>
                  <SelectItem value="ESPECIAL">Especial / Controle (validade 60 dias)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Itens */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Medicamentos *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setItens(prev => [...prev, emptyItem()])}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />Adicionar
                </Button>
              </div>

              <div className="space-y-4">
                {itens.map((item, idx) => (
                  <div key={idx} className="rounded-md border border-border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Medicamento {idx + 1}
                      </span>
                      {itens.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          onClick={() => removeItem(idx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="mb-1 block text-xs">Medicamento *</Label>
                        <Input
                          value={item.medicamento}
                          onChange={e => updateItem(idx, 'medicamento', e.target.value)}
                          placeholder="Ex: Amoxicilina"
                        />
                      </div>
                      <div>
                        <Label className="mb-1 block text-xs">Dosagem *</Label>
                        <Input
                          value={item.dosagem}
                          onChange={e => updateItem(idx, 'dosagem', e.target.value)}
                          placeholder="Ex: 500mg"
                        />
                      </div>
                      <div>
                        <Label className="mb-1 block text-xs">Posologia *</Label>
                        <Input
                          value={item.posologia}
                          onChange={e => updateItem(idx, 'posologia', e.target.value)}
                          placeholder="Ex: 1 cápsula a cada 8h"
                        />
                      </div>
                      <div>
                        <Label className="mb-1 block text-xs">Duração *</Label>
                        <Input
                          value={item.duracao}
                          onChange={e => updateItem(idx, 'duracao', e.target.value)}
                          placeholder="Ex: 7 dias"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? 'Salvando...' : 'Criar Prescrição'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
