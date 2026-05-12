import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { atestadosApi } from '@/api/atestados';
import { pacientesApi } from '@/api/pacientes';
import type { AtestadoListagem, PacienteListagem } from '@/types/api';

export default function Certificates() {
  const [patients, setPatients] = useState<PacienteListagem[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [certs, setCerts] = useState<AtestadoListagem[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingCerts, setLoadingCerts] = useState(false);

  useEffect(() => {
    setLoadingPatients(true);
    pacientesApi.list(0, 100)
      .then(r => setPatients(r.content))
      .catch(() => toast.error('Erro ao carregar pacientes'))
      .finally(() => setLoadingPatients(false));
  }, []);

  useEffect(() => {
    if (!selectedId) { setCerts([]); return; }
    setLoadingCerts(true);
    atestadosApi.listByPaciente(Number(selectedId))
      .then(r => setCerts(r.content))
      .catch(() => toast.error('Erro ao carregar atestados'))
      .finally(() => setLoadingCerts(false));
  }, [selectedId]);

  const selectedPatient = patients.find(p => String(p.id) === selectedId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          icon={FileText}
          title="Atestados"
          description="Consulte atestados médicos por paciente"
        />

        <Card className="border-border">
          <div className="p-6">
            <Label htmlFor="paciente" className="mb-2 block">Selecione o paciente</Label>
            <Select
              value={selectedId}
              onValueChange={setSelectedId}
              disabled={loadingPatients}
            >
              <SelectTrigger id="paciente" className="max-w-sm">
                <SelectValue placeholder={loadingPatients ? 'Carregando...' : 'Selecione um paciente'} />
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
        </Card>

        {loadingCerts ? (
          <Card className="border-border p-12 text-center text-muted-foreground">Carregando...</Card>
        ) : selectedId && certs.length > 0 ? (
          <Card className="border-border overflow-hidden">
            <div className="px-6 py-3 border-b bg-muted/30">
              <p className="text-sm font-medium">Atestados de {selectedPatient?.nome}</p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Data de Emissão</TableHead>
                    <TableHead>Dias de Afastamento</TableHead>
                    <TableHead>Prontuário #</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certs.map(cert => (
                    <TableRow key={cert.id}>
                      <TableCell>#{cert.id}</TableCell>
                      <TableCell>
                        {new Date(cert.dataEmissao).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{cert.diasAfastamento}</span>
                        <span className="text-muted-foreground text-sm"> dia{cert.diasAfastamento !== 1 ? 's' : ''}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">#{cert.prontuarioId}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        ) : selectedId && !loadingCerts ? (
          <EmptyState
            icon={FileText}
            title="Nenhum atestado encontrado"
            description={`Nenhum atestado registrado para ${selectedPatient?.nome ?? 'este paciente'}.`}
          />
        ) : (
          <EmptyState
            icon={FileText}
            title="Selecione um paciente"
            description="Escolha um paciente acima para visualizar seus atestados."
          />
        )}
      </div>
    </DashboardLayout>
  );
}
