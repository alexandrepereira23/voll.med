# Voll.med Fullstack

Sistema fullstack para gestao de clinica medica, com backend Spring Boot, frontend React, autenticacao JWT, regras de negocio clinicas, auditoria, IA clinica e integracao segura com o servico proprio `Consultar-Cep`.

## Resumo

- Backend em Java 17 + Spring Boot 3.5.4.
- Frontend SPA em React 19 + TypeScript + Vite 7.
- Banco MySQL 8 com migrations Flyway.
- Autenticacao e autorizacao por JWT/RBAC.
- Docker Compose para MySQL, backend e frontend local.
- Integracao de CEP via gateway backend, sem expor `X-API-Key` ao navegador.
- Deploy atual com backend no Railway e frontend no Vercel.
- Suites automatizadas validadas: 196 testes backend e 29 testes frontend.

## Funcionalidades Implementadas

- Login JWT em `/auth/login`.
- Cadastro e listagem de usuarios operacionais por `ROLE_ADMIN`.
- Vinculo de usuario medico a medico ativo ainda sem usuario.
- CRUD de medicos, pacientes, especialidades e convenios com exclusao logica quando aplicavel.
- Agendamento e cancelamento de consultas com prioridade, retorno, disponibilidade real e convenio.
- Prontuario eletronico com janela de edicao e ownership por medico.
- Prescricoes e atestados vinculados ao prontuario.
- Agenda de disponibilidade do medico.
- Convenios aceitos por medico e convenios vinculados a paciente.
- Auditoria LGPD para prontuarios, prescricoes e atestados.
- IA clinica para pre-diagnostico, geracao de laudo e resumo historico.
- Autopreenchimento de endereco por CEP nos cadastros de medicos e pacientes.

## Tecnologias

### Backend

| Tecnologia | Uso |
|---|---|
| Java 17 | Linguagem principal |
| Spring Boot 3.5.4 | API REST |
| Spring Security | JWT, filtros e RBAC |
| Spring Data JPA | Persistencia |
| Flyway | Migrations |
| MySQL 8 | Banco principal |
| H2 | Banco em testes |
| SpringDoc OpenAPI | Swagger UI |

### Frontend

| Tecnologia | Uso |
|---|---|
| React 19 | Interface |
| TypeScript 5.6 | Tipagem |
| Vite 7 | Build/dev server |
| Tailwind CSS 4 | Estilo |
| Axios | Cliente HTTP |
| Vitest + Testing Library | Testes |

### Infraestrutura

- Docker e Docker Compose.
- Backend publicado no Railway.
- Frontend publicado no Vercel.
- MySQL local exposto por padrao em `localhost:3307`.

## Integracao com Consultar-Cep

O frontend chama apenas o backend Voll.med em `GET /enderecos/cep/{cep}`. O backend valida o CEP, injeta `X-API-Key` na chamada backend-to-backend para o servico `Consultar-Cep` e devolve ao frontend um contrato proprio (`cep`, `logradouro`, `bairro`, `cidade`, `uf`, `complemento`).

Roles permitidas no endpoint de CEP: `ROLE_FUNCIONARIO` e `ROLE_ADMIN`.

Variaveis usadas pelo backend:

- `CEP_API_BASE_URL`
- `CEP_API_KEY`

Nunca coloque chaves reais no README, no frontend ou no bundle da SPA.

## Estrutura

```text
.
├── backend/        # API Spring Boot
├── frontend/       # SPA React
├── docs/           # Documentacao tecnica e backlog
├── docker-compose.yml
└── README.md
```

## Como Rodar Localmente

Crie o arquivo local de ambiente:

```bash
cp backend/.env.example backend/.env
```

No Windows PowerShell, se necessario:

```powershell
Copy-Item backend/.env.example backend/.env
```

Atualize os valores sensiveis fora de ambientes descartaveis, principalmente `JWT_SECRET`, `ADMIN_PASSWORD`, `DB_PASSWORD`, `ANTHROPIC_API_KEY` e `CEP_API_KEY`.

### Backend Local com MySQL do Compose

```bash
docker compose --env-file backend/.env up -d db
cd backend
./mvnw spring-boot:run
```

### Frontend Local

```bash
cd frontend
npm install
npm run dev
```

Por padrao:

- Backend: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Frontend Vite: `http://localhost:5173`
- MySQL no host: `localhost:3307`

## Como Rodar com Docker

```bash
docker compose --env-file backend/.env up --build
```

Com a stack ativa:

- Frontend: `http://localhost:3000` ou `FRONTEND_PORT`.
- Backend/API: `http://localhost:8080` ou `BACKEND_PORT`.
- Swagger UI: `http://localhost:8080/swagger-ui.html`.
- MySQL no host: `localhost:3307` ou `DB_PORT`.

O frontend em container usa Nginx e proxy `/api` para o backend dentro da rede Docker.

## Variaveis de Ambiente Principais

| Variavel | Uso |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Conexao MySQL |
| `BACKEND_PORT`, `FRONTEND_PORT` | Portas publicadas no Docker Compose |
| `JWT_SECRET` | Assinatura dos tokens JWT |
| `TOKEN_EXPIRACAO_HORAS` | Expiracao do JWT, padrao 2h |
| `ADMIN_LOGIN`, `ADMIN_PASSWORD` | Criacao do admin inicial |
| `ANTHROPIC_API_KEY` | IA clinica |
| `CEP_API_BASE_URL`, `CEP_API_KEY` | Integracao com Consultar-Cep |

## Testes e Build

Backend:

```bash
cd backend
./mvnw test
```

Frontend:

```bash
cd frontend
npm test
npm run check
npm run build
npm audit
```

Estado validado nesta revisao documental:

- `./mvnw test`: 196 testes passando.
- `npm test`: 29 testes passando.
- `npm audit`: 5 vulnerabilidades reportadas (3 moderadas, 2 altas), pendentes de tratamento.

## Perfis de Acesso

- `ROLE_ADMIN`: administracao tecnica e usuarios operacionais.
- `ROLE_FUNCIONARIO`: operacao da clinica, cadastros, agenda e convenios.
- `ROLE_MEDICO`: atendimento clinico, agenda propria, prontuarios proprios e IA clinica.
- `ROLE_AUDITOR`/`ROLE_GESTOR`: leitura ampla e auditoria LGPD.

`ROLE_ADMIN` nao acessa cadastros operacionais nem conteudo clinico por padrao. A leitura operacional de dados clinicos por `ROLE_FUNCIONARIO` existe, mas esta marcada como decisao sensivel a revisar.

## Documentacao

- `docs/ENDPOINTS.md` - referencia dos endpoints atuais.
- `docs/REGRAS_DE_NEGOCIO.md` - regras e matriz de permissoes.
- `docs/DECISOES_TECNICAS.md` - decisoes arquiteturais e historico tecnico.
- `docs/TESTES.md` - estrategia, comandos e estado das suites.
- `docs/ANALISE_PROJETO.md` - analise do estado atual.
- `docs/PLANEJAMENTO.md` - fases concluidas e proximas fases.
- `docs/BACKLOG.md` - pendencias e melhorias futuras.
- `frontend/docs/ARCHITECTURE.md` - arquitetura frontend.
- `frontend/docs/API_CONTRATOS.md` - contratos consumidos pelo frontend.

## Status

Projeto em evolucao ativa. O nucleo fullstack, a integracao de CEP, a IA clinica e o deploy inicial ja estao implementados. Os proximos focos estao documentados em `docs/BACKLOG.md`.

## Autor

Alexandre Henrique
