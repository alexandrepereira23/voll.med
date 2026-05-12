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
import { mockCertificates, mockPatients, mockDoctors } from '@/lib/mockData';
import { formatters } from '@/lib/utils';
import { FileText, Eye, Printer, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function Certificates() {
  const [search, setSearch] = useState('');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          icon={FileText}
          title="Atestados"
          description="Emita e consulte atestados médicos dos pacientes"
          actionLabel="Novo atestado"
          onAction={() => {}}
        />

        <Card className="border-border">
          <div className="p-6">
            <SearchInput
              placeholder="Buscar por paciente, CPF ou médico..."
              value={search}
              onChange={setSearch}
            />
          </div>
        </Card>

        {mockCertificates.length > 0 ? (
          <Card className="border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Data de Emissão</TableHead>
                    <TableHead>Dias de Afastamento</TableHead>
                    <TableHead>CID</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCertificates.map((certificate) => {
                    const patient = mockPatients.find(
                      (p) => p.id === certificate.patientId
                    );
                    const doctor = mockDoctors.find(
                      (d) => d.id === certificate.doctorId
                    );

                    return (
                      <TableRow key={certificate.id}>
                        <TableCell className="font-medium">
                          {patient?.name}
                        </TableCell>
                        <TableCell>{doctor?.name}</TableCell>
                        <TableCell>{formatters.date(certificate.issueDate)}</TableCell>
                        <TableCell>{certificate.daysOff}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {certificate.cid || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Printer className="h-4 w-4" />
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
            icon={FileText}
            title="Nenhum atestado cadastrado"
            description="Os atestados serão criados ao registrar afastamentos para os pacientes."
            actionLabel="Novo atestado"
            onAction={() => {}}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
