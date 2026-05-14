package med.voll.api.domain.convenio;

import io.swagger.v3.oas.annotations.media.Schema;

public record DadosAtualizacaoConvenio(

        @Schema(example = "Unimed Nacional")
        String nome
) {
}
