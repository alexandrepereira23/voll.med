package med.voll.api.domain.ia;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DadosGerarLaudo(
        @NotNull Long prontuarioId,
        @NotBlank String anotacoes) {
}
