package med.voll.api.infra.cep;

import med.voll.api.exception.CepInvalidoException;
import med.voll.api.exception.CepNaoEncontradoException;
import med.voll.api.exception.RespostaInvalidaCepException;
import med.voll.api.exception.ServicoCepIndisponivelException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class RestClientCepClientTest {

    @Mock
    private RestClient restClient;

    @Mock
    private RestClient.RequestHeadersUriSpec requestHeadersUriSpec;

    @Mock
    private RestClient.RequestHeadersSpec requestHeadersSpec;

    @Mock
    private RestClient.ResponseSpec responseSpec;

    private RestClientCepClient client;

    @BeforeEach
    void setUp() {
        client = new RestClientCepClient(restClient, "/api/v1/ceps/{cep}/detalhes");
        when(restClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(eq("/api/v1/ceps/{cep}/detalhes"), eq("01001000"))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
    }

    @Test
    @DisplayName("Deve retornar DadosEnderecoExterno quando API externa responder 200 OK")
    void deveRetornarEnderecoComSucesso() {
        var mockResponse = new DadosEnderecoExterno(
                "01001-000",
                "Praça da Sé",
                "lado ímpar",
                "Sé",
                "São Paulo",
                "SP"
        );
        when(responseSpec.body(DadosEnderecoExterno.class)).thenReturn(mockResponse);

        var resultado = client.buscarEnderecoPorCep("01001000");

        assertThat(resultado).isNotNull();
        assertThat(resultado.cep()).isEqualTo("01001-000");
        assertThat(resultado.logradouro()).isEqualTo("Praça da Sé");
        assertThat(resultado.cidade()).isEqualTo("São Paulo");
    }

    @Test
    @DisplayName("Deve lançar CepNaoEncontradoException quando API externa retornar 404")
    void deveLancarCepNaoEncontradoQuando404() {
        when(responseSpec.body(DadosEnderecoExterno.class))
                .thenThrow(HttpClientErrorException.create(HttpStatus.NOT_FOUND, "Not Found", HttpHeaders.EMPTY, null, null));

        assertThatThrownBy(() -> client.buscarEnderecoPorCep("01001000"))
                .isInstanceOf(CepNaoEncontradoException.class)
                .hasMessage("CEP não encontrado.");
    }

    @Test
    @DisplayName("Deve lançar CepInvalidoException quando API externa retornar 400")
    void deveLancarCepInvalidoQuando400() {
        when(responseSpec.body(DadosEnderecoExterno.class))
                .thenThrow(HttpClientErrorException.create(HttpStatus.BAD_REQUEST, "Bad Request", HttpHeaders.EMPTY, null, null));

        assertThatThrownBy(() -> client.buscarEnderecoPorCep("01001000"))
                .isInstanceOf(CepInvalidoException.class)
                .hasMessage("CEP inválido. Informe 8 dígitos.");
    }

    @Test
    @DisplayName("Deve lançar RespostaInvalidaCepException quando API externa retornar 401 ou 403 sem vazar chave")
    void deveLancarRespostaInvalidaQuandoFalhaAutenticacaoExterna() {
        when(responseSpec.body(DadosEnderecoExterno.class))
                .thenThrow(HttpClientErrorException.create(HttpStatus.UNAUTHORIZED, "Unauthorized", HttpHeaders.EMPTY, null, null));

        assertThatThrownBy(() -> client.buscarEnderecoPorCep("01001000"))
                .isInstanceOf(RespostaInvalidaCepException.class)
                .hasMessage("Resposta inválida do serviço de consulta de CEP.");
    }

    @Test
    @DisplayName("Deve lançar ServicoCepIndisponivelException quando API externa retornar 503")
    void deveLancarServicoIndisponivelQuando503() {
        when(responseSpec.body(DadosEnderecoExterno.class))
                .thenThrow(HttpServerErrorException.create(HttpStatus.SERVICE_UNAVAILABLE, "Unavailable", HttpHeaders.EMPTY, null, null));

        assertThatThrownBy(() -> client.buscarEnderecoPorCep("01001000"))
                .isInstanceOf(ServicoCepIndisponivelException.class)
                .hasMessage("Serviço de consulta de CEP temporariamente indisponível.");
    }

    @Test
    @DisplayName("Deve lançar ServicoCepIndisponivelException quando houver timeout ou falha de conexão")
    void deveLancarServicoIndisponivelQuandoResourceAccessException() {
        when(responseSpec.body(DadosEnderecoExterno.class))
                .thenThrow(new ResourceAccessException("Connection refused"));

        assertThatThrownBy(() -> client.buscarEnderecoPorCep("01001000"))
                .isInstanceOf(ServicoCepIndisponivelException.class)
                .hasMessage("Serviço de consulta de CEP temporariamente indisponível.");
    }

    @Test
    @DisplayName("Deve lançar RespostaInvalidaCepException quando retorno for nulo")
    void deveLancarRespostaInvalidaQuandoBodyNulo() {
        when(responseSpec.body(DadosEnderecoExterno.class)).thenReturn(null);

        assertThatThrownBy(() -> client.buscarEnderecoPorCep("01001000"))
                .isInstanceOf(RespostaInvalidaCepException.class)
                .hasMessage("Resposta inválida do serviço de consulta de CEP.");
    }
}
