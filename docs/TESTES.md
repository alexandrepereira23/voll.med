# Testes Automatizados — Voll.med

Este documento registra a estrategia de testes, comandos de validacao e pendencias de cobertura do projeto.

## Estado Atual

Validado nesta revisao documental:

- Backend: **196 testes passando** com `./mvnw test` em `backend/`.
- Frontend: **29 testes passando** com `npm test` em `frontend/`.
- Frontend audit: **0 vulnerabilidades** reportadas em `npm audit` (corrigido com seguranca via `npm audit fix`).

## Comandos

### Backend

Linux/macOS/Git Bash:

```bash
cd backend
./mvnw test
```

Windows PowerShell:

```powershell
Set-Location backend
.\mvnw test
```

Classe especifica:

```bash
cd backend
./mvnw test -Dtest=AgendaDeConsultasTest
```

Multiplas classes:

```bash
cd backend
./mvnw test -Dtest="ConsultaControllerTest,AgendaDeConsultasTest"
```

### Frontend

Linux/macOS/Git Bash:

```bash
cd frontend
npm test
npm run check
npm run build
npm audit
```

Windows PowerShell:

```powershell
Set-Location frontend
npm test
npm run check
npm run build
npm audit
```

`npm test` executa Vitest + Testing Library. `npm run check` executa `tsc --noEmit`. `npm run build` executa typecheck incremental (`tsc -b`) e build Vite.

## Estrategia de Testes Backend

### Testes Unitarios e de Service

Usam JUnit 5 e Mockito para validar regras de negocio sem subir o contexto web completo.

| Classe | Testes | Cobertura principal |
|---|---:|---|
| `ApiApplicationTests` | 1 | Inicializacao do contexto Spring Boot com H2 |
| `AgendaDeConsultasTest` | 17 | Agendamento, cancelamento, prioridade, retorno, disponibilidade e convenio |
| `ProntuarioServiceTest` | 7 | Criacao, ownership, janela de edicao e erros de prontuario |
| `EspecialidadeServiceTest` | 8 | CRUD, duplicidade e inativacao |
| `UsuarioServiceTest` | 11 | Cadastro de usuarios, vinculo medico e conflitos |
| `IaServiceTest` | 6 | Chamadas mockadas para IA e regras de contexto medico |
| `AuditoriaProntuarioAspectTest` | 2 | Auditoria AOP para recursos clinicos |
| `SecurityFillterTest` | 3 | Token JWT e preenchimento do `SecurityContext` |
| `ConsultaCepServiceTest` | 10 | Validacao, normalizacao e erros de CEP |
| `RestClientCepClientTest` | 7 | Integracao backend-to-backend com API de CEP |

### Testes de Controller (`@WebMvcTest`)

Validam rotas, serializacao, status HTTP e autorizacao por `@PreAuthorize`.

| Classe | Testes | Cobertura principal |
|---|---:|---|
| `AtestadoControllerTest` | 10 | Emissao/listagem/detalhamento e permissoes |
| `AuditoriaControllerTest` | 4 | Auditoria LGPD restrita a auditor/gestor |
| `AutenticacaoControllerTest` | 14 | Login, cadastro/listagem de usuarios e medicos disponiveis |
| `ConsultaControllerTest` | 7 | Agendar, listar e cancelar consultas por role |
| `ConvenioControllerTest` | 10 | CRUD de convenios e RBAC |
| `ConvenioPacienteControllerTest` | 6 | Vinculo de convenio ao paciente |
| `DisponibilidadeMedicoControllerTest` | 6 | Disponibilidade medica e permissoes |
| `EnderecoControllerTest` | 8 | `GET /enderecos/cep/{cep}` e permissoes |
| `EspecialidadeControllerTest` | 10 | CRUD de especialidades e permissoes |
| `MedicoControllerTest` | 8 | CRUD de medicos e restricoes por role |
| `MedicoConvenioControllerTest` | 4 | Convenios aceitos pelo medico |
| `PacientesControllerTest` | 10 | CRUD/listagem filtrada de pacientes |
| `PrescricaoControllerTest` | 10 | Criacao, detalhamento/listagem e permissoes |
| `ProntuarioControllerTest` | 17 | Criacao, listagem, edicao, inativacao e permissoes |

