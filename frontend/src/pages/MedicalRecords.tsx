import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { SearchInput } from '@/components/SearchInput';
import { EmptyState } from '@/components/EmptyState';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/Badge';
import { mockMedicalRecords, mockPatients, mockDoctors } from '@/lib/mockData';
import { formatters, statusLabels } from '@/lib/utils';
import { FileText, Eye, Edit } from 'lucide-react';
import { useState } from 'react';

export default function MedicalRecords() {
  const [search, setSearch] = useState('');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          icon={FileText}
          title="Prontuários"
          description="Consulte e acompanhe o histórico clínico dos pacientes"
        />

        <Card className="border-border">
          <div className="p-6">
            <SearchInput
              placeholder="Buscar prontuário por paciente, CPF ou médico..."
              value={search}
              onChange={setSearch}
            />
          </div>
        </Card>

        {mockMedicalRecords.length > 0 ? (
          <Card className="border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Última Consulta</TableHead>
                    <TableHead>Diagnóstico</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockMedicalRecords.map((record) => {
                    const patient = mockPatients.find((p) => p.id === record.patientId);
                    const doctor = mockDoctors.find((d) => d.id === record.doctorId);

                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p>{patient?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatters.cpf(patient?.cpf || '')}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{doctor?.name}</TableCell>
                        <TableCell>{formatters.date(record.lastConsultation)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {record.diagnosis || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={record.status === 'open' ? 'info' : 'default'}
                          >
                            {statusLabels[record.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
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
            icon={FileText}
            title="Nenhum prontuário cadastrado"
            description="Os prontuários serão criados automaticamente ao registrar consultas."
          />
        )}
      </div>
    </DashboardLayout>
  );
}
