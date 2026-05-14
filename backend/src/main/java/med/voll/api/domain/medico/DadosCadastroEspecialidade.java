package med.voll.api.domain.medico;

import jakarta.validation.constraints.NotBlank;

public record DadosCadastroEspecialidade(@NotBlank String nome) {
}
