package med.voll.api.domain.paciente;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import med.voll.api.domain.endereco.DadosEndereco;

public record DadosAtualizacaoPaciente(
        @NotNull
        @Schema(example = "1")
        Long id,
        String nome,
        String telefone,
        DadosEndereco endereco) {

}
