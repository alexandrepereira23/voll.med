package med.voll.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import med.voll.api.domain.auditoria.AuditoriaProntuarioRepository;
import med.voll.api.domain.auditoria.DadosListagemAuditoria;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("auditoria")
@Tag(name = "Auditoria LGPD", description = "Endpoints para consulta de logs de acesso a prontuários")
public class AuditoriaController {

    private final AuditoriaProntuarioRepository auditoriaRepository;

    public AuditoriaController(AuditoriaProntuarioRepository auditoriaRepository) {
        this.auditoriaRepository = auditoriaRepository;
    }

    @GetMapping("/prontuarios/{prontuarioId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(
            summary = "Logs de acesso ao prontuário",
            description = "Retorna o histórico de acessos a um prontuário (LGPD). Acesso restrito a ROLE_ADMIN."
    )
    @ApiResponse(responseCode = "200", description = "Histórico retornado com sucesso")
    public ResponseEntity<Page<DadosListagemAuditoria>> listar(
            @PathVariable Long prontuarioId,
            @ParameterObject @PageableDefault(size = 20, sort = "dataHora") Pageable pageable
    ) {
        var page = auditoriaRepository
                .findAllByProntuarioIdOrderByDataHoraDesc(prontuarioId, pageable)
                .map(DadosListagemAuditoria::new);
        return ResponseEntity.ok(page);
    }
}
