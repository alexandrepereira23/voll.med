package med.voll.api.domain.ia;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DadosPreDiagnostico(
        @NotNull Long consultaId,
        @NotBlank String sintomas) {
}
