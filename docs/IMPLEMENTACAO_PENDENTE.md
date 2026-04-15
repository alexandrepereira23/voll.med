# Plano de Implementação — Funcionalidades Pendentes api-voll.med

> **Nota:** Este plano será salvo em `docs/IMPLEMENTACAO_PENDENTE.md` ao iniciar a execução.

## Contexto

O sistema já tem CRUD completo de médicos, pacientes, consultas, autenticação JWT, prontuário, disponibilidade, prescrição, atestado, triagem e retorno. Migrations V1–V20 aplicadas. As funcionalidades abaixo completam o sistema para uso clínico real, na ordem de prioridade definida.

---

## Padrões do projeto (referenciar ao implementar)

- Services recebem `Usuario usuarioLogado` via `@AuthenticationPrincipal` no controller
- Verificação de role: `usuarioLogado.getAuthorities().contains(Perfil.ROLE_MEDICO)`
- Médico logado: `medicoRepository.findByUsuario(usuarioLogado)` (já existe em `MedicoRepository`)
- Soft delete via campo `ativo = false`
- DTOs separados: `DadosCadastro*`, `DadosAtualizacao*`, `DadosListagem*`, `DadosDetalhamento*`
- `@EnableJpaAuditing` habilitado em `ApiApplication.java` (implementado na FASE 3.3)

---

## ✅ FASE 1 — Convênios / Planos de Saúde (V18) — CONCLUÍDA

### Arquivos novos

**`src/main/java/med/voll/api/domain/convenio/`**
- `Convenio.java` — entidade: `id`, `nome`, `codigoANS` (unique), `tipo` (enum: `PARTICULAR`, `PLANO`), `ativo`
- `TipoConvenio.java` — enum: `PARTICULAR`, `PLANO`
- `ConvenioRepository.java` — `findAllByAtivoTrue(Pageable)`, `existsByCodigoANS(String)`
- `DadosCadastroConvenio.java` — `nome`, `codigoANS`, `tipo`
- `DadosAtualizacaoConvenio.java` — `nome` (opcional)
- `DadosListagemConvenio.java` — `id`, `nome`, `codigoANS`, `tipo`
- `DadosDetalhamentoConvenio.java` — todos os campos

**`src/main/java/med/voll/api/domain/paciente/`** (adicionar dentro do pacote existente)
- `ConvenioPaciente.java` — entidade join: `paciente` (@ManyToOne), `convenio` (@ManyToOne), `numeroCarteirinha`, `validade` (LocalDate), `ativo`; unique constraint em `(paciente_id, convenio_id)`
- `ConvenioPacienteRepository.java` — `findAllByPacienteIdAndAtivoTrue(Long, Pageable)`, `findByPacienteIdAndConvenioId(Long, Long)`
- `DadosCadastroConvenioPaciente.java` — `convenioId`, `numeroCarteirinha`, `validade`
- `DadosDetalhamentoConvenioPaciente.java` — todos os campos + `nomeConvenio`

**`src/main/java/med/voll/api/service/`**
- `ConvenioService.java` — `criar`, `listar`, `detalhar`, `inativar`

**`src/main/java/med/voll/api/controller/`**
- `ConvenioController.java` — `@RequestMapping("convenios")`, CRUD; acesso `ROLE_FUNCIONARIO`/`ROLE_ADMIN`
- `ConvenioPacienteController.java` — `@RequestMapping("pacientes/{pacienteId}/convenios")`; associar, listar, remover

### Arquivos modificados

- `domain/consulta/Consulta.java` — adicionar campo `@ManyToOne(optional=true) Convenio convenio`
- `domain/consulta/DadosCadastroConsulta.java` — adicionar `Long convenioId` (opcional)
- `service/ConsultaService.java` — buscar e setar convênio ao agendar, se informado

### Migration V18

```sql
-- V18__create-table-convenios.sql
CREATE TABLE convenios (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    codigo_ans VARCHAR(20) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    ativo TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uk_convenio_codigo_ans (codigo_ans)
);

CREATE TABLE convenio_pacientes (
    id BIGINT NOT NULL AUTO_INCREMENT,
    paciente_id BIGINT NOT NULL,
    convenio_id BIGINT NOT NULL,
    numero_carteirinha VARCHAR(50) NOT NULL,
    validade DATE,
    ativo TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uk_convenio_paciente (paciente_id, convenio_id),
    CONSTRAINT fk_convenio_pacientes_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    CONSTRAINT fk_convenio_pacientes_convenio FOREIGN KEY (convenio_id) REFERENCES convenios(id)
);

ALTER TABLE consultas ADD COLUMN convenio_id BIGINT;
ALTER TABLE consultas ADD CONSTRAINT fk_consultas_convenio FOREIGN KEY (convenio_id) REFERENCES convenios(id);
```

---

## ✅ FASE 2 — Auditoria LGPD de Prontuários (V19) — CONCLUÍDA

