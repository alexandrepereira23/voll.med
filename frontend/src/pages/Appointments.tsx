import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { formatters, searchInArray, statusLabels } from '@/lib/utils';
import {
  mockAppointments,
  mockPatients,
  mockDoctors,
  mockInsurance,
  Appointment,
} from '@/lib/mockData';
import { Calendar, Edit, Trash2 } from 'lucide-react';

export default function Appointments() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<Partial<Appointment>>({});

  const filteredAppointments = searchInArray(
    mockAppointments,
    search,
    []
  );

  const handleOpenModal = (appointment?: Appointment) => {
    if (appointment) {
      setEditingAppointment(appointment);
      setFormData(appointment);
    } else {
      setEditingAppointment(null);
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAppointment(null);
    setFormData({});
  };

  const handleSave = () => {
    handleCloseModal();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          icon={Calendar}
          title="Consultas"
          description="Agende e gerencie consultas médicas"
          actionLabel="Nova consulta"
          onAction={() => handleOpenModal()}
        />

        <Card className="border-border">
          <div className="p-6">
            <SearchInput
              placeholder="Buscar consultas..."
              value={search}
              onChange={setSearch}
            />
          </div>
        </Card>

        {filteredAppointments.length > 0 ? (
          <Card className="border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => {
                    const patient = mockPatients.find(
                      (p) => p.id === appointment.patientId
                    );
                    const doctor = mockDoctors.find(
                      (d) => d.id === appointment.doctorId
                    );

                    const statusLabel = statusLabels[appointment.status as keyof typeof statusLabels];
                    const typeLabel = statusLabels[appointment.type as keyof typeof statusLabels];
                    const priorityLabel = statusLabels[appointment.priority as keyof typeof statusLabels];

                    return (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p>{patient?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatters.cpf(patient?.cpf || '')}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{doctor?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doctor?.specialty}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{formatters.date(appointment.date)}</TableCell>
                        <TableCell>{appointment.time}</TableCell>
                        <TableCell>
                          <Badge variant="info">{typeLabel}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">{statusLabel}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              appointment.priority === 'high'
                                ? 'error'
                                : appointment.priority === 'medium'
                                ? 'warning'
                                : 'success'
                            }
                          >
                            {priorityLabel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenModal(appointment)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        ) : (
          <EmptyState
            icon={Calendar}
            title="Nenhuma consulta agendada"
            description="Agende a primeira consulta para começar a gerenciar os atendimentos."
            actionLabel="Nova consulta"
            onAction={() => handleOpenModal()}
          />
        )}
      </div>

      {/* Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAppointment ? 'Editar Consulta' : 'Nova Consulta'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados da consulta abaixo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Appointment Data */}
            <div>
              <h3 className="text-sm font-semibold mb-4 text-foreground">
                Dados da Consulta
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="patient">Paciente</Label>
                  <Select
                    value={formData.patientId || ''}
                    onValueChange={(value) =>
                      setFormData({ ...formData, patientId: value })
                    }
                  >
                    <SelectTrigger id="patient">
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name} - CPF: {formatters.cpf(patient.cpf)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="doctor">Médico</Label>
                  <Select
                    value={formData.doctorId || ''}
                    onValueChange={(value) =>
                      setFormData({ ...formData, doctorId: value })
                    }
                  >
                    <SelectTrigger id="doctor">
                      <SelectValue placeholder="Selecione um médico" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockDoctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name} - CRM: {doctor.crm} ({doctor.specialty})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="time">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={formData.type || ''}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        type: value as 'consultation' | 'return' | 'teleconsultation',
                      })
                    }
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consulta</SelectItem>
                      <SelectItem value="return">Retorno</SelectItem>
                      <SelectItem value="teleconsultation">Teleconsulta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={formData.priority || ''}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        priority: value as 'routine' | 'medium' | 'high',
                      })
                    }
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Rotina</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status || ''}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        status: value as 'scheduled' | 'confirmed' | 'cancelled' | 'completed',
                      })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Agendada</SelectItem>
                      <SelectItem value="confirmed">Confirmada</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                      <SelectItem value="completed">Finalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Observações adicionais"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingAppointment ? 'Atualizar' : 'Agendar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
