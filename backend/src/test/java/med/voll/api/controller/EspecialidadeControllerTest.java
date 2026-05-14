package med.voll.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import med.voll.api.config.MethodSecurityTestConfig;
import med.voll.api.domain.medico.DadosAtualizacaoEspecialidade;
import med.voll.api.domain.medico.DadosCadastroEspecialidade;
import med.voll.api.domain.medico.DadosDetalhamentoEspecialidade;
import med.voll.api.domain.medico.DadosListagemEspecialidade;
import med.voll.api.domain.usuario.Perfil;
import med.voll.api.domain.usuario.Usuario;
import med.voll.api.domain.usuario.UsuarioRepository;
import med.voll.api.infra.security.TokenService;
import med.voll.api.service.EspecialidadeService;
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

@WebMvcTest(EspecialidadeController.class)
@Import(MethodSecurityTestConfig.class)
class EspecialidadeControllerTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean EspecialidadeService especialidadeService;
    @MockBean TokenService tokenService;
    @MockBean UsuarioRepository usuarioRepository;
    @MockBean JpaMetamodelMappingContext jpaMetamodelMappingContext;

    private Usuario usuarioAdmin() {
        return new Usuario(1L, "admin@test.com", "senha", Perfil.ROLE_ADMIN, null);
    }

    private Usuario usuarioFuncionario() {
        return new Usuario(2L, "func@test.com", "senha", Perfil.ROLE_FUNCIONARIO, null);
    }

    private DadosDetalhamentoEspecialidade detalhamento(String nome) {
        return new DadosDetalhamentoEspecialidade(1L, nome, true);
    }

    @Test
    @DisplayName("ROLE_FUNCIONARIO deve cadastrar especialidade e receber 201")
    void deveCadastrarEspecialidadeComFuncionario() throws Exception {
        when(especialidadeService.criar(any())).thenReturn(detalhamento("Neurologia"));

        mvc.perform(post("/especialidades")
                        .with(user(usuarioFuncionario())).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new DadosCadastroEspecialidade("Neurologia"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("Neurologia"));
    }

    @Test
    @DisplayName("ROLE_ADMIN nao deve cadastrar especialidade e deve receber 403")
    void naoDeveCadastrarEspecialidadeComAdmin() throws Exception {
        mvc.perform(post("/especialidades")
                        .with(user(usuarioAdmin())).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new DadosCadastroEspecialidade("Neurologia"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ROLE_FUNCIONARIO deve listar especialidades")
    void deveListarEspecialidadesComFuncionario() throws Exception {
        when(especialidadeService.listar(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(new DadosListagemEspecialidade(1L, "Cardiologia"))));

        mvc.perform(get("/especialidades")
                        .with(user(usuarioFuncionario())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].nome").value("Cardiologia"));
    }

    @Test
    @DisplayName("ROLE_ADMIN nao deve listar especialidades e deve receber 403")
    void naoDeveListarEspecialidadesComAdmin() throws Exception {
        mvc.perform(get("/especialidades")
                        .with(user(usuarioAdmin())))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ROLE_FUNCIONARIO deve detalhar especialidade")
    void deveDetalharEspecialidadeComFuncionario() throws Exception {
        when(especialidadeService.detalhar(1L)).thenReturn(detalhamento("Cardiologia"));

        mvc.perform(get("/especialidades/1")
                        .with(user(usuarioFuncionario())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Cardiologia"));
    }

    @Test
    @DisplayName("ROLE_ADMIN nao deve detalhar especialidade e deve receber 403")
    void naoDeveDetalharEspecialidadeComAdmin() throws Exception {
        mvc.perform(get("/especialidades/1")
                        .with(user(usuarioAdmin())))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ROLE_FUNCIONARIO deve atualizar especialidade e receber 200")
    void deveAtualizarEspecialidadeComFuncionario() throws Exception {
        when(especialidadeService.atualizar(anyLong(), any())).thenReturn(detalhamento("Cardiologia Intervencionista"));

        mvc.perform(put("/especialidades/1")
                        .with(user(usuarioFuncionario())).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new DadosAtualizacaoEspecialidade("Cardiologia Intervencionista"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Cardiologia Intervencionista"));
    }

    @Test
    @DisplayName("ROLE_ADMIN nao deve atualizar especialidade e deve receber 403")
    void naoDeveAtualizarEspecialidadeComAdmin() throws Exception {
        mvc.perform(put("/especialidades/1")
                        .with(user(usuarioAdmin())).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new DadosAtualizacaoEspecialidade("Nome"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ROLE_FUNCIONARIO deve inativar especialidade e receber 204")
    void deveInativarEspecialidadeComFuncionario() throws Exception {
        mvc.perform(delete("/especialidades/1")
                        .with(user(usuarioFuncionario())).with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("ROLE_ADMIN nao deve inativar especialidade e deve receber 403")
    void naoDeveInativarEspecialidadeComAdmin() throws Exception {
        mvc.perform(delete("/especialidades/1")
                        .with(user(usuarioAdmin())).with(csrf()))
                .andExpect(status().isForbidden());
    }
}
