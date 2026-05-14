package med.voll.api.domain.atestado;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record DadosCadastroAtestado(

        @NotNull
        @Schema(example = "1", description = "ID do prontuário ao qual o atestado será vinculado")
        Long prontuarioId,

        @NotNull
        @Min(1)
        @Schema(example = "3", description = "Número de dias de afastamento (mínimo 1)")
        Integer diasAfastamento,

        @Schema(example = "J11.1", description = "Código CID-10 (opcional, a critério do médico)")
        String cid10,

        @Schema(example = "Paciente deve repousar e evitar esforços físicos.", description = "Observações adicionais (opcional)")
        String observacoes
) {}
