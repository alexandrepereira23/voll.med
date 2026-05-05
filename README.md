# Voll.med Fullstack

Sistema fullstack para gerenciamento de uma clínica médica fictícia chamada **Voll.med**.

O projeto combina uma API REST em Spring Boot com um frontend React. Ele cobre fluxos de cadastro, agenda, prontuário eletrônico, prescrições, atestados, convênios, auditoria LGPD e integração com IA clínica.

---

## Stack

### Backend

| Tecnologia | Versão | Uso |
|---|---:|---|
| Java | 17 | Linguagem principal |
| Spring Boot | 3.5.4 | API REST |
| Spring Security | 6.5+ | JWT, filtros e autorização |
| Spring Data JPA | — | Persistência |
| Flyway | — | Migrations |
| MySQL | 8.0 | Banco de dados local via Docker |
| Maven Wrapper | — | Build e testes |

### Frontend

| Tecnologia | Versão | Uso |
|---|---:|---|
| React | 18 | Interface web |
| TypeScript | 5.6 | Tipagem |
| Vite | 6 | Dev server e build |
| Tailwind CSS | 3.4 | Estilização |
| Axios | 1.7 | Cliente HTTP |
| React Hook Form + Zod | — | Formulários e validação |
| Lucide React | — | Ícones |

---

## Estrutura

```text
.
├── src/                         # Backend Spring Boot
│   ├── main/java/med/voll/api/
│   │   ├── controller/           # Controllers REST
│   │   ├── domain/               # Entidades, DTOs e repositories
│   │   ├── infra/                # Segurança, AOP e tratamento de erros
│   │   └── service/              # Regras de aplicação
│   ├── main/resources/
│   │   └── db/migration/         # Migrations Flyway V1-V22
│   └── test/                     # Testes unitários e WebMvcTest
├── frontend/                     # Frontend React + Vite
│   ├── src/
│   │   ├── api/                  # Clientes HTTP por módulo
│   │   ├── components/           # Layout e componentes de UI
│   │   ├── contexts/             # AuthContext
│   │   ├── pages/                # Telas do sistema
│   │   ├── routes/               # Rotas privadas
│   │   ├── types/                # Tipos TypeScript
│   │   └── utils/                # Helpers
│   └── docs/                     # Contratos e arquitetura frontend
├── docs/                         # Regras, endpoints, decisões e testes
├── docker-compose.yml            # MySQL local
└── README.md
```

---

## Pré-requisitos

- Java 17+
- Docker e Docker Compose
- Node.js compatível com Vite 6
- npm

O projeto usa Maven Wrapper (`mvnw` / `mvnw.cmd`), então não é obrigatório instalar Maven globalmente.

---

## Configuração

Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Variáveis principais:

| Variável | Obrigatória | Descrição |
|---|:---:|---|
| `DB_HOST` | Não | Host do banco, padrão `localhost` |
| `DB_PORT` | Não | Porta do banco, padrão `3307` |
| `DB_NAME` | Não | Nome do banco |
| `DB_USER` | Não | Usuário do banco |
| `DB_PASSWORD` | Sim | Senha do banco |
| `MYSQL_ROOT_PASSWORD` | Sim | Senha root do MySQL no Docker |
| `JWT_SECRET` | Sim | Chave de assinatura JWT |
| `TOKEN_EXPIRACAO_HORAS` | Não | Expiração do token |
| `ADMIN_LOGIN` | Não | Login do admin inicial |
| `ADMIN_PASSWORD` | Sim | Senha do admin inicial |
| `ANTHROPIC_API_KEY` | Não | Obrigatória apenas para chamadas em `/ia/*` |

Para gerar um segredo JWT:

```bash
openssl rand -base64 32
```

---

## Executando Localmente

### 1. Subir o banco

```bash
docker-compose up -d
```

O MySQL fica disponível em `localhost:3307`.

### 2. Rodar o backend

Linux/macOS:

```bash
./mvnw spring-boot:run
```

Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

Backend:

- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

### 3. Rodar o frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

- App: `http://localhost:5173`

O frontend chama o backend em `http://localhost:8080`. O backend já possui CORS configurado para o Vite local (`localhost:5173` e `127.0.0.1:5173`).

---

## Build e Testes

### Backend

```bash
./mvnw test
```

No Windows:

```powershell
.\mvnw.cmd test
```

Suite atual: **89 testes**.

### Frontend

```bash
cd frontend
npm run build
```

---

## Módulos

### Backend

- Autenticação JWT
- Rate limit em `/auth/*`
- Médicos
- Pacientes
- Consultas
- Disponibilidade médica
- Prontuários
- Prescrições
- Atestados
- Especialidades
- Convênios
- Auditoria LGPD
- IA clínica via Anthropic API

### Frontend

- Login
- Dashboard
- Médicos
- Pacientes
- Consultas
- Prontuários
- Prescrições
- Atestados
- Especialidades
- Convênios
- IA Clínica

---

## Perfis e Segurança

O sistema usa JWT com perfis no token.

Perfis atualmente implementados no backend:

- `ROLE_ADMIN`
- `ROLE_FUNCIONARIO`
- `ROLE_MEDICO`

Modelo profissional documentado para evolução do RBAC:

- `ROLE_ADMIN`: administração técnica, usuários, perfis e parâmetros. Não deve acessar dados clínicos por padrão.
- `ROLE_FUNCIONARIO`: operação da clínica, cadastros, agenda, convênios e leitura operacional.
- `ROLE_MEDICO`: atendimento clínico e acesso aos próprios dados assistenciais.
- `ROLE_AUDITOR` / `ROLE_GESTOR`: leitura ampla, auditoria LGPD e relatórios sensíveis.

Essa divisão profissional está documentada em `docs/REGRAS_DE_NEGOCIO.md`, `docs/ENDPOINTS.md` e `frontend/docs/API_CONTRATOS.md`. A implementação desses novos perfis deve ser feita em etapa própria.

---

## Documentação

| Arquivo | Conteúdo |
|---|---|
| `docs/ENDPOINTS.md` | Referência de endpoints e perfis |
| `docs/REGRAS_DE_NEGOCIO.md` | Regras de domínio e permissões |
| `docs/DECISOES_TECNICAS.md` | Decisões técnicas e gotchas |
| `docs/TESTES.md` | Estratégia de testes |
| `docs/PLANEJAMENTO.md` | Evolução do produto |
| `frontend/docs/API_CONTRATOS.md` | Contratos backend ↔ frontend |
| `frontend/docs/ARCHITECTURE.md` | Arquitetura frontend |
| `frontend/docs/DESIGN_SYSTEM.md` | Design system |

---

## Observações

- Exclusões são lógicas via campo `ativo`.
- Migrations Flyway são a fonte de verdade do schema.
- O backend usa `ddl-auto=validate`.
- `SecurityFillter` e `RateLimitFilter` têm auto-registro desabilitado via `FilterRegistrationBean`; não remova esses beans.
- Testes usam H2 com Flyway desabilitado e `ddl-auto=create-drop`.
- A integração com IA depende de `ANTHROPIC_API_KEY`.

---

## Licença

Projeto desenvolvido para fins de aprendizado no curso da **Alura**.
