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
import { searchInArray, statusLabels } from '@/lib/utils';
import { mockSpecialties, Specialty } from '@/lib/mockData';
import { Settings, Edit, Trash2 } from 'lucide-react';

export default function Specialties() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [formData, setFormData] = useState<Partial<Specialty>>({});

  const filteredSpecialties = searchInArray(
    mockSpecialties,
    search,
    ['name']
  );

  const handleOpenModal = (specialty?: Specialty) => {
    if (specialty) {
      setEditingSpecialty(specialty);
      setFormData(specialty);
    } else {
      setEditingSpecialty(null);
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSpecialty(null);
    setFormData({});
  };

  const handleSave = () => {
    handleCloseModal();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          icon={Settings}
          title="Especialidades"
          description="Gerencie as especialidades médicas disponíveis na clínica"
          actionLabel="Nova especialidade"
          onAction={() => handleOpenModal()}
        />

        <Card className="border-border">
          <div className="p-6">
            <SearchInput
              placeholder="Buscar por nome..."
              value={search}
              onChange={setSearch}
            />
          </div>
        </Card>

        {filteredSpecialties.length > 0 ? (
          <Card className="border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSpecialties.map((specialty) => (
                    <TableRow key={specialty.id}>
                      <TableCell className="font-medium">{specialty.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={specialty.status === 'active' ? 'success' : 'warning'}
                        >
                          {statusLabels[specialty.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(specialty)}
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
            icon={Settings}
            title="Nenhuma especialidade cadastrada"
            description="Cadastre a primeira especialidade para começar."
            actionLabel="Nova especialidade"
            onAction={() => handleOpenModal()}
          />
        )}
      </div>

      {/* Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSpecialty ? 'Editar Especialidade' : 'Nova Especialidade'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados da especialidade abaixo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Cardiologia"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingSpecialty ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
