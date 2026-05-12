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
import { searchInArray, statusLabels } from '@/lib/utils';
import { mockInsurance, Insurance } from '@/lib/mockData';
import { Settings, Edit, Trash2 } from 'lucide-react';

export default function InsurancePage() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<Insurance | null>(null);
  const [formData, setFormData] = useState<Partial<Insurance>>({});

  const filteredInsurance = searchInArray(
    mockInsurance,
    search,
    ['name', 'ansCode', 'type']
  );

  const handleOpenModal = (insurance?: Insurance) => {
    if (insurance) {
      setEditingInsurance(insurance);
      setFormData(insurance);
    } else {
      setEditingInsurance(null);
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingInsurance(null);
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
          title="Convênios"
          description="Gerencie convênios e planos aceitos pela clínica"
          actionLabel="Novo convênio"
          onAction={() => handleOpenModal()}
        />

        <Card className="border-border">
          <div className="p-6">
            <SearchInput
              placeholder="Buscar por nome, código ANS ou tipo..."
              value={search}
              onChange={setSearch}
            />
          </div>
        </Card>

        {filteredInsurance.length > 0 ? (
          <Card className="border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código ANS</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInsurance.map((insurance) => (
                    <TableRow key={insurance.id}>
                      <TableCell className="font-medium">{insurance.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {insurance.ansCode}
                      </TableCell>
                      <TableCell>{insurance.type}</TableCell>
                      <TableCell>
                        <Badge
                          variant={insurance.status === 'active' ? 'success' : 'warning'}
                        >
                          {statusLabels[insurance.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(insurance)}
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
            title="Nenhum convênio cadastrado"
            description="Cadastre o primeiro convênio para começar."
            actionLabel="Novo convênio"
            onAction={() => handleOpenModal()}
          />
        )}
      </div>

      {/* Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingInsurance ? 'Editar Convênio' : 'Novo Convênio'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do convênio abaixo
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
                placeholder="Ex: Unimed"
              />
            </div>
            <div>
              <Label htmlFor="ansCode">Código ANS</Label>
              <Input
                id="ansCode"
                value={formData.ansCode || ''}
                onChange={(e) =>
                  setFormData({ ...formData, ansCode: e.target.value })
                }
                placeholder="Ex: 34028-1"
              />
            </div>
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type || ''}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Operadora">Operadora</SelectItem>
                  <SelectItem value="Particular">Particular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingInsurance ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
