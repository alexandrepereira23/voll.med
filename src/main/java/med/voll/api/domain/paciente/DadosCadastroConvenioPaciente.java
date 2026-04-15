package med.voll.api.domain.paciente;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record DadosCadastroConvenioPaciente(

        @NotNull
        @Schema(example = "1", description = "ID do convênio")
        Long convenioId,

        @NotBlank
        @Schema(example = "0001234567890")
        String numeroCarteirinha,

        @Schema(example = "2027-12-31", description = "Data de validade da carteirinha (opcional)")
        LocalDate validade
) {
}
