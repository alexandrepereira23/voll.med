package med.voll.api.domain.convenio;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DadosCadastroConvenio(

        @NotBlank
        @Schema(example = "Unimed")
        String nome,

        @NotBlank
        @Schema(example = "123456", description = "Código ANS único do convênio")
        String codigoANS,

        @NotNull
        @Schema(example = "PLANO", description = "PARTICULAR ou PLANO")
        TipoConvenio tipo
) {
}
