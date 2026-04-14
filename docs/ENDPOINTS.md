# Referência de Endpoints — API Voll.med

Todos os endpoints exigem autenticação via JWT (`Authorization: Bearer <token>`), exceto `/auth/login`.

---

## Autenticação

| Método | Endpoint | Descrição | Roles |
|--------|----------|-----------|-------|
| `POST` | `/auth/login` | Autenticar e obter JWT | Público |
| `POST` | `/auth/cadastro` | Criar novo usuário | ADMIN |

---

## Médicos

| Método | Endpoint | Descrição | Roles |
|--------|----------|-----------|-------|
| `POST` | `/medicos` | Cadastrar médico | FUNCIONARIO |
| `GET` | `/medicos` | Listar médicos ativos (paginado) | ADMIN, FUNCIONARIO, MEDICO |
| `GET` | `/medicos/{id}` | Detalhar médico | ADMIN, FUNCIONARIO, MEDICO |
| `PUT` | `/medicos/{id}` | Atualizar médico | FUNCIONARIO |
| `DELETE` | `/medicos/{id}` | Inativar médico (exclusão lógica) | FUNCIONARIO |
| `POST` | `/medicos/{id}/disponibilidade` | Cadastrar horários de disponibilidade | FUNCIONARIO |
| `GET` | `/medicos/{id}/disponibilidade` | Listar horários de disponibilidade | ADMIN, FUNCIONARIO, MEDICO |
| `DELETE` | `/medicos/{id}/disponibilidade/{dispId}` | Remover horário de disponibilidade | FUNCIONARIO |

---

## Pacientes

| Método | Endpoint | Descrição | Roles |
|--------|----------|-----------|-------|
| `POST` | `/pacientes` | Cadastrar paciente | FUNCIONARIO |
| `GET` | `/pacientes` | Listar pacientes ativos (paginado) | ADMIN, FUNCIONARIO, MEDICO |
| `GET` | `/pacientes/{id}` | Detalhar paciente | ADMIN, FUNCIONARIO, MEDICO |
| `PUT` | `/pacientes/{id}` | Atualizar paciente | FUNCIONARIO |
| `DELETE` | `/pacientes/{id}` | Inativar paciente (exclusão lógica) | FUNCIONARIO |

---

## Consultas

| Método | Endpoint | Descrição | Roles |
|--------|----------|-----------|-------|
| `POST` | `/consultas` | Agendar consulta | FUNCIONARIO |
| `GET` | `/consultas` | Listar consultas (paginado) | ADMIN, FUNCIONARIO, MEDICO* |
| `DELETE` | `/consultas` | Cancelar consulta | FUNCIONARIO |

> *MEDICO vê apenas suas próprias consultas (filtro por implementar — ver `docs/PLANEJAMENTO.md` item 3.1).

### Campos do agendamento (`POST /consultas`)
```json
{
  "idPaciente": 1,
  "idMedico": 2,              // opcional — sistema escolhe aleatório com disponibilidade real se omitido
  "data": "2025-01-15T10:00",
  "prioridade": "ROTINA",     // ROTINA (30 min) | PRIORITARIO (10 min) | URGENCIA (sem restrição). Padrão: ROTINA
  "consultaOrigemId": null    // ID da consulta original, para agendar retorno
}
```

### Campos do cancelamento (`DELETE /consultas`)
```json
{
  "idConsulta": 1,
  "motivo": "PACIENTE_DESISTIU",
  "canceladoPor": "PACIENTE"  // PACIENTE | CLINICA (opcional)
}
```

---

## Prontuários

| Método | Endpoint | Descrição | Roles |
|--------|----------|-----------|-------|
| `POST` | `/prontuarios` | Criar prontuário vinculado a uma consulta | MEDICO (da consulta) |
| `GET` | `/prontuarios/{id}` | Detalhar prontuário | ADMIN, FUNCIONARIO, MEDICO* |
| `GET` | `/prontuarios/paciente/{id}` | Histórico clínico do paciente | ADMIN, FUNCIONARIO, MEDICO* |
| `PUT` | `/prontuarios/{id}` | Editar prontuário (janela de 24h) | MEDICO (criador, dentro de 24h) |
| `DELETE` | `/prontuarios/{id}` | Inativar prontuário | ADMIN |

> *MEDICO vê apenas prontuários de suas próprias consultas.

---

## Prescrições

| Método | Endpoint | Descrição | Roles |
|--------|----------|-----------|-------|
| `POST` | `/prescricoes` | Criar prescrição vinculada a um prontuário | MEDICO (do prontuário) |
| `GET` | `/prescricoes/{id}` | Detalhar prescrição | ADMIN, FUNCIONARIO, MEDICO* |
| `GET` | `/prescricoes/prontuario/{id}` | Listar prescrições de um prontuário | ADMIN, FUNCIONARIO, MEDICO* |

> *MEDICO vê apenas prescrições de seus próprios prontuários.

### Campos da prescrição (`POST /prescricoes`)
```json
{
  "prontuarioId": 1,
  "tipo": "SIMPLES",         // SIMPLES (validade 30 dias) | ESPECIAL (60 dias)
  "itens": [
    {
      "medicamento": "Dipirona 500mg",
      "dosagem": "1 comprimido",
      "posologia": "A cada 8 horas",
      "duracao": "5 dias"
    }
  ]
}
```

---

## Atestados

| Método | Endpoint | Descrição | Roles |
|--------|----------|-----------|-------|
| `POST` | `/atestados` | Emitir atestado vinculado a um prontuário | MEDICO (do prontuário) |
| `GET` | `/atestados/{id}` | Detalhar atestado | ADMIN, FUNCIONARIO, MEDICO* |
| `GET` | `/atestados/paciente/{id}` | Histórico de atestados do paciente | ADMIN, FUNCIONARIO, MEDICO* |

> *MEDICO vê apenas atestados vinculados aos seus prontuários.

### Campos do atestado (`POST /atestados`)
```json
{
  "prontuarioId": 1,
  "diasAfastamento": 3,
  "cid10": "J11.1",         // opcional
  "observacoes": "Repouso recomendado." // opcional
}
```

---

## Notas gerais

- Todos os endpoints paginados aceitam `?page=0&size=10&sort=campo,asc`
- Respostas de erro seguem o padrão `{ "campo": "mensagem" }` (validação) ou `{ "mensagem": "..." }` (negócio)
- Rate limiting ativo em `/auth/*`: máx. 10 req/IP em 15 min → HTTP 429
- Documentação interativa disponível em `/swagger-ui.html` (perfil dev)
