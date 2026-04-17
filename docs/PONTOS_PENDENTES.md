# Pontos Pendentes — API Voll.med

Registro de itens identificados como incompletos ou não implementados após a conclusão do roadmap principal.

---

## ✅ 1. CRUD completo de Especialidades — IMPLEMENTADO

**Problema:** apenas `GET /especialidades` existia. Adicionar ou renomear especialidades exigia migration manual.

**Solução implementada:**

| Método | Endpoint | Acesso | Descrição |
|--------|----------|--------|-----------|
| `POST` | `/especialidades` | `ROLE_ADMIN` | Cadastrar nova especialidade |
| `GET` | `/especialidades` | Autenticado | Listar especialidades ativas |
| `GET` | `/especialidades/{id}` | Autenticado | Detalhar especialidade |
| `PUT` | `/especialidades/{id}` | `ROLE_ADMIN` | Atualizar nome |
| `DELETE` | `/especialidades/{id}` | `ROLE_ADMIN` | Inativar (soft delete) |

**Arquivos criados/modificados:**
- `domain/medico/DadosCadastroEspecialidade.java`
- `domain/medico/DadosAtualizacaoEspecialidade.java`
- `domain/medico/DadosDetalhamentoEspecialidade.java`
- `domain/medico/EspecialidadeEntity.java` — adicionado `atualizar()`, `inativar()`, construtor com nome
- `domain/medico/EspecialidadeRepository.java` — adicionado `existsByNomeIgnoreCase()`
- `service/EspecialidadeService.java` — criado com validação de nome duplicado (HTTP 409)
- `controller/EspecialidadeController.java` — CRUD completo

**Regra de negócio:** não é possível cadastrar duas especialidades com o mesmo nome (case-insensitive) — retorna HTTP 409.

---

## ⏳ 2. Validação de convênio no médico — PENDENTE

**Problema:** ao agendar uma consulta com convênio, o sistema não valida se o médico aceita aquele convênio. Qualquer médico pode ser associado a qualquer convênio sem restrição.

**O que precisa ser feito:**

1. Criar tabela `medico_convenios` (relação N:N entre médico e convênio)
2. Migration V22: `CREATE TABLE medico_convenios`
3. Endpoint para vincular convênios ao médico: `POST /medicos/{id}/convenios`
4. Endpoint para listar convênios do médico: `GET /medicos/{id}/convenios`
5. Validação em `AgendaDeConsultas.agendar()`: se `convenioId` informado, verificar se o médico aceita o convênio

**Arquivos a criar/modificar:**
- `domain/medico/MedicoConvenio.java` — entidade join
- `domain/medico/MedicoConvenioRepository.java`
- `controller/MedicoConvenioController.java`
- `domain/consulta/AgendaDeConsultas.java` — adicionar validação
- Migration `V22__create-table-medico-convenios.sql`

---

## ⏳ 3. Testes automatizados — PENDENTE

**Problema:** o projeto não possui nenhum teste unitário ou de integração. Qualquer refatoração é feita sem rede de segurança.

**O que precisa ser feito:**

### Testes unitários (JUnit 5 + Mockito)
- `AgendaDeConsultasTest` — cobrir todas as validações de agendamento e cancelamento
- `ProntuarioServiceTest` — validar janela de 24h, restrição por médico
- `IaServiceTest` — mockar `RestClient`, validar mapeamento de resposta
- `EspecialidadeServiceTest` — validar conflito de nome duplicado

### Testes de integração (Spring Boot Test + H2)
- `MedicoControllerTest` — fluxo completo de CRUD com autenticação JWT
- `ConsultaControllerTest` — agendar, cancelar, retorno
- `EspecialidadeControllerTest` — CRUD com controle de acesso por role

### Como rodar
```bash
./mvnw test
./mvnw test -Dtest=NomeDaClasseTest
```
