# Backlog do Projeto Voll.med

## Visao Geral

Este arquivo centraliza melhorias futuras, pendencias conhecidas e proximas funcionalidades do Voll.med. Itens aqui nao devem ser descritos como implementados em outros documentos ate que sejam entregues e validados.

## Prioridade Alta

### E2E Smoke Tests

- Login.
- Navegacao principal.
- Cadastro de medico.
- Cadastro de paciente.
- Busca de CEP nos formularios.
- Agendamento de consulta.

### Ciclo Completo da Consulta

Implementar e validar estados adicionais da consulta:

- Agendada.
- Confirmada.
- Check-in.
- Em atendimento.
- Concluida.
- Cancelada.
- Paciente ausente.
- Reagendada.

### Acesso de Funcionarios a Dados Clinicos

Definir decisao final sobre `ROLE_FUNCIONARIO` em dados sensiveis:

- Prontuarios.
- Prescricoes.
- Atestados.
- Dados clinicos sensiveis.
- Necessidade de visao resumida operacional.
- Auditoria obrigatoria em toda leitura sensivel.

### Vulnerabilidades npm

Status atual de `npm audit`:

- 5 vulnerabilidades reportadas.
- 3 moderadas.
- 2 altas.
- Correcao sugerida pelo npm: `npm audit fix`.

Acao pendente: avaliar impacto das atualizacoes, aplicar correcao em branch propria e rodar `npm test`, `npm run check`, `npm run build` e novo `npm audit`.

### Politica de Usuario Medico com Medico Inativado

Definir se usuario `ROLE_MEDICO` deve continuar autenticando quando o medico vinculado for inativado.

Opcionalmente bloquear login, bloquear apenas funcionalidades assistenciais ou exigir reativacao/vinculo novo.

## Prioridade Media

### Otimizacao e Code Splitting do Frontend

- Avaliar lazy loading de rotas.
- Reduzir chunks grandes do Vite.
- Medir bundle com `npm run build`.

### Dashboards

- Melhorar cards e indicadores por perfil.
- Adicionar metricas administrativas sem expor dados clinicos indevidos.
- Evoluir dashboard medico com agenda e pendencias assistenciais.

### Consultas

- Filtros avancados em consultas.
- Reagendamento de consulta.
- Melhorias na agenda/disponibilidade.
- Visualizacao por dia/semana/medico.

### Formularios e UX

- Melhorias nos formularios principais.
- Estados de loading/erro mais consistentes.
- Validacoes visuais mais claras.
- Preservar dados digitados apos falhas de API.

### Acessibilidade e Navegacao

- Revisao de foco, labels e contraste.
- Pagina 404 ja existe; melhorar experiencia e links de retorno.
- Criar tela dedicada de acesso negado.
- Melhorias em tabelas/listagens.

### Escalabilidade Operacional

- Paginacao/busca real no seletor de medicos disponiveis (`GET /auth/medicos-disponiveis` hoje e consumido com limite pratico de 100 registros no frontend).
- Teste de concorrencia real para vinculo medico-usuario usando MySQL/Testcontainers ou stack Docker local.

## Prioridade Baixa / Futuro

### IA Clinica

- Melhorar prompts e avaliacao de qualidade.
- Adicionar observabilidade de chamadas sem registrar dados sensiveis desnecessarios.
- Criar estrategia de indisponibilidade/timeout da IA.
- Avaliar historico e comparacao de respostas, se fizer sentido clinico e juridico.

### Auditoria Avancada

- Filtros por usuario, periodo, recurso e acao.
- Exportacao controlada para auditoria interna.
- Alertas para acessos incomuns a dados sensiveis.

### Relatorios e Metricas

- Relatorios administrativos.
- Metricas de consultas por periodo.
- Metricas por convenio.
- Indicadores de absenteismo e cancelamento.

### Documentos Clinicos

- Impressao/download de prescricoes.
- Impressao/download de atestados.
- Layouts padronizados e auditaveis.

### Convenios

- Evolucao de regras de convenio.
- Validacao de elegibilidade.
- Relatorios por plano/particular.

### UX Mobile

- Melhorias de responsividade em tabelas.
- Fluxos curtos para cadastro/consulta em telas pequenas.
- Revisao de sidebar/menu mobile.

## Itens Ja Resolvidos

- Vínculo usuario-medico ao criar `ROLE_MEDICO`.
- Endpoint `GET /auth/medicos-disponiveis` para `ROLE_ADMIN`.
- Bloqueio pessimista no vinculo medico-usuario.
- Matriz principal de permissoes por perfil.
- Separacao entre `ROLE_ADMIN` tecnico e perfis clinico/operacionais.
- Integracao com CEP via gateway backend.
- `X-API-Key` da API de CEP mantida apenas no backend.
- Autopreenchimento de endereco em medicos e pacientes.
- Deploy inicial com backend no Railway e frontend no Vercel.
- Docker Compose fullstack com MySQL, backend e frontend.
- IA clinica no backend e frontend.
- Auditoria LGPD para prontuarios, prescricoes e atestados.
- Especialidades como tabela em vez de enum fixo.
