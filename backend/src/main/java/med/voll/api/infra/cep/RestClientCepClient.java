package med.voll.api.infra.cep;

import med.voll.api.exception.CepInvalidoException;
import med.voll.api.exception.CepNaoEncontradoException;
import med.voll.api.exception.RespostaInvalidaCepException;
import med.voll.api.exception.ServicoCepIndisponivelException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

@Component
public class RestClientCepClient implements CepClient {

    private static final Logger log = LoggerFactory.getLogger(RestClientCepClient.class);

    private final RestClient restClient;
    private final String uriPath;

    @org.springframework.beans.factory.annotation.Autowired
    public RestClientCepClient(
            @Value("${cep.api.base-url:http://localhost:8081}") String baseUrl,
            @Value("${cep.api.key:}") String apiKey) {

        String sanitizedBase = baseUrl != null ? baseUrl.replaceAll("/+$", "") : "http://localhost:8081";
        if (sanitizedBase.endsWith("/api/v1/ceps")) {
            this.uriPath = "/{cep}/detalhes";
        } else {
            this.uriPath = "/api/v1/ceps/{cep}/detalhes";
        }

        var builder = RestClient.builder().baseUrl(sanitizedBase);
        if (apiKey != null && !apiKey.isBlank()) {
            builder.defaultHeader("X-API-Key", apiKey);
        }
        this.restClient = builder.build();
    }

    // Construtor com visibilidade de pacote para testes unitários com RestClient mockado
    RestClientCepClient(RestClient restClient, String uriPath) {
        this.restClient = restClient;
        this.uriPath = uriPath;
    }

    @Override
    public DadosEnderecoExterno buscarEnderecoPorCep(String cepNormalizado) {
        try {
            var response = restClient.get()
                    .uri(uriPath, cepNormalizado)
                    .retrieve()
                    .body(DadosEnderecoExterno.class);

            if (response == null) {
                throw new RespostaInvalidaCepException("Resposta inválida do serviço de consulta de CEP.");
            }

            return response;
        } catch (HttpClientErrorException.NotFound ex) {
            throw new CepNaoEncontradoException("CEP não encontrado.");
        } catch (HttpClientErrorException.BadRequest ex) {
            throw new CepInvalidoException("CEP inválido. Informe 8 dígitos.");
        } catch (HttpClientErrorException.Unauthorized | HttpClientErrorException.Forbidden ex) {
            log.error("Falha de autenticação ao consultar API externa de CEP (HTTP {}). Verifique a chave de API.", ex.getStatusCode().value());
            throw new RespostaInvalidaCepException("Resposta inválida do serviço de consulta de CEP.");
        } catch (HttpServerErrorException.ServiceUnavailable ex) {
            throw new ServicoCepIndisponivelException("Serviço de consulta de CEP temporariamente indisponível.");
        } catch (ResourceAccessException ex) {
            log.error("Falha de conexão ou timeout ao consultar API de CEP: {}", ex.getMessage());
            throw new ServicoCepIndisponivelException("Serviço de consulta de CEP temporariamente indisponível.");
        } catch (CepNaoEncontradoException | CepInvalidoException | ServicoCepIndisponivelException | RespostaInvalidaCepException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Erro inesperado ao consultar API de CEP: {}", ex.getMessage(), ex);
            throw new RespostaInvalidaCepException("Resposta inválida do serviço de consulta de CEP.");
        }
    }
}
