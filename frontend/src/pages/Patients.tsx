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
import { formatters, searchInArray, statusLabels } from '@/lib/utils';
import { mockPatients, Patient } from '@/lib/mockData';
import { Users, Edit, Trash2 } from 'lucide-react';

export default function Patients() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<Partial<Patient>>({});

  const filteredPatients = searchInArray(
    mockPatients,
    search,
    ['name', 'cpf', 'email', 'phone']
  );

  const handleOpenModal = (patient?: Patient) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData(patient);
    } else {
      setEditingPatient(null);
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
    setFormData({});
  };

  const handleSave = () => {
    handleCloseModal();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          icon={Users}
          title="Pacientes"
          description="Gerencie os pacientes cadastrados na clínica"
          actionLabel="Novo paciente"
          onAction={() => handleOpenModal()}
        />

        <Card className="border-border">
          <div className="p-6">
            <SearchInput
              placeholder="Buscar por nome ou CPF..."
              value={search}
              onChange={setSearch}
            />
          </div>
        </Card>

        {filteredPatients.length > 0 ? (
          <Card className="border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>{formatters.cpf(patient.cpf)}</TableCell>
                      <TableCell>{formatters.phone(patient.phone)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {patient.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={patient.status === 'active' ? 'success' : 'warning'}
                        >
                          {statusLabels[patient.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(patient)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        ) : (
          <EmptyState
            icon={Users}
            title="Nenhum paciente cadastrado"
            description="Cadastre o primeiro paciente para começar a gerenciar os atendimentos."
            actionLabel="Novo paciente"
            onAction={() => handleOpenModal()}
          />
        )}
      </div>

      {/* Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPatient ? 'Editar Paciente' : 'Novo Paciente'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do paciente abaixo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Personal Data */}
            <div>
              <h3 className="text-sm font-semibold mb-4 text-foreground">
                Dados Pessoais
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="(62) 99999-0000"
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, cpf: e.target.value })
                    }
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-sm font-semibold mb-4 text-foreground">
                Endereço
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    placeholder="74000-000"
                  />
                </div>
                <div>
                  <Label htmlFor="state">UF</Label>
                  <Input
                    id="state"
                    placeholder="GO"
                    maxLength={2}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    placeholder="Goiânia"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="street">Logradouro</Label>
                  <Input
                    id="street"
                    placeholder="Avenida Goiás"
                  />
                </div>
                <div>
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    placeholder="1000"
                  />
                </div>
                <div>
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    placeholder="Centro"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    placeholder="Apto 101"
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
                {editingPatient ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
