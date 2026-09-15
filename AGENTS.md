# AGENTS.md

## Run Commands

```bash
# Start fullstack stack (MySQL + backend + frontend)
docker compose --env-file backend/.env up --build

# Run backend locally, if using Compose only for MySQL
cd backend
./mvnw spring-boot:run

# Run tests
cd backend
./mvnw test
```

## Architecture

- **Framework**: Spring Boot 3.5.4, Java 17, Maven
- **Database**: MySQL 8.0 on port 3307 (via Docker host mapping; backend container uses `db:3306`)
- **Migrations**: Flyway in `backend/src/main/resources/db/migration/`
- **Auth**: JWT via `/auth/login` (public); other endpoints require Bearer token
- **Soft deletes**: Entities use `ativo` field, not physical deletes
- **Pagination**: 10 records per page (default)
- **API Docs**: Swagger UI at `/swagger-ui.html`

## Entry Points

- `ApiApplication.java` - main class
- Controllers: `AutenticacaoController`, `MedicoController`, `PacientesController`, `ConsultaController`, `DisponibilidadeMedicoController`, `ProntuarioController`, `PrescricaoController`, `AtestadoController`, `ConvenioController`, `ConvenioPacienteController`, `AuditoriaController`, `EspecialidadeController`, `IaController`, `EnderecoController`

## Migrations applied

V1–V25 applied (next: V26)

## Tests

196 tests passing no backend. Run from `backend/`: `./mvnw test`
29 tests passing no frontend. Run from `frontend/`: `npm test`

- Unit/context/security/client: `ApiApplicationTests` (1), `AgendaDeConsultasTest` (17), `ProntuarioServiceTest` (7), `EspecialidadeServiceTest` (8), `UsuarioServiceTest` (11), `IaServiceTest` (6), `AuditoriaProntuarioAspectTest` (2), `SecurityFillterTest` (3), `ConsultaCepServiceTest` (10), `RestClientCepClientTest` (7)
- Controller (`@WebMvcTest`): `ConsultaControllerTest`, `MedicoControllerTest`, `PacientesControllerTest`, `ProntuarioControllerTest`, `PrescricaoControllerTest`, `AtestadoControllerTest`, `EspecialidadeControllerTest`, `AutenticacaoControllerTest` (14), `ConvenioControllerTest`, `ConvenioPacienteControllerTest`, `MedicoConvenioControllerTest`, `DisponibilidadeMedicoControllerTest`, `AuditoriaControllerTest` (4), `EnderecoControllerTest` (8)
- Frontend (Vitest, `frontend/`: `npm test`): 29 testes cobrindo `Users.test.tsx`, `Doctors.cep.test.tsx`, `Patients.cep.test.tsx`, `cep.test.ts`, `FuncionarioDashboard.test.tsx`, `Login.test.tsx`, `AuthContext.test.tsx`, `axios.test.ts`
- See `docs/TESTES.md` for full strategy

## Gotchas

- `backend/.env` file must exist for backend configuration and Docker Compose command above (DB_PASSWORD=root)
- `backend/.env.example` contains development-only defaults; copy it to `backend/.env` and change secrets outside local dev
- Fullstack Docker Compose publishes frontend on `${FRONTEND_PORT:-3000}` and backend on `${BACKEND_PORT:-8080}`
- `JWT_SECRET` must be configured; `.env.example` contains a development-only value that must be replaced outside local dev
- `CEP_API_BASE_URL` (default: `http://localhost:8081`) e `CEP_API_KEY` configuram o consumo da API externa `Consultar-Cep`
- Endpoint `GET /enderecos/cep/{cep}` requer `ROLE_FUNCIONARIO` ou `ROLE_ADMIN`
- MySQL container needs password: `DB_PASSWORD=root` in `.env`
- Test database uses H2 in-memory (configured in spring-boot-starter-test)
- `SecurityFillter` and `RateLimitFilter` have `FilterRegistrationBean` disabling auto-registration — never remove them (Spring Security 6.5+ requirement)
- `ANTHROPIC_API_KEY` required for `/ia/*` endpoints — app starts without it but calls fail at runtime
- IA endpoints are `ROLE_MEDICO` only — do not change to broader roles
