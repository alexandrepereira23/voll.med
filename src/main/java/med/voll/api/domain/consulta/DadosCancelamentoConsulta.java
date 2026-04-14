package med.voll.api.domain.consulta;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record DadosCancelamentoConsulta(

        @NotNull
        @Schema(example = "1", description = "ID da consulta a ser cancelada")
        Long idConsulta,

        @NotNull
        @Schema(example = "PACIENTE_DESISTIU", description = "Motivo do cancelamento")
        MotivoCancelamento motivo,

        @Schema(example = "PACIENTE", description = "Quem cancelou a consulta: PACIENTE ou CLINICA (opcional)")
        CanceladoPor canceladoPor
) {
}
