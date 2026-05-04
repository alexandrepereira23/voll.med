# 🛠️ Plano de Evolução: RBAC e Camada de Serviço (API Voll.med)

Este documento serve como o "Contexto Mestre" para a implementação do controle de acesso baseado em perfis (**Role-Based Access Control**) e a refatoração para a **Camada de Serviço**.

## 📌 Visão Geral da Mudança
Transformar a API para um modelo profissional de controle de acesso por perfis:
1.  **ADMIN**: Administra usuários, perfis e parâmetros técnicos do sistema. Não acessa dados clínicos por padrão.
2.  **FUNCIONARIO**: Opera a clínica: cadastros, agenda, convênios e leitura operacional necessária ao atendimento.
3.  **MEDICO**: Acesso clínico restrito à própria agenda, aos próprios prontuários e aos pacientes vinculados.
4.  **AUDITOR/GESTOR**: Acesso amplo de leitura para auditoria LGPD, relatórios sensíveis e supervisão formal, sempre auditado.

---

## 🚀 Prompt Mestre para IA (Claude Code / OpenCode)

> **Instrução:** "Atue como um desenvolvedor Java Sênior especialista em Spring Boot 3.5. Vamos evoluir a API Voll.med seguindo as etapas abaixo. Trabalhe em uma etapa por vez, seguindo as melhores práticas de Clean Code, SOLID e Segurança."

### 🔵 ETAPA 0: Refatoração da AutenticacaoService
**Objetivo:** Adaptar o serviço de autenticação para o novo modelo de Perfis.
1. Localizar ou criar a `AutenticacaoService.java` na camada `/service`.
2. Garantir que ela implemente `UserDetailsService`.
3. Refatorar o método `loadUserByUsername` para que ele retorne o `Usuario` já com as Authorities (Roles) carregadas.
4. (Opcional) Criar um método no Service para gerenciar a troca de senha ou primeiro acesso, se necessário.

### 🟢 ETAPA 1: Domínio e Banco de Dados (Refatoração de Usuário)
**Objetivo:** Preparar o banco e a entidade para suportar Roles.
1. Criar migration **Flyway** adicionando a coluna `role` (VARCHAR) na tabela `usuarios`.
2. Criar/atualizar Enum `Perfil` (`ROLE_ADMIN`, `ROLE_FUNCIONARIO`, `ROLE_MEDICO`, `ROLE_AUDITOR`, `ROLE_GESTOR`).
3. Atualizar a entidade `Usuario` para implementar `UserDetails` com essas authorities.
4. Adicionar relacionamento `@OneToOne` opcional entre `Usuario` e `Medico`.

### 🟢 ETAPA 2: Infraestrutura de Segurança (JWT & Authorities)
**Objetivo:** Garantir que o Token JWT carregue o perfil do usuário.
1. Alterar o `TokenService` para incluir a Claim `"role"` no payload do JWT.
2. No `SecurityFilter`, garantir que a autoridade seja extraída do token e injetada no `SecurityContextHolder`.
3. Habilitar `@EnableMethodSecurity` na classe `SecurityConfigurations`.

### 🟢 ETAPA 3: Criação da Camada de Serviço Global
**Objetivo:** Isolar a inteligência de todos os domínios.
1. Criar `MedicoService`, `PacienteService` e `ConsultaService`.
2. Mover toda a lógica de conversão `DTO -> Entidade` e `Entidade -> DTO` para os Services.
3. **Regra de Negócio Central:** Implementar nos Services (especialmente no `ConsultaService`) a lógica que identifica o usuário logado e filtra os dados.
   - Ex: O `MedicoService.listar()` deve verificar se quem chama é um Médico; se sim, retorna apenas os dados dele.

### 🟢 ETAPA 4: Refatoração de Controllers e Proteção de Métodos
**Objetivo:** Aplicar as travas de segurança finais via anotações.
1. Refatorar Controllers para remover chamadas diretas ao Repository.
2. Aplicar `@PreAuthorize("hasRole('ROLE_FUNCIONARIO')")` em métodos de escrita (POST/PUT/DELETE).
3. Usar `@AuthenticationPrincipal` para capturar o usuário logado de forma limpa.

---

## 📐 Arquitetura Alvo
O fluxo de dados deve seguir rigorosamente:
`Cliente -> Controller (Autorização) -> Service (Regra/Filtro) -> Repository -> Banco de Dados`

**Regra de Ouro:** O Controller nunca deve decidir *quais* dados o médico pode ver; ele apenas pergunta ao Service, passando o usuário logado como parâmetro.
