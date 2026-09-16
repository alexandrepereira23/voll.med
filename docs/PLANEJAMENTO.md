# Planejamento de Evolucao — Voll.med

Este documento organiza as fases do projeto. Pendencias detalhadas e melhorias futuras ficam centralizadas em `docs/BACKLOG.md`.

## Fases Concluidas

### 1. Base da API

- Medicos, pacientes, consultas e usuarios.
- Autenticacao JWT.
- Migrations Flyway iniciais.
- Exclusao logica para entidades clinicas/operacionais relevantes.

### 2. Regras Clinicas Principais

- Prontuario eletronico.
- Disponibilidade real de medicos.
- Prescricoes.
- Triagem por prioridade.
- Retorno de consulta.
- Atestados.
- Convenios e relacionamento com pacientes/medicos.
- Auditoria LGPD e auditoria JPA.
- Especialidades como tabela.

### 3. RBAC e Ownership

- Perfis `ROLE_ADMIN`, `ROLE_FUNCIONARIO`, `ROLE_MEDICO`, `ROLE_AUDITOR` e `ROLE_GESTOR`.
- `ROLE_ADMIN` focado em administracao tecnica e usuarios.
- `ROLE_MEDICO` limitado aos proprios dados assistenciais.
- `ROLE_AUDITOR`/`ROLE_GESTOR` para leitura ampla e auditoria.
- Usuario medico vinculado a medico ativo ainda sem usuario.
- `GET /auth/medicos-disponiveis` para o cadastro de usuario medico.
- Bloqueio pessimista para evitar vinculo concorrente do mesmo medico.

### 4. Frontend Operacional

- React 19 + TypeScript + Vite.
- Login, dashboard e modulos operacionais conectados a API real.
- Rotas para medicos, pacientes, consultas, prontuarios, prescricoes, atestados, especialidades, convenios, disponibilidade, auditoria, usuarios e IA clinica.
- Guardas de navegacao por perfil para UX.

### 5. IA Clinica

- `POST /ia/pre-diagnostico`.
- `POST /ia/gerar-laudo`.
- `GET /ia/resumo-historico/{pacienteId}`.
- Restricao a `ROLE_MEDICO`.
- Uso da Anthropic API via `RestClient`.

### 6. Integracao CEP

- `GET /enderecos/cep/{cep}` protegido por JWT.
- Backend como gateway seguro para o `Consultar-Cep`.
- `X-API-Key` restrito ao backend.
- Variaveis `CEP_API_BASE_URL` e `CEP_API_KEY`.
- Autopreenchimento nos cadastros de medicos e pacientes.
- Testes backend e frontend cobrindo a integracao.

### 7. Deploy Inicial e Docker

- Docker Compose fullstack com MySQL, backend e frontend.
- Backend em Railway.
- Frontend em Vercel.
- CORS configurado para ambientes locais e Vercel.

### 8. Documentacao, Backlog e Hardening de Dependencias

- Atualizacao completa da documentacao (`README.md`, `docs/ENDPOINTS.md`, `docs/TESTES.md`, `docs/ANALISE_PROJETO.md`, `docs/PLANEJAMENTO.md`, `docs/DECISOES_TECNICAS.md`, `docs/REGRAS_DE_NEGOCIO.md`).
- Marcacao de `docs/EVOLUCAO_ARQUITETURA.md` como documento historico.
- Criacao de `docs/BACKLOG.md` como fonte centralizada de pendencias reais.
- Mitigacao e correcao das 5 vulnerabilidades do frontend via `npm audit fix` (0 vulnerabilidades remanescentes).

## Fase Atual — E2E Smoke Tests

Objetivo: implementar testes ponta a ponta (E2E) cobrindo fluxos criticos da aplicacao com navegador e stack local integrada.

Entregas prioritarias desta fase:

- Login e navegacao por perfil (`ROLE_ADMIN`, `ROLE_FUNCIONARIO`, `ROLE_MEDICO`).
- Cadastro de medico com autopreenchimento de endereco via CEP.
- Cadastro de paciente com autopreenchimento de endereco via CEP.
- Agendamento de consulta com validacao de horario e disponibilidade.

## Proximas Fases Sugeridas

### 1. Otimizacao e Code Splitting do Frontend

- Avaliar lazy loading de rotas.
- Reduzir chunks grandes do build Vite.
- Medir impacto com `npm run build`.

### 2. Ciclo Completo da Consulta

Estados sugeridos:

- Agendada.
- Confirmada.
- Check-in.
- Em atendimento.
- Concluida.
- Cancelada.
- Paciente ausente.
- Reagendada.

### 3. Permissoes Sensiveis

- Definir se `ROLE_FUNCIONARIO` pode ver prontuarios, prescricoes e atestados completos.
- Avaliar visoes resumidas sem conteudo clinico sensivel.
- Garantir auditoria em todo acesso sensivel.

### 4. UX e Auditoria

- Melhorar estados de loading/erro.
- Criar tela dedicada de acesso negado.
- Ampliar filtros e listagens.
- Evoluir relatorios e trilhas de auditoria.

### 5. Evolucoes Futuras da IA

- Melhorar prompts e avaliacao de qualidade.
- Adicionar limites, observabilidade e tratamento de indisponibilidade.
- Avaliar logs/auditoria das chamadas sem armazenar dados sensiveis indevidos.

## Resumo de Migrations

| Migration | Descricao | Status |
|---|---|---|
| `V1`-`V11` | Base do sistema | Aplicado |
| `V12` | Prontuarios | Aplicado |
| `V13` | Disponibilidade medica | Aplicado |
| `V14` | Prescricoes | Aplicado |
| `V15` | Prioridade e tipo de consulta | Aplicado |
| `V16` | Retorno e cancelado por | Aplicado |
| `V17` | Atestados | Aplicado |
| `V18` | Convenios | Aplicado |
| `V19` | Auditoria de prontuario | Aplicado |
| `V20` | Auditoria JPA | Aplicado |
| `V21` | Especialidades como tabela | Aplicado |
| `V22` | Convenios aceitos por medico | Aplicado |
| `V23` | Telefone de pacientes como `VARCHAR(20)` | Aplicado |
| `V24` | Unicidade em `medicos.usuario_id` | Aplicado |
| `V25` | Auditoria por tipo/id de recurso clinico | Aplicado |

Proxima migration: `V26`.
