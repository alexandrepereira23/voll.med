package med.voll.api.service;

import med.voll.api.exception.CepInvalidoException;
import med.voll.api.exception.CepNaoEncontradoException;
import med.voll.api.exception.RespostaInvalidaCepException;
import med.voll.api.exception.ServicoCepIndisponivelException;
import med.voll.api.infra.cep.CepClient;
import med.voll.api.infra.cep.DadosEnderecoExterno;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ConsultaCepServiceTest {

    @Mock
    private CepClient cepClient;

    @InjectMocks
    private ConsultaCepService service;

    private DadosEnderecoExterno enderecoMock;

    @BeforeEach
    void setUp() {
        enderecoMock = new DadosEnderecoExterno(
                "01001-000",
                "Praça da Sé",
                "lado ímpar",
                "Sé",
                "São Paulo",
                "SP"
        );
    }

    @Test
    @DisplayName("Deve consultar com sucesso quando CEP for válido sem máscara")
    void deveConsultarCepValidoSemMascara() {
        when(cepClient.buscarEnderecoPorCep("01001000")).thenReturn(enderecoMock);

        var resultado = service.consultar("01001000");

        assertThat(resultado).isNotNull();
        assertThat(resultado.cep()).isEqualTo("01001-000");
        assertThat(resultado.logradouro()).isEqualTo("Praça da Sé");
        assertThat(resultado.bairro()).isEqualTo("Sé");
        assertThat(resultado.cidade()).isEqualTo("São Paulo");
        assertThat(resultado.uf()).isEqualTo("SP");
        assertThat(resultado.complemento()).isEqualTo("lado ímpar");
        verify(cepClient).buscarEnderecoPorCep("01001000");
    }

    @Test
    @DisplayName("Deve consultar com sucesso quando CEP for válido com máscara")
    void deveConsultarCepValidoComMascara() {
        when(cepClient.buscarEnderecoPorCep("01001000")).thenReturn(enderecoMock);

        var resultado = service.consultar("01001-000");

        assertThat(resultado).isNotNull();
        assertThat(resultado.cep()).isEqualTo("01001-000");
        verify(cepClient).buscarEnderecoPorCep("01001000");
    }

    @Test
    @DisplayName("Deve preencher complemento como string vazia quando resposta externa vier com complemento nulo")
    void deveTratarComplementoNuloComoStringVazia() {
        var semComplemento = new DadosEnderecoExterno(
                "01001-000",
                "Praça da Sé",
                null,
                "Sé",
                "São Paulo",
                "SP"
        );
        when(cepClient.buscarEnderecoPorCep("01001000")).thenReturn(semComplemento);

        var resultado = service.consultar("01001000");

        assertThat(resultado.complemento()).isEqualTo("");
    }

    @Test
    @DisplayName("Deve lançar CepInvalidoException para CEP nulo ou vazio")
    void deveRejeitarCepNuloOuVazio() {
        assertThatThrownBy(() -> service.consultar(null))
                .isInstanceOf(CepInvalidoException.class)
                .hasMessage("CEP inválido. Informe 8 dígitos.");

        assertThatThrownBy(() -> service.consultar("   "))
                .isInstanceOf(CepInvalidoException.class)
                .hasMessage("CEP inválido. Informe 8 dígitos.");
    }

    @Test
    @DisplayName("Deve lançar CepInvalidoException para CEP incompleto ou com tamanho incorreto")
    void deveRejeitarCepComTamanhoIncorreto() {
        assertThatThrownBy(() -> service.consultar("1234567"))
                .isInstanceOf(CepInvalidoException.class);

        assertThatThrownBy(() -> service.consultar("123456789"))
                .isInstanceOf(CepInvalidoException.class);
    }

    @Test
    @DisplayName("Deve lançar CepInvalidoException para CEP contendo letras ou formato inválido")
    void deveRejeitarCepComLetrasOuFormatoInvalido() {
        assertThatThrownBy(() -> service.consultar("0100100A"))
                .isInstanceOf(CepInvalidoException.class);

        assertThatThrownBy(() -> service.consultar("010-01000"))
                .isInstanceOf(CepInvalidoException.class);
    }

    @Test
    @DisplayName("Deve lançar RespostaInvalidaCepException quando resposta externa for nula")
    void deveLancarRespostaInvalidaSeRetornoExternoForNulo() {
        when(cepClient.buscarEnderecoPorCep("01001000")).thenReturn(null);

        assertThatThrownBy(() -> service.consultar("01001000"))
                .isInstanceOf(RespostaInvalidaCepException.class)
                .hasMessage("Resposta inválida do serviço de consulta de CEP.");
    }

    @Test
    @DisplayName("Deve lançar RespostaInvalidaCepException quando cidade ou UF forem nulos")
    void deveLancarRespostaInvalidaSeCamposEssenciaisFaltarem() {
        var dadosIncompletos = new DadosEnderecoExterno(
                "01001-000",
                "Praça da Sé",
                null,
                "Sé",
                null,
                "SP"
        );
        when(cepClient.buscarEnderecoPorCep("01001000")).thenReturn(dadosIncompletos);

        assertThatThrownBy(() -> service.consultar("01001000"))
                .isInstanceOf(RespostaInvalidaCepException.class);
    }

    @Test
    @DisplayName("Deve propagar CepNaoEncontradoException quando o client lançar")
    void devePropagarCepNaoEncontrado() {
        when(cepClient.buscarEnderecoPorCep("99999999"))
                .thenThrow(new CepNaoEncontradoException("CEP não encontrado."));

        assertThatThrownBy(() -> service.consultar("99999999"))
                .isInstanceOf(CepNaoEncontradoException.class)
                .hasMessage("CEP não encontrado.");
    }

    @Test
    @DisplayName("Deve propagar ServicoCepIndisponivelException quando a API externa estiver fora")
    void devePropagarServicoIndisponivel() {
        when(cepClient.buscarEnderecoPorCep("01001000"))
                .thenThrow(new ServicoCepIndisponivelException("Serviço de consulta de CEP temporariamente indisponível."));

        assertThatThrownBy(() -> service.consultar("01001000"))
                .isInstanceOf(ServicoCepIndisponivelException.class)
                .hasMessage("Serviço de consulta de CEP temporariamente indisponível.");
    }
}
