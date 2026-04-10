package med.voll.api.domain.consulta;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record DadosAgendamentoConsulta(
        @NotNull
        @Schema(example = "1")
        Long idPaciente,

        @Schema(example = "1")
        Long idMedico,

        @NotNull
        @Future
        @Schema(example = "2024-12-20T10:00:00")
        LocalDateTime data
) {
}
