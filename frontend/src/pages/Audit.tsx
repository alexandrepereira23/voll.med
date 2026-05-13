import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
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
import { ShieldCheck, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { auditoriaApi } from '@/api/auditoria';
import { prontuariosApi } from '@/api/prontuarios';
import type { AuditoriaListagem, AcaoAuditoria } from '@/types/auditoria';
import type { ProntuarioListagem } from '@/types/api';

const ACAO_LABELS: Record<AcaoAuditoria, string> = {
  VISUALIZOU: 'Visualizou',
  CRIOU: 'Criou',
  EDITOU: 'Editou',
};

const ACAO_COLORS: Record<AcaoAuditoria, string> = {
  VISUALIZOU: 'bg-blue-100 text-blue-800',
  CRIOU: 'bg-green-100 text-green-800',
  EDITOU: 'bg-yellow-100 text-yellow-800',
};

export default function Audit() {
  // Prontuários list
  const [prontuarios, setProntuarios] = useState<ProntuarioListagem[]>([]);
  const [loadingPron, setLoadingPron] = useState(false);
  const [pronPage, setPronPage] = useState(0);
  const [pronTotalPages, setPronTotalPages] = useState(0);

  // Selected prontuário + logs
  const [selected, setSelected] = useState<ProntuarioListagem | null>(null);
  const [logs, setLogs] = useState<AuditoriaListagem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logPage, setLogPage] = useState(0);
  const [logTotalPages, setLogTotalPages] = useState(0);

  const fetchProntuarios = async (p = 0) => {
    setLoadingPron(true);
    try {
      const result = await prontuariosApi.list(p, 10);
      setProntuarios(result.content);
      setPronTotalPages(result.totalPages);
      setPronPage(p);
    } catch {
      toast.error('Erro ao carregar prontuários');
    } finally {
      setLoadingPron(false);
    }
  };

  const fetchLogs = async (prontuarioId: number, p = 0) => {
    setLoadingLogs(true);
    try {
      const result = await auditoriaApi.listByProntuario(prontuarioId, p);
      setLogs(result.content);
      setLogTotalPages(result.totalPages);
      setLogPage(p);
    } catch {
      toast.error('Erro ao carregar logs de auditoria');
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchProntuarios(0);
  }, []);

  const handleSelectProntuario = (pron: ProntuarioListagem) => {
    setSelected(pron);
    setLogs([]);
    fetchLogs(pron.id, 0);
  };

  const handleBack = () => {
    setSelected(null);
    setLogs([]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          icon={ShieldCheck}
          title="Auditoria LGPD"
          description="Histórico de acessos a prontuários — conformidade com a LGPD"
        />

        {!selected ? (
          <>
            <Card className="border-border overflow-hidden">
              <div className="px-6 py-4 border-b">
                <p className="text-sm font-medium text-foreground">Selecione um prontuário para auditar</p>
                <p className="text-xs text-muted-foreground mt-0.5">Clique em um prontuário para ver o histórico de acessos</p>
              </div>

              {loadingPron ? (
                <div className="p-12 text-center text-muted-foreground">Carregando...</div>
              ) : prontuarios.length === 0 ? (
                <div className="p-12">
                  <EmptyState
                    icon={ShieldCheck}
                    title="Nenhum prontuário encontrado"
                    description="Não há prontuários registrados no sistema."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Diagnóstico</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prontuarios.map(pron => (
                        <TableRow
                          key={pron.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSelectProntuario(pron)}
                        >
                          <TableCell className="font-medium text-muted-foreground">{pron.id}</TableCell>
                          <TableCell className="font-medium">{pron.nomePaciente}</TableCell>
                          <TableCell className="max-w-xs truncate">{pron.diagnostico}</TableCell>
                          <TableCell>
                            {new Date(pron.dataRegistro).toLocaleDateString('pt-BR')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {pronTotalPages > 1 && (
                <div className="flex items-center justify-between border-t px-6 py-3">
                  <Button variant="outline" size="sm" disabled={pronPage === 0} onClick={() => fetchProntuarios(pronPage - 1)}>
                    <ChevronLeft className="h-4 w-4 mr-1" />Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">Página {pronPage + 1} de {pronTotalPages}</span>
                  <Button variant="outline" size="sm" disabled={pronPage >= pronTotalPages - 1} onClick={() => fetchProntuarios(pronPage + 1)}>
                    Próxima<ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </Card>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-1" />Voltar
              </Button>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Prontuário #{selected.id} — {selected.nomePaciente}
                </p>
                <p className="text-xs text-muted-foreground">{selected.diagnostico}</p>
              </div>
            </div>

            <Card className="border-border overflow-hidden">
              <div className="px-6 py-4 border-b">
                <p className="text-sm font-medium text-foreground">Histórico de acessos</p>
                <p className="text-xs text-muted-foreground mt-0.5">Registros de quem visualizou, criou ou editou este prontuário</p>
              </div>

              {loadingLogs ? (
                <div className="p-12 text-center text-muted-foreground">Carregando...</div>
              ) : logs.length === 0 ? (
                <div className="p-12">
                  <EmptyState
                    icon={ShieldCheck}
                    title="Nenhum log encontrado"
                    description="Este prontuário não possui registros de auditoria."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ação</TableHead>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Data e Hora</TableHead>
                        <TableHead>IP Origem</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map(log => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ACAO_COLORS[log.acao]}`}>
                              {ACAO_LABELS[log.acao]}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">{log.loginUsuario}</TableCell>
                          <TableCell>
                            {new Date(log.dataHora).toLocaleString('pt-BR', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit', second: '2-digit',
                            })}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{log.ipOrigem ?? '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {logTotalPages > 1 && (
                <div className="flex items-center justify-between border-t px-6 py-3">
                  <Button variant="outline" size="sm" disabled={logPage === 0} onClick={() => fetchLogs(selected.id, logPage - 1)}>
                    <ChevronLeft className="h-4 w-4 mr-1" />Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">Página {logPage + 1} de {logTotalPages}</span>
                  <Button variant="outline" size="sm" disabled={logPage >= logTotalPages - 1} onClick={() => fetchLogs(selected.id, logPage + 1)}>
                    Próxima<ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
