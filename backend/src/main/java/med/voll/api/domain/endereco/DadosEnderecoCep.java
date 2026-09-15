package med.voll.api.domain.endereco;

public record DadosEnderecoCep(
        String cep,
        String logradouro,
        String bairro,
        String cidade,
        String uf,
        String complemento
) {
}
