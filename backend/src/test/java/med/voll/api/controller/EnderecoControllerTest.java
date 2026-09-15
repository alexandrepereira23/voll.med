package med.voll.api.controller;

import med.voll.api.config.MethodSecurityTestConfig;
import med.voll.api.domain.endereco.DadosEnderecoCep;
import med.voll.api.domain.usuario.Perfil;
import med.voll.api.domain.usuario.Usuario;
import med.voll.api.domain.usuario.UsuarioRepository;
import med.voll.api.exception.CepInvalidoException;
import med.voll.api.exception.CepNaoEncontradoException;
import med.voll.api.exception.RespostaInvalidaCepException;
import med.voll.api.exception.ServicoCepIndisponivelException;
import med.voll.api.infra.security.TokenService;
import med.voll.api.service.ConsultaCepService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EnderecoController.class)
@Import(MethodSecurityTestConfig.class)
class EnderecoControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private ConsultaCepService consultaCepService;

    @MockBean
    private TokenService tokenService;

    @MockBean
    private UsuarioRepository usuarioRepository;

    @MockBean
    private JpaMetamodelMappingContext jpaMetamodelMappingContext;

    private Usuario usuarioFuncionario() {
        return new Usuario(1L, "func@test.com", "senha", Perfil.ROLE_FUNCIONARIO, null);
    }

    private Usuario usuarioAdmin() {
        return new Usuario(2L, "admin@test.com", "senha", Perfil.ROLE_ADMIN, null);
    }

    private Usuario usuarioMedico() {
        return new Usuario(3L, "medico@test.com", "senha", Perfil.ROLE_MEDICO, null);
    }

    private DadosEnderecoCep enderecoExemplo() {
        return new DadosEnderecoCep(
                "01001-000",
                "Praça da Sé",
                "Sé",
                "São Paulo",
                "SP",
                "lado ímpar"
        );
    }

    @Test
    @DisplayName("ROLE_FUNCIONARIO deve consultar CEP e receber 200 OK")
    void deveConsultarCepComFuncionario() throws Exception {
        when(consultaCepService.consultar("01001000")).thenReturn(enderecoExemplo());

        mvc.perform(get("/enderecos/cep/01001000")
                        .with(user(usuarioFuncionario()))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cep").value("01001-000"))
                .andExpect(jsonPath("$.logradouro").value("Praça da Sé"))
                .andExpect(jsonPath("$.bairro").value("Sé"))
                .andExpect(jsonPath("$.cidade").value("São Paulo"))
                .andExpect(jsonPath("$.uf").value("SP"))
                .andExpect(jsonPath("$.complemento").value("lado ímpar"));
    }

    @Test
    @DisplayName("ROLE_ADMIN deve consultar CEP e receber 200 OK")
    void deveConsultarCepComAdmin() throws Exception {
        when(consultaCepService.consultar("01001000")).thenReturn(enderecoExemplo());

        mvc.perform(get("/enderecos/cep/01001000")
                        .with(user(usuarioAdmin()))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cep").value("01001-000"));
    }

    @Test
    @DisplayName("ROLE_MEDICO não deve consultar CEP — deve receber 403 Forbidden")
    void naoDeveConsultarCepComMedico() throws Exception {
        mvc.perform(get("/enderecos/cep/01001000")
                        .with(user(usuarioMedico()))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Requisição não autenticada não deve consultar CEP — deve receber 401 Unauthorized")
    void naoDeveConsultarCepSemAutenticacao() throws Exception {
        mvc.perform(get("/enderecos/cep/01001000")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Deve retornar 400 Bad Request quando CEP for inválido")
    void deveRetornar400QuandoCepInvalido() throws Exception {
        when(consultaCepService.consultar("123"))
                .thenThrow(new CepInvalidoException("CEP inválido. Informe 8 dígitos."));

        mvc.perform(get("/enderecos/cep/123")
                        .with(user(usuarioFuncionario()))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campo").value("cep"))
                .andExpect(jsonPath("$.mensagem").value("CEP inválido. Informe 8 dígitos."));
    }

    @Test
    @DisplayName("Deve retornar 404 Not Found quando CEP não for encontrado")
    void deveRetornar404QuandoCepNaoEncontrado() throws Exception {
        when(consultaCepService.consultar("99999999"))
                .thenThrow(new CepNaoEncontradoException("CEP não encontrado."));

        mvc.perform(get("/enderecos/cep/99999999")
                        .with(user(usuarioFuncionario()))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.campo").value("cep"))
                .andExpect(jsonPath("$.mensagem").value("CEP não encontrado."));
    }

    @Test
    @DisplayName("Deve retornar 503 Service Unavailable quando a API externa estiver indisponível")
    void deveRetornar503QuandoServicoIndisponivel() throws Exception {
        when(consultaCepService.consultar("01001000"))
                .thenThrow(new ServicoCepIndisponivelException("Serviço de consulta de CEP temporariamente indisponível."));

        mvc.perform(get("/enderecos/cep/01001000")
                        .with(user(usuarioFuncionario()))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.campo").value("cep"))
                .andExpect(jsonPath("$.mensagem").value("Serviço de consulta de CEP temporariamente indisponível."));
    }

    @Test
    @DisplayName("Deve retornar 502 Bad Gateway quando a resposta da API externa for inválida")
    void deveRetornar502QuandoRespostaInvalida() throws Exception {
        when(consultaCepService.consultar("01001000"))
                .thenThrow(new RespostaInvalidaCepException("Resposta inválida do serviço de consulta de CEP."));

        mvc.perform(get("/enderecos/cep/01001000")
                        .with(user(usuarioFuncionario()))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.campo").value("cep"))
                .andExpect(jsonPath("$.mensagem").value("Resposta inválida do serviço de consulta de CEP."));
    }
}
