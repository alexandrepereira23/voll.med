package med.voll.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import med.voll.api.domain.atestado.*;
import med.voll.api.domain.usuario.Usuario;
import med.voll.api.service.AtestadoService;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("atestados")
@Tag(name = "Atestados", description = "Endpoints para emissão e consulta de atestados médicos")
public class AtestadoController {

    private final AtestadoService atestadoService;

    public AtestadoController(AtestadoService atestadoService) {
        this.atestadoService = atestadoService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_MEDICO')")
    @Operation(summary = "Emitir atestado", description = "Emite um atestado médico vinculado a um prontuário. Apenas o médico responsável pode emitir")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Atestado emitido com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou prontuário não encontrado"),
            @ApiResponse(responseCode = "403", description = "Acesso negado — médico não é responsável pelo prontuário")
    })
    public ResponseEntity<DadosDetalhamentoAtestado> emitir(
            @RequestBody @Valid DadosCadastroAtestado dados,
            @AuthenticationPrincipal Usuario usuario,
            UriComponentsBuilder uriBuilder
    ) {
        var atestado = atestadoService.emitir(dados, usuario);
        var uri = uriBuilder.path("/atestados/{id}").buildAndExpand(atestado.id()).toUri();
        return ResponseEntity.created(uri).body(atestado);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalhar atestado", description = "Retorna os dados de um atestado. Médico vê apenas os seus")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Atestado encontrado"),
            @ApiResponse(responseCode = "403", description = "Acesso negado — médico tentando acessar atestado de outro"),
            @ApiResponse(responseCode = "404", description = "Atestado não encontrado")
    })
    public ResponseEntity<DadosDetalhamentoAtestado> detalhar(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(atestadoService.detalhar(id, usuario));
    }

    @GetMapping("/paciente/{pacienteId}")
    @Operation(summary = "Histórico de atestados do paciente", description = "Lista os atestados de um paciente. Médico vê apenas os que emitiu")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso"),
            @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    public ResponseEntity<Page<DadosListagemAtestado>> listarPorPaciente(
            @PathVariable Long pacienteId,
            @ParameterObject @PageableDefault(size = 10) Pageable pageable,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(atestadoService.listarPorPaciente(pacienteId, pageable, usuario));
    }
}
