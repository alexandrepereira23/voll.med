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
import { mockDoctors, mockSpecialties, Doctor } from '@/lib/mockData';
import { Users, Edit, Trash2, Eye } from 'lucide-react';

export default function Doctors() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState<Partial<Doctor>>({});

  const filteredDoctors = searchInArray(
    mockDoctors,
    search,
    ['name', 'crm', 'specialty', 'email', 'phone']
  );

  const handleOpenModal = (doctor?: Doctor) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData(doctor);
    } else {
      setEditingDoctor(null);
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDoctor(null);
    setFormData({});
  };

  const handleSave = () => {
    // Mock save - in real app would call API
    handleCloseModal();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          icon={Users}
          title="Médicos"
          description="Gerencie os médicos cadastrados na clínica"
          actionLabel="Novo médico"
          onAction={() => handleOpenModal()}
        />

        <Card className="border-border">
          <div className="p-6">
            <SearchInput
              placeholder="Buscar por nome, CRM ou especialidade..."
              value={search}
              onChange={setSearch}
            />
          </div>
        </Card>

        {filteredDoctors.length > 0 ? (
          <Card className="border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead>CRM</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDoctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">{doctor.name}</TableCell>
                      <TableCell>{doctor.specialty}</TableCell>
                      <TableCell>{doctor.crm}</TableCell>
                      <TableCell>{formatters.phone(doctor.phone)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {doctor.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={doctor.status === 'active' ? 'success' : 'warning'}
                        >
                          {statusLabels[doctor.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(doctor)}
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
            title="Nenhum médico cadastrado"
            description="Cadastre o primeiro médico para começar a gerenciar os atendimentos."
            actionLabel="Novo médico"
            onAction={() => handleOpenModal()}
          />
        )}
      </div>

      {/* Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDoctor ? 'Editar Médico' : 'Novo Médico'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do médico abaixo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Professional Data */}
            <div>
              <h3 className="text-sm font-semibold mb-4 text-foreground">
                Dados Profissionais
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
                  <Label htmlFor="crm">CRM</Label>
                  <Input
                    id="crm"
                    value={formData.crm || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, crm: e.target.value })
                    }
                    placeholder="12345/GO"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Select
                    value={formData.specialty || ''}
                    onValueChange={(value) =>
                      setFormData({ ...formData, specialty: value })
                    }
                  >
                    <SelectTrigger id="specialty">
                      <SelectValue placeholder="Selecione uma especialidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockSpecialties.map((spec) => (
                        <SelectItem key={spec.id} value={spec.name}>
                          {spec.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    value={formData.address?.zipCode || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address,
                          zipCode: e.target.value,
                        },
                      })
                    }
                    placeholder="74000-000"
                  />
                </div>
                <div>
                  <Label htmlFor="state">UF</Label>
                  <Input
                    id="state"
                    value={formData.address?.state || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address,
                          state: e.target.value,
                        },
                      })
                    }
                    placeholder="GO"
                    maxLength={2}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.address?.city || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address,
                          city: e.target.value,
                        },
                      })
                    }
                    placeholder="Goiânia"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="street">Logradouro</Label>
                  <Input
                    id="street"
                    value={formData.address?.street || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address,
                          street: e.target.value,
                        },
                      })
                    }
                    placeholder="Avenida Goiás"
                  />
                </div>
                <div>
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={formData.address?.number || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address,
                          number: e.target.value,
                        },
                      })
                    }
                    placeholder="1000"
                  />
                </div>
                <div>
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={formData.address?.neighborhood || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address,
                          neighborhood: e.target.value,
                        },
                      })
                    }
                    placeholder="Centro"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    placeholder="Sala 501"
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
                {editingDoctor ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
