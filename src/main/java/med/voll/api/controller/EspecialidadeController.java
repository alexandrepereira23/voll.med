package med.voll.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import med.voll.api.domain.medico.*;
import med.voll.api.service.EspecialidadeService;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("especialidades")
@Tag(name = "Especialidades", description = "Gerenciamento de especialidades médicas")
public class EspecialidadeController {

    private final EspecialidadeService especialidadeService;

    public EspecialidadeController(EspecialidadeService especialidadeService) {
        this.especialidadeService = especialidadeService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_FUNCIONARIO')")
    @Operation(summary = "Cadastrar especialidade", description = "Cria uma nova especialidade médica")
    public ResponseEntity<DadosDetalhamentoEspecialidade> cadastrar(
            @RequestBody @Valid DadosCadastroEspecialidade dados,
            UriComponentsBuilder uriBuilder) {
        var especialidade = especialidadeService.criar(dados);
        var uri = uriBuilder.path("/especialidades/{id}").buildAndExpand(especialidade.id()).toUri();
        return ResponseEntity.created(uri).body(especialidade);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_FUNCIONARIO', 'ROLE_MEDICO', 'ROLE_AUDITOR', 'ROLE_GESTOR')")
    @Operation(summary = "Listar especialidades", description = "Retorna todas as especialidades ativas (paginado)")
    public ResponseEntity<Page<DadosListagemEspecialidade>> listar(
            @ParameterObject @PageableDefault(size = 20) Pageable paginacao) {
        return ResponseEntity.ok(especialidadeService.listar(paginacao));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_FUNCIONARIO', 'ROLE_MEDICO', 'ROLE_AUDITOR', 'ROLE_GESTOR')")
    @Operation(summary = "Detalhar especialidade", description = "Retorna os detalhes de uma especialidade")
    public ResponseEntity<DadosDetalhamentoEspecialidade> detalhar(@PathVariable Long id) {
        return ResponseEntity.ok(especialidadeService.detalhar(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_FUNCIONARIO')")
    @Operation(summary = "Atualizar especialidade", description = "Atualiza o nome de uma especialidade")
    public ResponseEntity<DadosDetalhamentoEspecialidade> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid DadosAtualizacaoEspecialidade dados) {
        return ResponseEntity.ok(especialidadeService.atualizar(id, dados));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_FUNCIONARIO')")
    @Operation(summary = "Inativar especialidade", description = "Realiza exclusão lógica de uma especialidade")
    public ResponseEntity<Void> inativar(@PathVariable Long id) {
        especialidadeService.inativar(id);
        return ResponseEntity.noContent().build();
    }
}
