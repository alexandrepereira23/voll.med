import { Badge } from '@/components/Badge';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatters, statusColors, statusLabels } from '@/lib/utils';
import {
  getDashboardStats,
  getTodayAppointments,
  mockDoctors,
  mockPatients,
} from '@/lib/mockData';
import { Calendar, Clock, Users, AlertCircle, Plus } from 'lucide-react';
import { Link } from 'wouter';

const stats = getDashboardStats();
const todayAppointments = getTodayAppointments();

export default function Dashboard() {
  const statCards = [
    {
      title: 'Consultas Hoje',
      value: stats.appointmentsToday,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pacientes Cadastrados',
      value: stats.totalPatients,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Médicos Ativos',
      value: stats.activeDoctors,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Consultas Pendentes',
      value: stats.pendingAppointments,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Bem-vindo ao sistema de gestão clínica Voll.med
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="mt-2 text-3xl font-bold text-foreground">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Link href="/appointments">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Consulta
                </Button>
              </Link>
              <Link href="/patients">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Paciente
                </Button>
              </Link>
              <Link href="/doctors">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Médico
                </Button>
              </Link>
              <Link href="/medical-records">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Ver Prontuários
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Agenda de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayAppointments.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Horário</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Médico</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todayAppointments.map((appointment) => {
                      const patient = mockPatients.find(
                        (p) => p.id === appointment.patientId
                      );
                      const doctor = mockDoctors.find(
                        (d) => d.id === appointment.doctorId
                      );

                      const statusColor = statusColors[appointment.status as keyof typeof statusColors];
                      const statusLabel = statusLabels[appointment.status as keyof typeof statusLabels];
                      const typeLabel = statusLabels[appointment.type as keyof typeof statusLabels];

                      return (
                        <TableRow key={appointment.id}>
                          <TableCell className="font-medium">
                            {appointment.time}
                          </TableCell>
                          <TableCell>{patient?.name}</TableCell>
                          <TableCell>{doctor?.name}</TableCell>
                          <TableCell>
                            <Badge variant="info">{typeLabel}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="default"
                              className={`${statusColor.bg} ${statusColor.text}`}
                            >
                              {statusLabel}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Nenhuma consulta agendada para hoje</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
