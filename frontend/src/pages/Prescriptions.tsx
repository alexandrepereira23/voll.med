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
import { mockPrescriptions, mockPatients, mockDoctors } from '@/lib/mockData';
import { formatters, statusLabels } from '@/lib/utils';
import { Pill, Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function Prescriptions() {
  const [search, setSearch] = useState('');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          icon={Pill}
          title="Prescrições"
          description="Gerencie prescrições médicas vinculadas aos prontuários"
          actionLabel="Nova prescrição"
          onAction={() => {}}
        />

        <Card className="border-border">
          <div className="p-6">
            <SearchInput
              placeholder="Buscar por paciente, prontuário ou medicamento..."
              value={search}
              onChange={setSearch}
            />
          </div>
        </Card>

        {mockPrescriptions.length > 0 ? (
          <Card className="border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Medicamentos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPrescriptions.map((prescription) => {
                    const patient = mockPatients.find(
                      (p) => p.id === prescription.patientId
                    );
                    const doctor = mockDoctors.find(
                      (d) => d.id === prescription.doctorId
                    );

                    return (
                      <TableRow key={prescription.id}>
                        <TableCell className="font-medium">
                          {patient?.name}
                        </TableCell>
                        <TableCell>{doctor?.name}</TableCell>
                        <TableCell>{formatters.date(prescription.date)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {prescription.medications.length} medicamento(s)
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              prescription.status === 'active' ? 'success' : 'warning'
                            }
                          >
                            {statusLabels[prescription.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
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
            icon={Pill}
            title="Nenhuma prescrição cadastrada"
            description="As prescrições serão criadas ao registrar medicamentos para os pacientes."
            actionLabel="Nova prescrição"
            onAction={() => {}}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