## Estrategia de Testes Frontend

Arquivos atuais de teste:

| Arquivo | Testes | Cobertura principal |
|---|---:|---|
| `frontend/src/api/cep.test.ts` | 2 | Cliente de CEP chama `/enderecos/cep/{cep}` e propaga erro |
| `frontend/src/api/axios.test.ts` | 5 | Interceptor JWT, 401, 403 e login |
| `frontend/src/contexts/AuthContext.test.tsx` | 3 | Persistencia de sessao, limpeza em 401 e logout |
| `frontend/src/components/dashboard/FuncionarioDashboard.test.tsx` | 6 | Dashboard, agenda do dia, loading, erro e retry |
| `frontend/src/pages/Doctors.cep.test.tsx` | 3 | Busca de CEP no cadastro de medico |
| `frontend/src/pages/Patients.cep.test.tsx` | 2 | Busca de CEP e payload sanitizado no cadastro de paciente |
| `frontend/src/pages/Login.test.tsx` | 2 | Token invalido e erro de login |
| `frontend/src/pages/Users.test.tsx` | 6 | Cadastro de usuarios e seletor de medicos disponiveis |

## Configuracoes de Teste

### Backend

`backend/src/test/resources/application.properties` usa H2 em memoria e desabilita Flyway:

```properties
spring.datasource.url=jdbc:h2:mem:testdb;MODE=MySQL;DB_CLOSE_DELAY=-1
spring.flyway.enabled=false
spring.jpa.hibernate.ddl-auto=create-drop
api.security.token.secret=testSecretKeyForTestingPurposesAtLeast32Chars
```

Flyway fica desabilitado nos testes porque algumas migrations usam sintaxe especifica de MySQL. O schema de teste e criado pelo Hibernate a partir das entidades JPA.

### `@WebMvcTest`

- Usar `@Import(MethodSecurityTestConfig.class)` para ativar `@EnableMethodSecurity` no slice web.
- Usar `@MockBean(JpaMetamodelMappingContext.class)` por causa do `@EnableJpaAuditing` global.
- Autenticar com `.with(user(new Usuario(...)))` quando o controller recebe `@AuthenticationPrincipal Usuario`.
- Adicionar `.with(csrf())` em POST/PUT/DELETE dos testes de controller.

## Testes de Integracao

A suite atual usa H2 para contexto Spring e mocks para clientes externos. A integracao CEP possui testes unitarios/service/client, mas nao sobe um servidor real do `Consultar-Cep`. O lock pessimista do vinculo medico-usuario tambem esta coberto por teste unitario, nao por uma corrida real em MySQL.

## Pendencias de Teste

- Criar E2E smoke tests para login.
- Cobrir navegacao principal por perfil.
- Cobrir cadastro de medico via UI com busca de CEP.
- Cobrir cadastro de paciente via UI com busca de CEP.
- Cobrir agendamento de consulta via UI.
- Cobrir fluxo completo de consulta quando os estados adicionais forem implementados.
- Avaliar teste de concorrencia real para vinculo medico-usuario usando MySQL/Testcontainers ou stack Docker local.

## Troubleshooting Docker Local

Erro `SQL State: 08S01 / Communications link failure` no `backend-voll` geralmente indica corrida de inicializacao com o MySQL. O Compose usa healthcheck SQL real e retries do Flyway para mitigar.

Erro `SQL State: HY000 / Error Code: 1130` ou `Access denied for user 'root'@'localhost'` pode indicar volume MySQL antigo com senha/grants incompatíveis com o `.env` atual. Em ambiente local descartavel:

```bash
docker compose --env-file backend/.env down -v
docker compose --env-file backend/.env up --build
```

Nao use `down -v` se houver dados locais que precisam ser preservados.
