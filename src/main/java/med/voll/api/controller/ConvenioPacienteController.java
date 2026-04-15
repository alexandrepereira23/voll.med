package med.voll.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import med.voll.api.domain.paciente.*;
import med.voll.api.service.ConvenioPacienteService;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("pacientes/{pacienteId}/convenios")
@Tag(name = "Convênios do Paciente", description = "Endpoints para vincular convênios a pacientes")
public class ConvenioPacienteController {

    private final ConvenioPacienteService convenioPacienteService;

    public ConvenioPacienteController(ConvenioPacienteService convenioPacienteService) {
        this.convenioPacienteService = convenioPacienteService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_FUNCIONARIO')")
    @Operation(summary = "Associar convênio ao paciente", description = "Vincula um convênio ao cadastro do paciente")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Convênio associado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Paciente ou convênio inativo, ou vínculo já existe"),
            @ApiResponse(responseCode = "404", description = "Paciente ou convênio não encontrado")
    })
    public ResponseEntity<DadosDetalhamentoConvenioPaciente> associar(
            @PathVariable Long pacienteId,
            @RequestBody @Valid DadosCadastroConvenioPaciente dados,
            UriComponentsBuilder uriBuilder
    ) {
        var cp = convenioPacienteService.associar(pacienteId, dados);
        var uri = uriBuilder.path("/pacientes/{pacienteId}/convenios/{id}")
                .buildAndExpand(pacienteId, cp.id()).toUri();
        return ResponseEntity.created(uri).body(cp);
    }

    @GetMapping
    @Operation(summary = "Listar convênios do paciente", description = "Lista todos os convênios ativos de um paciente")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    public ResponseEntity<Page<DadosDetalhamentoConvenioPaciente>> listar(
            @PathVariable Long pacienteId,
            @ParameterObject @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(convenioPacienteService.listarPorPaciente(pacienteId, pageable));
    }

    @DeleteMapping("/{convenioPacienteId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_FUNCIONARIO')")
    @Operation(summary = "Remover convênio do paciente", description = "Remove (inativa) o vínculo de convênio do paciente")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Vínculo removido"),
            @ApiResponse(responseCode = "403", description = "Vínculo não pertence ao paciente informado"),
            @ApiResponse(responseCode = "404", description = "Vínculo não encontrado")
    })
    public ResponseEntity<Void> remover(
            @PathVariable Long pacienteId,
            @PathVariable Long convenioPacienteId
    ) {
        convenioPacienteService.remover(pacienteId, convenioPacienteId);
        return ResponseEntity.noContent().build();
    }
}
