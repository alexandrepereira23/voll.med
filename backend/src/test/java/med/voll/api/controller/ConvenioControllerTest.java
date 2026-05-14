package med.voll.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import med.voll.api.config.MethodSecurityTestConfig;
import med.voll.api.domain.convenio.DadosAtualizacaoConvenio;
import med.voll.api.domain.convenio.DadosCadastroConvenio;
import med.voll.api.domain.convenio.DadosDetalhamentoConvenio;
import med.voll.api.domain.convenio.DadosListagemConvenio;
import med.voll.api.domain.convenio.TipoConvenio;
import med.voll.api.domain.usuario.Perfil;
import med.voll.api.domain.usuario.Usuario;
import med.voll.api.domain.usuario.UsuarioRepository;
import med.voll.api.infra.security.TokenService;
import med.voll.api.service.ConvenioService;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ConvenioController.class)
@Import(MethodSecurityTestConfig.class)
class ConvenioControllerTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean ConvenioService convenioService;
    @MockBean TokenService tokenService;
    @MockBean UsuarioRepository usuarioRepository;
    @MockBean JpaMetamodelMappingContext jpaMetamodelMappingContext;

    private Usuario usuarioFuncionario() {
        return new Usuario(1L, "func@test.com", "senha", Perfil.ROLE_FUNCIONARIO, null);
    }

    private Usuario usuarioAdmin() {
        return new Usuario(2L, "admin@test.com", "senha", Perfil.ROLE_ADMIN, null);
    }

    private DadosCadastroConvenio dadosCadastro() {
        return new DadosCadastroConvenio("Unimed", "123456", TipoConvenio.PLANO);
    }

    private DadosDetalhamentoConvenio detalhamento() {
        return new DadosDetalhamentoConvenio(1L, "Unimed", "123456", TipoConvenio.PLANO, true);
    }

    @Test
    @DisplayName("ROLE_FUNCIONARIO deve cadastrar convenio e receber 201")
    void deveCadastrarConvenioComFuncionario() throws Exception {
        when(convenioService.criar(any())).thenReturn(detalhamento());

        mvc.perform(post("/convenios")
                        .with(user(usuarioFuncionario())).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dadosCadastro())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("Unimed"));
    }

    @Test
    @DisplayName("ROLE_ADMIN nao deve cadastrar convenio e deve receber 403")
    void naoDeveCadastrarConvenioComAdmin() throws Exception {
        mvc.perform(post("/convenios")
                        .with(user(usuarioAdmin())).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dadosCadastro())))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ROLE_FUNCIONARIO deve listar convenios")
    void deveListarConveniosComFuncionario() throws Exception {
        when(convenioService.listar(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(new DadosListagemConvenio(1L, "Unimed", "123456", TipoConvenio.PLANO))));

        mvc.perform(get("/convenios")
                        .with(user(usuarioFuncionario())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].nome").value("Unimed"));
    }

    @Test
    @DisplayName("ROLE_ADMIN nao deve listar convenios e deve receber 403")
    void naoDeveListarConveniosComAdmin() throws Exception {
        mvc.perform(get("/convenios")
                        .with(user(usuarioAdmin())))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ROLE_FUNCIONARIO deve detalhar convenio")
    void deveDetalharConvenioComFuncionario() throws Exception {
        when(convenioService.detalhar(1L)).thenReturn(detalhamento());

        mvc.perform(get("/convenios/1")
                        .with(user(usuarioFuncionario())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Unimed"));
    }

    @Test
    @DisplayName("ROLE_ADMIN nao deve detalhar convenio e deve receber 403")
    void naoDeveDetalharConvenioComAdmin() throws Exception {
        mvc.perform(get("/convenios/1")
                        .with(user(usuarioAdmin())))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ROLE_FUNCIONARIO deve atualizar convenio")
    void deveAtualizarConvenioComFuncionario() throws Exception {
        when(convenioService.atualizar(anyLong(), any())).thenReturn(detalhamento());

        mvc.perform(put("/convenios/1")
                        .with(user(usuarioFuncionario())).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new DadosAtualizacaoConvenio("Unimed Nacional"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Unimed"));
    }

    @Test
    @DisplayName("ROLE_ADMIN nao deve atualizar convenio e deve receber 403")
    void naoDeveAtualizarConvenioComAdmin() throws Exception {
        mvc.perform(put("/convenios/1")
                        .with(user(usuarioAdmin())).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new DadosAtualizacaoConvenio("Unimed Nacional"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ROLE_FUNCIONARIO deve inativar convenio")
    void deveInativarConvenioComFuncionario() throws Exception {
        mvc.perform(delete("/convenios/1")
                        .with(user(usuarioFuncionario())).with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("ROLE_ADMIN nao deve inativar convenio e deve receber 403")
    void naoDeveInativarConvenioComAdmin() throws Exception {
        mvc.perform(delete("/convenios/1")
                        .with(user(usuarioAdmin())).with(csrf()))
                .andExpect(status().isForbidden());
    }
}
