package med.voll.api.domain.prescricao;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record DadosCadastroPrescricao(

        @NotNull
        @Schema(example = "1", description = "ID do prontuário ao qual a prescrição será vinculada")
        Long prontuarioId,

        @NotNull
        @Schema(example = "SIMPLES", description = "Tipo da receita: SIMPLES (validade 30 dias) ou ESPECIAL (validade 60 dias)")
        TipoPrescricao tipo,

        @NotNull
        @NotEmpty
        @Valid
        @Schema(description = "Lista de itens da prescrição (ao menos um item obrigatório)")
        List<DadosCadastroItemPrescricao> itens
) {}