### Dependência — adicionar em `pom.xml`

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```

### Arquivos novos

**`src/main/java/med/voll/api/domain/auditoria/`**
- `AuditoriaProntuario.java` — entidade: `prontuarioId`, `usuarioId`, `acao` (enum), `dataHora`, `ipOrigem`
- `AcaoAuditoria.java` — enum: `VISUALIZOU`, `CRIOU`, `EDITOU`
- `AuditoriaProntuarioRepository.java` — `findAllByProntuarioIdOrderByDataHoraDesc(Long, Pageable)`
- `DadosListagemAuditoria.java` — `prontuarioId`, `usuarioId`, `acao`, `dataHora`, `ipOrigem`

**`src/main/java/med/voll/api/infra/aop/`**
- `AuditoriaProntuarioAspect.java` — `@Aspect @Component`
  - `@Around` em `execution(* med.voll.api.service.ProntuarioService.*(..))`
  - Extrai `Usuario` do `SecurityContextHolder`
  - Extrai IP via `HttpServletRequest` (injetado via `RequestContextHolder`)
  - Mapeia nome do método → `AcaoAuditoria` (`criar`→CRIOU, `detalhar`/`listar`→VISUALIZOU, `atualizar`→EDITOU)
  - Salva `AuditoriaProntuario` no `finally` block
  - Extrai `prontuarioId` do primeiro argumento do método ou do retorno

**`src/main/java/med/voll/api/controller/`**
- `AuditoriaController.java` — `GET /auditoria/prontuarios/{id}` — acesso `ROLE_ADMIN`

### Migration V19

```sql
-- V19__create-table-auditoria-prontuario.sql
CREATE TABLE auditoria_prontuario (
    id BIGINT NOT NULL AUTO_INCREMENT,
    prontuario_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    acao VARCHAR(20) NOT NULL,
    data_hora DATETIME NOT NULL,
    ip_origem VARCHAR(45),
    PRIMARY KEY (id),
    CONSTRAINT fk_auditoria_prontuario FOREIGN KEY (prontuario_id) REFERENCES prontuarios(id),
    CONSTRAINT fk_auditoria_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    KEY idx_auditoria_prontuario_data (prontuario_id, data_hora)
);
```

---

## ✅ FASE 3 — Filtro real de consultas por médico logado (3.1) — JÁ ESTAVA IMPLEMENTADO

### Arquivos modificados

**`domain/consulta/ConsultaRepository.java`** — adicionar:
```java
Page<Consulta> findAllByAtivoTrueAndMedico(Medico medico, Pageable pageable);
```

**`service/ConsultaService.java`** — modificar `listar()`:
- Receber `Usuario usuarioLogado`
- Se `ROLE_MEDICO`: buscar médico via `medicoRepository.findByUsuario(usuarioLogado)` → filtrar por médico
- Caso contrário: retornar todas (comportamento atual)

**`controller/ConsultaController.java`** — adicionar `@AuthenticationPrincipal Usuario usuario` no endpoint `GET /consultas` e passar ao service.

---

## ✅ FASE 4 — Registrar quem cancelou a consulta (3.2) — JÁ ESTAVA IMPLEMENTADO

A coluna `cancelado_por` já existe no banco (V16) e o método `consulta.cancelar(motivo, canceladoPor)` já aceita o enum `CanceladoPor` (PACIENTE, CLINICA). Falta apenas:

### Arquivos modificados

**`domain/consulta/DadosCancelamentoConsulta.java`** — verificar se tem campo `CanceladoPor canceladoPor`; se não tiver, adicionar (com validação `@NotNull`).

**`domain/consulta/AgendaDeConsultas.java`** — verificar se `cancelar()` já passa `canceladoPor` para `consulta.cancelar()`; se não, corrigir.

**`domain/consulta/Consulta.java`** — verificar se `cancelado_em` (LocalDateTime) existe; se não, adicionar campo e setar no `cancelar()`.

> **Observação:** pode ser necessária migration V20 para adicionar coluna `cancelado_em` se ela não existir.

---

## ✅ FASE 5 — Auditoria de criação/alteração de entidades (3.3) — CONCLUÍDA (V20)

### Arquivos modificados

**`ApiApplication.java`** — adicionar `@EnableJpaAuditing`

**Entidades a receber campos de auditoria** (Medico, Paciente, Consulta, Prontuario, Prescricao, Atestado):
```java
@CreatedDate
@Column(updatable = false)
private LocalDateTime criadoEm;

