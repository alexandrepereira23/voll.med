import { useState, useEffect } from 'react';
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
import { Calendar, Clock, Users, AlertCircle, Plus, Stethoscope } from 'lucide-react';
import { Link } from 'wouter';
import { consultasApi } from '@/api/consultas';
import { medicosApi } from '@/api/medicos';
import { pacientesApi } from '@/api/pacientes';
import { useAuth } from '@/hooks/useAuth';
import { canReadPatients, canReadConsultas } from '@/lib/rbac';
import type { ConsultaListagem, Prioridade } from '@/types/api';

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

interface Stats {
  consultasHoje: number
  totalPacientes: number
  medicoAtivos: number
  totalConsultas: number
}

export default function Dashboard() {
  const { user } = useAuth();
  const showPatientStats = canReadPatients(user?.role);
  const showConsultaStats = canReadConsultas(user?.role);

  const [stats, setStats] = useState<Stats>({ consultasHoje: 0, totalPacientes: 0, medicoAtivos: 0, totalConsultas: 0 });
  const [todayAppointments, setTodayAppointments] = useState<ConsultaListagem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!showConsultaStats) return;
    setLoading(true);

    const requests: Promise<any>[] = [consultasApi.list(0, 50)];
    if (user?.role !== 'ROLE_MEDICO') requests.push(medicosApi.list(0, 1));
    if (showPatientStats) requests.push(pacientesApi.list(0, 1));

    Promise.all(requests)
      .then(([consultas, medicos, pacientes]) => {
        const hoje = new Date().toDateString();
        const todayList = consultas.content.filter(
          (c: ConsultaListagem) => new Date(c.dataHora).toDateString() === hoje
        );
        setTodayAppointments(todayList);
        setStats({
          consultasHoje: todayList.length,
          totalPacientes: pacientes?.totalElements ?? 0,
          medicoAtivos: medicos?.totalElements ?? 0,
          totalConsultas: consultas.totalElements,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const statCards = [
    {
      title: 'Consultas Hoje',
      value: stats.consultasHoje,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      show: showConsultaStats,
    },
    {
      title: 'Pacientes Cadastrados',
      value: stats.totalPacientes,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      show: showPatientStats,
    },
    {
      title: 'Médicos Ativos',
      value: stats.medicoAtivos,
      icon: Stethoscope,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      show: user?.role !== 'ROLE_MEDICO',
    },
    {
      title: 'Total de Consultas',
      value: stats.totalConsultas,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      show: showConsultaStats,
    },
  ].filter(s => s.show);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Bem-vindo ao sistema de gestão clínica Voll.med
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="border-border animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-16 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map(stat => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
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
        )}

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {showConsultaStats && (
                <Link href="/appointments">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Consulta
                  </Button>
                </Link>
              )}
              {showPatientStats && (
                <Link href="/patients">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Paciente
                  </Button>
                </Link>
              )}
              <Link href="/doctors">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Médico
                </Button>
              </Link>
              {showConsultaStats && (
                <Link href="/medical-records">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Ver Prontuários
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {showConsultaStats && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Agenda de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center text-muted-foreground">Carregando...</div>
              ) : todayAppointments.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Horário</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Médico</TableHead>
                        <TableHead>Prioridade</TableHead>
                        <TableHead>Tipo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {todayAppointments.map(apt => (
                        <TableRow key={apt.id}>
                          <TableCell className="font-medium">{formatTime(apt.dataHora)}</TableCell>
                          <TableCell>{apt.nomePaciente}</TableCell>
                          <TableCell>{apt.nomeMedico}</TableCell>
                          <TableCell>
                            <Badge variant={prioridadeBadge[apt.prioridade]}>
                              {prioridadeLabel[apt.prioridade]}
                            </Badge>
                          </TableCell>
                          <TableCell>{apt.tipo}</TableCell>
                        </TableRow>
                      ))}
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
        )}
      </div>
    </DashboardLayout>
  );
}
