import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { disponibilidadeApi } from '@/api/disponibilidade';
import { medicosApi } from '@/api/medicos';
import { useAuth } from '@/hooks/useAuth';
import { canWrite } from '@/lib/rbac';
import { extractApiError } from '@/lib/utils';
import type { DisponibilidadeListagem, DiaSemana, MedicoListagem } from '@/types/api';

const DIA_LABELS: Record<DiaSemana, string> = {
  MONDAY: 'Segunda-feira',
  TUESDAY: 'Terça-feira',
  WEDNESDAY: 'Quarta-feira',
  THURSDAY: 'Quinta-feira',
  FRIDAY: 'Sexta-feira',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
};

const DIAS_SEMANA: DiaSemana[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const DIA_ORDER: Record<DiaSemana, number> = {
  MONDAY: 0, TUESDAY: 1, WEDNESDAY: 2, THURSDAY: 3, FRIDAY: 4, SATURDAY: 5, SUNDAY: 6,
};

export default function Availability() {
  const { user } = useAuth();
  const allowWrite = canWrite(user?.role);

  const [medicos, setMedicos] = useState<MedicoListagem[]>([]);
  const [selectedMedicoId, setSelectedMedicoId] = useState<number | null>(null);
  const [slots, setSlots] = useState<DisponibilidadeListagem[]>([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [diaSemana, setDiaSemana] = useState<DiaSemana>('MONDAY');
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFim, setHoraFim] = useState('18:00');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    medicosApi.list(0, 100)
      .then(r => setMedicos(r.content))
      .catch(() => toast.error('Erro ao carregar médicos'));
  }, []);

  const fetchSlots = (medicoId: number) => {
    setLoading(true);
    disponibilidadeApi.list(medicoId)
      .then(data =>
        setSlots([...data].sort((a, b) => DIA_ORDER[a.diaSemana] - DIA_ORDER[b.diaSemana]))
      )
      .catch(() => toast.error('Erro ao carregar disponibilidade'))
      .finally(() => setLoading(false));
  };

  const handleSelectMedico = (value: string) => {
    const id = Number(value);
    setSelectedMedicoId(id);
    fetchSlots(id);
  };

  const handleOpenModal = () => {
    setDiaSemana('MONDAY');
    setHoraInicio('08:00');
    setHoraFim('18:00');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedMedicoId) return;
    if (horaInicio >= horaFim) {
      toast.error('Hora de início deve ser anterior à hora de fim');
      return;
    }
    setSaving(true);
    try {
      await disponibilidadeApi.create(selectedMedicoId, {
        diaSemana,
        horaInicio: horaInicio + ':00',
        horaFim: horaFim + ':00',
      });
      toast.success('Horário cadastrado');
      setIsModalOpen(false);
      fetchSlots(selectedMedicoId);
    } catch (err: any) {
      toast.error(extractApiError(err, 'Erro ao cadastrar horário'));
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (slotId: number) => {
    if (!selectedMedicoId) return;
    try {
      await disponibilidadeApi.remove(selectedMedicoId, slotId);
      toast.success('Horário removido');
      setSlots(prev => prev.filter(s => s.id !== slotId));
    } catch {
      toast.error('Erro ao remover horário');
    }
  };

  const selectedMedico = medicos.find(m => m.id === selectedMedicoId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          icon={Calendar}
          title="Disponibilidade dos Médicos"
          description="Gerencie os horários de atendimento de cada médico"
          actionLabel={allowWrite && selectedMedicoId ? 'Novo horário' : undefined}
          onAction={allowWrite && selectedMedicoId ? handleOpenModal : undefined}
        />

        <Card className="border-border p-6">
          <div className="max-w-sm">
            <Label className="mb-1.5 block">Selecionar médico</Label>
            <Select
              value={selectedMedicoId?.toString() ?? ''}
              onValueChange={handleSelectMedico}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um médico..." />
              </SelectTrigger>
              <SelectContent>
                {medicos.map(m => (
                  <SelectItem key={m.id} value={m.id.toString()}>
                    {m.nome} — {m.especialidade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {!selectedMedicoId ? (
          <EmptyState
            icon={Calendar}
            title="Selecione um médico"
            description="Escolha um médico acima para visualizar ou gerenciar os horários."
          />
        ) : loading ? (
          <Card className="border-border p-12 text-center text-muted-foreground">
            Carregando...
          </Card>
        ) : slots.length > 0 ? (
          <Card className="border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dia da semana</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Fim</TableHead>
                    {allowWrite && <TableHead>Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.map(slot => (
                    <TableRow key={slot.id}>
                      <TableCell className="font-medium">{DIA_LABELS[slot.diaSemana]}</TableCell>
                      <TableCell>{slot.horaInicio.slice(0, 5)}</TableCell>
                      <TableCell>{slot.horaFim.slice(0, 5)}</TableCell>
                      {allowWrite && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(slot.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        ) : (
          <EmptyState
            icon={Calendar}
            title="Nenhum horário cadastrado"
            description={`${selectedMedico?.nome ?? 'Este médico'} não possui horários de disponibilidade cadastrados.`}
            actionLabel={allowWrite ? 'Novo horário' : undefined}
            onAction={allowWrite ? handleOpenModal : undefined}
          />
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Horário</DialogTitle>
            <DialogDescription>
              Cadastre um horário de disponibilidade para {selectedMedico?.nome}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Dia da semana *</Label>
              <Select value={diaSemana} onValueChange={v => setDiaSemana(v as DiaSemana)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIAS_SEMANA.map(d => (
                    <SelectItem key={d} value={d}>{DIA_LABELS[d]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block" htmlFor="horaInicio">Hora início *</Label>
                <Input
                  id="horaInicio"
                  type="time"
                  value={horaInicio}
                  onChange={e => setHoraInicio(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1.5 block" htmlFor="horaFim">Hora fim *</Label>
                <Input
                  id="horaFim"
                  type="time"
                  value={horaFim}
                  onChange={e => setHoraFim(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Cadastrar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