@LastModifiedDate
private LocalDateTime atualizadoEm;
```

> `@CreatedBy` / `@LastModifiedBy` exigem `AuditorAware<String>` bean — implementar se desejado; caso contrário usar apenas `@CreatedDate` e `@LastModifiedDate`.

**Migration V20 (ou V21 se 3.2 precisar)** — `ALTER TABLE` para adicionar `criado_em` e `atualizado_em` em cada tabela.

---

## ⏳ FASE 6 — Especialidade como tabela separada (3.4) — PENDENTE

### Estratégia de migração (sem downtime)

1. Criar tabela `especialidades` com seed dos 4 valores atuais
2. Adicionar coluna `especialidade_id BIGINT` em `medicos` (nullable)
3. Executar UPDATE para popular a nova FK com base no valor text atual
4. Adicionar constraint NOT NULL + FK
5. Remover coluna `especialidade` varchar antiga

### Arquivos novos

**`domain/medico/`** (novo, separar do enum):
- `EspecialidadeEntity.java` — entidade: `id`, `nome` (único), `ativo`
- `EspecialidadeRepository.java`
- `DadosListagemEspecialidade.java`

**`controller/EspecialidadeController.java`** — `GET /especialidades` (listar) — autenticado

### Arquivos modificados

- `domain/medico/Medico.java` — trocar `Especialidade` enum por `@ManyToOne EspecialidadeEntity especialidade`
- `domain/medico/DadosCadastroMedico.java` — trocar `Especialidade` por `Long especialidadeId`
- `domain/medico/DadosDetalhamentoMedico.java` / `DadosListagemMedico.java` — ajustar referência
- `service/MedicoService.java` — buscar entidade `EspecialidadeEntity` ao criar/listar

### Migration (2 scripts)

```sql
-- VXX__create-table-especialidades.sql
CREATE TABLE especialidades (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    ativo TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uk_especialidade_nome (nome)
);

INSERT INTO especialidades (nome) VALUES
    ('ORTOPEDIA'), ('CARDIOLOGIA'), ('GINECOLOGIA'), ('DERMATOLOGIA');

ALTER TABLE medicos ADD COLUMN especialidade_id BIGINT;
UPDATE medicos m JOIN especialidades e ON m.especialidade = e.nome SET m.especialidade_id = e.id;
ALTER TABLE medicos MODIFY especialidade_id BIGINT NOT NULL;
ALTER TABLE medicos ADD CONSTRAINT fk_medico_especialidade FOREIGN KEY (especialidade_id) REFERENCES especialidades(id);
ALTER TABLE medicos DROP COLUMN especialidade;
```

> Manter o enum `Especialidade.java` existente até a migration ser aplicada (compatibilidade Flyway validate).

---

## ⏳ FASE 7 — Integração com IA (Claude API) — PENDENTE

### Pré-requisitos

- Chave da API Anthropic em `.env`: `ANTHROPIC_API_KEY`
- Mapeada em `application.properties`: `anthropic.api.key=${ANTHROPIC_API_KEY}`
- Dependência HTTP client (usar `RestClient` do Spring 6 — já disponível no projeto)

### Arquivos novos

**`service/IaService.java`** — centraliza chamadas à API Claude (prompt caching habilitado):
- `gerarPreDiagnostico(String sintomas, Long consultaId)`
- `gerarLaudo(String anotacoes, Long prontuarioId)`
- `resumirHistorico(List<Prontuario> prontuarios)`

**`controller/IaController.java`** — `@RequestMapping("ia")`:
- `POST /ia/pre-diagnostico` — `ROLE_MEDICO`
- `POST /ia/gerar-laudo` — `ROLE_MEDICO`
- `GET /ia/resumo-historico/{pacienteId}` — `ROLE_MEDICO`

### Modelo a usar

`claude-sonnet-4-6` — equilíbrio entre velocidade e capacidade clínica.

---

## Verificação end-to-end por fase

| Fase | Como testar |
|------|-------------|
| 2.4 Convênios | `POST /convenios` → `POST /pacientes/{id}/convenios` → agendar consulta com `convenioId` |
| 2.5 LGPD | Acessar `GET /prontuarios/{id}` → verificar registro em `GET /auditoria/prontuarios/{id}` |
| 3.1 Filtro médico | Login com `ROLE_MEDICO` → `GET /consultas` deve retornar apenas suas consultas |
| 3.2 canceladoPor | `DELETE /consultas` com `canceladoPor: "PACIENTE"` → verificar campo no banco |
| 3.3 JPA Audit | Criar qualquer entidade → verificar `criado_em` populado automaticamente |
| 3.4 Especialidade | `GET /especialidades` → criar médico com `especialidadeId` inteiro |
| 3.7 IA | `POST /ia/pre-diagnostico` com sintomas → validar resposta estruturada |

## Ordem de execução sugerida

1. **3.2** → quick win, migration possivelmente desnecessária, código já 90% pronto
2. **3.1** → 3 arquivos, sem migration
3. **3.3** → @EnableJpaAuditing + migrations simples de ALTER TABLE
4. **2.4** → maior volume de código, mas padrão conhecido
5. **2.5** → requer AOP e pom.xml
6. **3.4** → maior risco (refatoração de enum), fazer por último antes de IA
7. **IA** → requer chave da API Anthropic
