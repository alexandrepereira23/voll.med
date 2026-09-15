package med.voll.api.infra.cep;

public interface CepClient {
    DadosEnderecoExterno buscarEnderecoPorCep(String cepNormalizado);
}
