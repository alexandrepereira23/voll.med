package med.voll.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import med.voll.api.config.MethodSecurityTestConfig;
import med.voll.api.domain.convenio.TipoConvenio;
import med.voll.api.domain.paciente.DadosCadastroConvenioPaciente;
import med.voll.api.domain.paciente.DadosDetalhamentoConvenioPaciente;
import med.voll.api.domain.usuario.Perfil;
import med.voll.api.domain.usuario.Usuario;
import med.voll.api.domain.usuario.UsuarioRepository;
import med.voll.api.infra.security.TokenService;
import med.voll.api.service.ConvenioPacienteService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ConvenioPacienteController.class)
@Import(MethodSecurityTestConfig.class)
class ConvenioPacienteControllerTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean ConvenioPacienteService convenioPacienteService;
    @MockBean TokenService tokenService;
    @MockBean UsuarioRepository usuarioRepository;
    @MockBean JpaMetamodelMappingContext jpaMetamodelMappingContext;

    private Usuario usuarioFuncionario() {
        return new Usuario(1L, "func@test.com", "senha", Perfil.ROLE_FUNCIONARIO, null);
    }

    private Usuario usuarioAdmin() {
        return new Usuario(2L, "admin@test.com", "senha", Perfil.ROLE_ADMIN, null);
    }

    private DadosCadastroConvenioPaciente dadosCadastro() {
        return new DadosCadastroConvenioPaciente(1L, "0001234567890", LocalDate.of(2027, 12, 31));
    }

    private DadosDetalhamentoConvenioPaciente detalhamento() {
        return new DadosDetalhamentoConvenioPaciente(
                1L, 1L, "Maria", 1L, "Unimed", "123456",
                TipoConvenio.PLANO, "0001234567890", LocalDate.of(2027, 12, 31)
        );
    }

    @Test
    @DisplayName("ROLE_FUNCIONARIO deve associar convenio ao paciente e receber 201")
    void deveAssociarConvenioComFuncionario() throws Exception {
        when(convenioPacienteService.associar(anyLong(), any())).thenReturn(detalhamento());

        mvc.perform(post("/pacientes/1/convenios")
                        .with(user(usuarioFuncionario())).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dadosCadastro())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nomeConvenio").value("Unimed"));
    }

    @Test
    @DisplayName("ROLE_ADMIN nao deve associar convenio ao paciente e deve receber 403")
    void naoDeveAssociarConvenioComAdmin() throws Exception {
        mvc.perform(post("/pacientes/1/convenios")
                        .with(user(usuarioAdmin())).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dadosCadastro())))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ROLE_FUNCIONARIO deve listar convenios do paciente")
    void deveListarConveniosDoPacienteComFuncionario() throws Exception {
        when(convenioPacienteService.listarPorPaciente(anyLong(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(detalhamento())));

        mvc.perform(get("/pacientes/1/convenios")
                        .with(user(usuarioFuncionario())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].nomeConvenio").value("Unimed"));
    }

    @Test
    @DisplayName("ROLE_ADMIN nao deve listar convenios do paciente e deve receber 403")
    void naoDeveListarConveniosDoPacienteComAdmin() throws Exception {
        mvc.perform(get("/pacientes/1/convenios")
                        .with(user(usuarioAdmin())))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ROLE_FUNCIONARIO deve remover convenio do paciente")
    void deveRemoverConvenioDoPacienteComFuncionario() throws Exception {
        mvc.perform(delete("/pacientes/1/convenios/1")
                        .with(user(usuarioFuncionario())).with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("ROLE_ADMIN nao deve remover convenio do paciente e deve receber 403")
    void naoDeveRemoverConvenioDoPacienteComAdmin() throws Exception {
        mvc.perform(delete("/pacientes/1/convenios/1")
                        .with(user(usuarioAdmin())).with(csrf()))
                .andExpect(status().isForbidden());
    }
}
