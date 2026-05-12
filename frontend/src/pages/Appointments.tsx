import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { SearchInput } from '@/components/SearchInput';
import { Badge } from '@/components/Badge';
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
import { Calendar, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { consultasApi } from '@/api/consultas';
import { medicosApi } from '@/api/medicos';
import { pacientesApi } from '@/api/pacientes';
import { conveniosApi } from '@/api/convenios';
import { useAuth } from '@/hooks/useAuth';
import { canWrite } from '@/lib/rbac';
import { extractApiError } from '@/lib/utils';
import type {
  ConsultaListagem,
  ConsultaAgendamento,
  ConsultaCancelamento,
  MotivoCancelamento,
  Prioridade,
  MedicoListagem,
  PacienteListagem,
  ConvenioListagem,
} from '@/types/api';

const prioridadeLabel: Record<Prioridade, string> = {
  ROTINA: 'Rotina',
  PRIORITARIO: 'Prioritário',
  URGENCIA: 'Urgência',
};

const prioridadeBadge: Record<Prioridade, 'success' | 'warning' | 'error'> = {
  ROTINA: 'success',
  PRIORITARIO: 'warning',
  URGENCIA: 'error',
};

const motivoLabel: Record<MotivoCancelamento, string> = {
  PACIENTE_DESISTIU: 'Paciente desistiu',
  MEDICO_CANCELOU: 'Médico cancelou',
  OUTROS: 'Outros',
};

interface ScheduleForm {
  idPaciente: string
  idMedico: string
  dateInput: string
  timeInput: string
  prioridade: Prioridade | ''
  convenioId: string
}

const emptyScheduleForm = (): ScheduleForm => ({
  idPaciente: '',
  idMedico: '',
  dateInput: '',
  timeInput: '',
  prioridade: '',
  convenioId: '',
});

export default function Appointments() {
  const { user } = useAuth();
  const allowWrite = canWrite(user?.role);

  const [appointments, setAppointments] = useState<ConsultaListagem[]>([]);
  const [doctors, setDoctors] = useState<MedicoListagem[]>([]);
  const [patients, setPatients] = useState<PacienteListagem[]>([]);
  const [convenios, setConvenios] = useState<ConvenioListagem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');

  // Schedule modal
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>(emptyScheduleForm());
  const [scheduling, setScheduling] = useState(false);

  // Cancel modal
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<ConsultaListagem | null>(null);
  const [cancelMotivo, setCancelMotivo] = useState<MotivoCancelamento | ''>('');
  const [cancelling, setCancelling] = useState(false);

  const fetchAll = async (p = page) => {
    setLoading(true);
    try {
      const [appts, docs, pats, convs] = await Promise.all([
        consultasApi.list(p),
        medicosApi.list(0, 100),
        pacientesApi.list(0, 100),
        conveniosApi.listAll(),
      ]);
      setAppointments(appts.content);
      setTotalPages(appts.totalPages);
      setDoctors(docs.content);
      setPatients(pats.content);
      setConvenios(convs);
    } catch {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll(page);
  }, [page]);

  const filteredAppointments = search.trim()
    ? appointments.filter(a =>
        [a.nomePaciente, a.nomeMedico]
          .some(v => v?.toLowerCase().includes(search.toLowerCase()))
      )
    : appointments;

  const handleSchedule = async () => {
    if (!scheduleForm.idPaciente || !scheduleForm.dateInput || !scheduleForm.timeInput) {
      toast.error('Preencha paciente, data e hora');
      return;
    }
    const isoData = `${scheduleForm.dateInput}T${scheduleForm.timeInput}:00`;
    if (new Date(isoData) <= new Date()) {
      toast.error('A data deve ser futura');
      return;
    }
    setScheduling(true);
    try {
      const payload: ConsultaAgendamento = {
        idPaciente: Number(scheduleForm.idPaciente),
        data: isoData,
        ...(scheduleForm.idMedico && scheduleForm.idMedico !== 'none' && { idMedico: Number(scheduleForm.idMedico) }),
        ...(scheduleForm.prioridade && { prioridade: scheduleForm.prioridade }),
        ...(scheduleForm.convenioId && scheduleForm.convenioId !== 'none' && { convenioId: Number(scheduleForm.convenioId) }),
      };
      await consultasApi.schedule(payload);
      toast.success('Consulta agendada com sucesso');
      setIsScheduleOpen(false);
      setScheduleForm(emptyScheduleForm());
      setPage(0);
      fetchAll(0);
    } catch (err: any) {
      toast.error(extractApiError(err, 'Erro ao agendar consulta'));
    } finally {
      setScheduling(false);
    }
  };

  const handleOpenCancel = (apt: ConsultaListagem) => {
    setCancelTarget(apt);
    setCancelMotivo('');
    setIsCancelOpen(true);
  };

  const handleCancel = async () => {
    if (!cancelTarget || !cancelMotivo) {
      toast.error('Selecione o motivo do cancelamento');
      return;
    }
    setCancelling(true);
    try {
      const payload: ConsultaCancelamento = {
        idConsulta: cancelTarget.id,
        motivo: cancelMotivo,
      };
      await consultasApi.cancel(payload);
      toast.success('Consulta cancelada com sucesso');
      setIsCancelOpen(false);
      setCancelTarget(null);
      fetchAll(page);
    } catch (err: any) {
      toast.error(extractApiError(err, 'Erro ao cancelar consulta'));
    } finally {
      setCancelling(false);
    }
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString('pt-BR'),
      time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          icon={Calendar}
          title="Consultas"
          description="Agende e gerencie consultas médicas"
          actionLabel="Nova consulta"
          onAction={allowWrite ? () => { setScheduleForm(emptyScheduleForm()); setIsScheduleOpen(true); } : undefined}
        />

        <Card className="border-border">
          <div className="p-6">
            <SearchInput
              placeholder="Buscar por paciente ou médico..."
              value={search}
              onChange={setSearch}
            />
          </div>
        </Card>

        {loading ? (
          <Card className="border-border p-12 text-center text-muted-foreground">
            Carregando...
          </Card>
        ) : filteredAppointments.length > 0 ? (
          <Card className="border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Tipo</TableHead>
                    {allowWrite && <TableHead>Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((apt) => {
                    const { date, time } = formatDateTime(apt.dataHora);
                    return (
                      <TableRow key={apt.id}>
                        <TableCell className="font-medium">{apt.nomePaciente}</TableCell>
                        <TableCell>{apt.nomeMedico}</TableCell>
                        <TableCell>{date}</TableCell>
                        <TableCell>{time}</TableCell>
                        <TableCell>
                          <Badge variant={prioridadeBadge[apt.prioridade]}>
                            {prioridadeLabel[apt.prioridade]}
                          </Badge>
                        </TableCell>
                        <TableCell>{apt.tipo}</TableCell>
                        {allowWrite && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenCancel(apt)}
                              title="Cancelar consulta"
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
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
            icon={Calendar}
            title="Nenhuma consulta encontrada"
            description={search ? 'Nenhum resultado para a busca.' : 'Agende a primeira consulta para começar.'}
            actionLabel={allowWrite ? 'Nova consulta' : undefined}
            onAction={allowWrite ? () => { setScheduleForm(emptyScheduleForm()); setIsScheduleOpen(true); } : undefined}
          />
        )}
      </div>

      {/* Schedule Modal */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Consulta</DialogTitle>
            <DialogDescription>Preencha os dados para agendar uma consulta</DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-semibold mb-5 text-foreground">Dados da Consulta</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label className="mb-1.5 block" htmlFor="idPaciente">Paciente *</Label>
                  <Select
                    value={scheduleForm.idPaciente}
                    onValueChange={v => setScheduleForm(p => ({ ...p, idPaciente: v }))}
                  >
                    <SelectTrigger id="idPaciente">
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(pat => (
                        <SelectItem key={pat.id} value={String(pat.id)}>
                          {pat.nome} — CPF: {pat.cpf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label className="mb-1.5 block" htmlFor="idMedico">Médico (opcional — se não informado, o sistema escolhe)</Label>
                  <Select
                    value={scheduleForm.idMedico}
                    onValueChange={v => setScheduleForm(p => ({ ...p, idMedico: v }))}
                  >
                    <SelectTrigger id="idMedico">
                      <SelectValue placeholder="Qualquer médico disponível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Qualquer médico disponível</SelectItem>
                      {doctors.map(doc => (
                        <SelectItem key={doc.id} value={String(doc.id)}>
                          {doc.nome} — {doc.especialidade} (CRM {doc.crm})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block" htmlFor="dateInput">Data *</Label>
                  <Input
                    id="dateInput"
                    type="date"
                    value={scheduleForm.dateInput}
                    onChange={e => setScheduleForm(p => ({ ...p, dateInput: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block" htmlFor="timeInput">Hora * (07:00 – 18:30)</Label>
                  <Input
                    id="timeInput"
                    type="time"
                    value={scheduleForm.timeInput}
                    onChange={e => setScheduleForm(p => ({ ...p, timeInput: e.target.value }))}
                    min="07:00"
                    max="18:30"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block" htmlFor="prioridade">Prioridade</Label>
                  <Select
                    value={scheduleForm.prioridade}
                    onValueChange={v => setScheduleForm(p => ({ ...p, prioridade: v as Prioridade }))}
                  >
                    <SelectTrigger id="prioridade">
                      <SelectValue placeholder="Rotina (padrão)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ROTINA">Rotina</SelectItem>
                      <SelectItem value="PRIORITARIO">Prioritário</SelectItem>
                      <SelectItem value="URGENCIA">Urgência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block" htmlFor="convenioId">Convênio</Label>
                  <Select
                    value={scheduleForm.convenioId}
                    onValueChange={v => setScheduleForm(p => ({ ...p, convenioId: v }))}
                  >
                    <SelectTrigger id="convenioId">
                      <SelectValue placeholder="Particular (sem convênio)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Particular</SelectItem>
                      {convenios.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsScheduleOpen(false)} disabled={scheduling}>
                Cancelar
              </Button>
              <Button onClick={handleSchedule} disabled={scheduling}>
                {scheduling ? 'Agendando...' : 'Agendar Consulta'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Modal */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Cancelar Consulta</DialogTitle>
            <DialogDescription>
              {cancelTarget && (
                <>Consulta de <strong>{cancelTarget.nomePaciente}</strong> com <strong>{cancelTarget.nomeMedico}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block" htmlFor="motivo">Motivo do cancelamento *</Label>
              <Select
                value={cancelMotivo}
                onValueChange={v => setCancelMotivo(v as MotivoCancelamento)}
              >
                <SelectTrigger id="motivo">
                  <SelectValue placeholder="Selecione o motivo" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(motivoLabel) as MotivoCancelamento[]).map(m => (
                    <SelectItem key={m} value={m}>
                      {motivoLabel[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button variant="outline" onClick={() => setIsCancelOpen(false)} disabled={cancelling}>
                Voltar
              </Button>
              <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
