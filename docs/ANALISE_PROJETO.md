# Analise do Projeto Voll.med

Este documento consolida o estado atual do repositorio e separa funcionalidades implementadas, riscos tecnicos e proximas fases recomendadas.

## Resumo Executivo

O Voll.med esta estruturado como monorepo fullstack com backend Spring Boot, frontend React, MySQL/Flyway, Docker Compose, JWT/RBAC, IA clinica e integracao segura com o servico proprio `Consultar-Cep`.

Estado validado nesta revisao:

- Backend completo ate a migration `V25`; proxima migration esperada: `V26`.
- Backend com **196 testes passando** em `./mvnw test`.
- Frontend com **29 testes passando** em `npm test`.
- Frontend conectado a API real nos modulos principais.
- Integracao CEP implementada ponta a ponta: backend gateway, `X-API-Key` apenas no backend e autopreenchimento nos formularios.
- Deploy inicial: backend no Railway e frontend no Vercel.

## Estrutura Real

```text
.
├── backend/
├── frontend/
├── docs/
├── docker-compose.yml
├── AGENTS.md
└── README.md
```

## O Que Ja Esta Implementado

### Backend

- Autenticacao JWT em `/auth/login`.
- RBAC com `ROLE_ADMIN`, `ROLE_FUNCIONARIO`, `ROLE_MEDICO`, `ROLE_AUDITOR` e `ROLE_GESTOR`.
- Cadastro/listagem de usuarios por `ROLE_ADMIN`.
- Descoberta de medicos vinculaveis via `GET /auth/medicos-disponiveis`.
- Vinculo transacional usuario-medico com bloqueio pessimista.
- CRUD de medicos, pacientes, especialidades e convenios.
- Agendamento/cancelamento de consultas com prioridade, retorno, disponibilidade real, convenio e `canceladoPor`.
- Prontuario eletronico com ownership do medico e janela de edicao.
- Prescricoes e atestados vinculados a prontuario.
- Disponibilidade medica.
- Convenios aceitos por medico e convenios de paciente.
- Auditoria LGPD para prontuarios, prescricoes e atestados.
- Auditoria JPA de entidades.
- IA clinica restrita a `ROLE_MEDICO`.
- Gateway seguro para consulta de CEP.

### Frontend

Rotas principais em `frontend/src/App.tsx`:

- `/login` — login.
- `/` — dashboard operacional.
- `/users` — usuarios, apenas `ROLE_ADMIN`.
- `/doctors` — medicos, com busca de CEP.
- `/patients` — pacientes, com busca de CEP.
- `/appointments` — consultas.
- `/medical-records` — prontuarios.
- `/prescriptions` — prescricoes.
- `/certificates` — atestados.
- `/specialties` — especialidades.
- `/insurance` — convenios.
- `/availability` — disponibilidade medica.
- `/audit` — auditoria para `ROLE_AUDITOR`/`ROLE_GESTOR`.
- `/clinical-ai` — IA clinica para `ROLE_MEDICO`.
- `/404` e rota fallback — pagina nao encontrada.

## Integracao CEP Consolidada

A integracao com o `Consultar-Cep` foi implementada como gateway backend:

- Frontend chama `GET /enderecos/cep/{cep}` no backend Voll.med.
- Backend valida e normaliza CEP com 8 digitos.
- Backend injeta `X-API-Key` na comunicacao backend-to-backend.
- `CEP_API_BASE_URL` e `CEP_API_KEY` ficam no ambiente do backend.
- Frontend nunca recebe segredo nem chama a API externa diretamente.
- Formularios de medicos e pacientes usam a resposta para autopreencher endereco.
- Testes cobrem service/client/controller no backend e fluxo de formulario no frontend.

## Pontos Fortes Atuais

- Separacao clara de perfis e responsabilidades de acesso.
- `ROLE_ADMIN` separado de leitura clinica e operacional.
- Soft delete preservando historico clinico.
- Flyway como fonte de verdade do schema.
- Gateway de CEP evita vazamento de segredo em SPA.
- Boa cobertura automatizada para controllers, services, seguranca, CEP e frontend critico.
- Docker Compose funcional para stack local.
- Documentacao tecnica distribuida em `docs/` e `frontend/docs/`.

## Riscos Tecnicos Atuais

- Ainda nao ha E2E smoke tests cobrindo browser real contra a stack.
- `ROLE_FUNCIONARIO` possui leitura operacional de prontuarios, prescricoes e atestados; e uma decisao sensivel que precisa revisao de minimo acesso.
- O lock pessimista de vinculo medico-usuario nao tem teste de concorrencia real com MySQL.
- O seletor de medicos disponiveis carrega ate 100 registros; pode precisar busca/paginacao em bases maiores.
- Code splitting do frontend ainda nao foi otimizado.
- O usuario `ROLE_MEDICO` pode continuar autenticando se o medico vinculado for inativado; o acesso assistencial falha em fluxos que exigem medico ativo, mas a politica final de login ainda deve ser definida.

## Pendencias Reais

As pendencias centralizadas estao em `docs/BACKLOG.md`. Principais itens:

- E2E smoke tests.
- Revisao de acesso de funcionarios a dados clinicos sensiveis.
- Ciclo completo da consulta com estados adicionais.
- Otimizacao/code splitting do frontend.
- Melhorias de UX, loading, erro, acessibilidade e paginas de acesso negado.

## Proximas Fases Recomendadas

1. Implementar E2E smoke tests para login, navegacao, cadastros, CEP e agendamento.
2. Otimizar bundle/code splitting do frontend.
3. Definir e implementar o ciclo completo de vida da consulta.
4. Reavaliar permissoes sensiveis de funcionario sobre dados clinicos.
5. Evoluir IA, auditoria, relatorios e metricas administrativas.

## Conclusao

O sistema esta em estagio avancado para um projeto fullstack de gestao clinica: backend amplo, frontend operacional, CEP integrado com seguranca, IA clinica e deploy inicial. As lacunas atuais estao concentradas em validacao ponta a ponta, hardening de dependencias, privacidade clinica fina, performance frontend e evolucoes funcionais planejadas.
