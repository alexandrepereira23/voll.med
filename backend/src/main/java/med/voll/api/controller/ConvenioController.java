package med.voll.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import med.voll.api.domain.convenio.*;
import med.voll.api.service.ConvenioService;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("convenios")
@Tag(name = "Convênios", description = "Endpoints para gerenciamento de convênios e planos de saúde")
public class ConvenioController {

    private final ConvenioService convenioService;

    public ConvenioController(ConvenioService convenioService) {
        this.convenioService = convenioService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_FUNCIONARIO')")
    @Operation(summary = "Cadastrar convênio", description = "Cadastra um novo convênio ou plano de saúde")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Convênio cadastrado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Código ANS já cadastrado ou dados inválidos")
    })
    public ResponseEntity<DadosDetalhamentoConvenio> criar(
            @RequestBody @Valid DadosCadastroConvenio dados,
            UriComponentsBuilder uriBuilder
    ) {
        var convenio = convenioService.criar(dados);
        var uri = uriBuilder.path("/convenios/{id}").buildAndExpand(convenio.id()).toUri();
        return ResponseEntity.created(uri).body(convenio);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_FUNCIONARIO', 'ROLE_MEDICO', 'ROLE_AUDITOR', 'ROLE_GESTOR')")
    @Operation(summary = "Listar convênios", description = "Lista convênios ativos com paginação")
    public ResponseEntity<Page<DadosListagemConvenio>> listar(
            @ParameterObject @PageableDefault(size = 10, sort = "nome") Pageable pageable
    ) {
        return ResponseEntity.ok(convenioService.listar(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_FUNCIONARIO', 'ROLE_MEDICO', 'ROLE_AUDITOR', 'ROLE_GESTOR')")
    @Operation(summary = "Detalhar convênio", description = "Retorna os dados de um convênio")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Convênio encontrado"),
            @ApiResponse(responseCode = "404", description = "Convênio não encontrado")
    })
    public ResponseEntity<DadosDetalhamentoConvenio> detalhar(@PathVariable Long id) {
        return ResponseEntity.ok(convenioService.detalhar(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_FUNCIONARIO')")
    @Operation(summary = "Atualizar convênio", description = "Atualiza o nome do convênio")
    @ApiResponse(responseCode = "200", description = "Convênio atualizado")
    public ResponseEntity<DadosDetalhamentoConvenio> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid DadosAtualizacaoConvenio dados
    ) {
        return ResponseEntity.ok(convenioService.atualizar(id, dados));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_FUNCIONARIO')")
    @Operation(summary = "Inativar convênio", description = "Inativa um convênio (exclusão lógica)")
    @ApiResponse(responseCode = "204", description = "Convênio inativado")
    public ResponseEntity<Void> inativar(@PathVariable Long id) {
        convenioService.inativar(id);
        return ResponseEntity.noContent().build();
    }
}
