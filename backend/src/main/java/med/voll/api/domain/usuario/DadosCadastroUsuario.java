package med.voll.api.domain.usuario;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DadosCadastroUsuario(
        @NotBlank
        String login,
        @NotBlank
        @Size(min = 8, max = 128, message = "Senha deve ter entre 8 e 128 caracteres")
        String senha,
        @NotNull
        Perfil role,
        Long medicoId
) {
}
