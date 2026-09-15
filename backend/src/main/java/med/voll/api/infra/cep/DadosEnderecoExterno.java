package med.voll.api.infra.cep;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record DadosEnderecoExterno(
        String cep,
        String logradouro,
        String complemento,
        String bairro,
        String cidade,
        String uf
) {
}
