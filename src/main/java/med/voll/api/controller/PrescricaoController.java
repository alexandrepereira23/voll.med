package med.voll.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import med.voll.api.domain.prescricao.*;
import med.voll.api.domain.usuario.Usuario;
import med.voll.api.service.PrescricaoService;
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
@RequestMapping("prescricoes")
@Tag(name = "Prescrições", description = "Endpoints para gerenciamento de prescrições médicas")
public class PrescricaoController {

    private final PrescricaoService prescricaoService;

    public PrescricaoController(PrescricaoService prescricaoService) {
        this.prescricaoService = prescricaoService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_MEDICO')")
    @Operation(summary = "Criar prescrição", description = "Cria uma prescrição vinculada a um prontuário. Apenas o médico responsável pelo prontuário pode criar")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Prescrição criada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou prontuário não encontrado"),
            @ApiResponse(responseCode = "403", description = "Acesso negado — médico não é responsável pelo prontuário")
    })
    public ResponseEntity<DadosDetalhamentoPrescricao> criar(
            @RequestBody @Valid DadosCadastroPrescricao dados,
            @AuthenticationPrincipal Usuario usuario,
            UriComponentsBuilder uriBuilder
    ) {
        var prescricao = prescricaoService.criar(dados, usuario);
        var uri = uriBuilder.path("/prescricoes/{id}").buildAndExpand(prescricao.id()).toUri();
        return ResponseEntity.created(uri).body(prescricao);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalhar prescrição", description = "Retorna os dados completos de uma prescrição, incluindo todos os itens")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Prescrição encontrada"),
            @ApiResponse(responseCode = "403", description = "Acesso negado — médico tentando acessar prescrição de outro"),
            @ApiResponse(responseCode = "404", description = "Prescrição não encontrada")
    })
    public ResponseEntity<DadosDetalhamentoPrescricao> detalhar(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(prescricaoService.detalhar(id, usuario));
    }

    @GetMapping("/prontuario/{prontuarioId}")
    @Operation(summary = "Listar prescrições do prontuário", description = "Lista todas as prescrições ativas de um prontuário. Médico vê apenas as suas")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso"),
            @ApiResponse(responseCode = "403", description = "Acesso negado"),
            @ApiResponse(responseCode = "404", description = "Prontuário não encontrado")
    })
    public ResponseEntity<Page<DadosListagemPrescricao>> listarPorProntuario(
            @PathVariable Long prontuarioId,
            @ParameterObject @PageableDefault(size = 10) Pageable pageable,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return ResponseEntity.ok(prescricaoService.listarPorProntuario(prontuarioId, pageable, usuario));
    }
}
