package med.voll.api.domain.prescricao;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record DadosCadastroItemPrescricao(

        @NotBlank
        @Schema(example = "Amoxicilina", description = "Nome do medicamento")
        String medicamento,

        @NotBlank
        @Schema(example = "500mg", description = "Dosagem do medicamento")
        String dosagem,

        @NotBlank
        @Schema(example = "1 cápsula a cada 8 horas", description = "Instruções de uso e frequência")
        String posologia,

        @NotBlank
        @Schema(example = "7 dias", description = "Duração do tratamento")
        String duracao
) {}
