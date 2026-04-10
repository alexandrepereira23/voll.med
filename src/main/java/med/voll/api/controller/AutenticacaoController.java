package med.voll.api.controller;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import med.voll.api.domain.usuario.DadosAutenticacao;
import med.voll.api.domain.usuario.DadosCadastroUsuario;
import med.voll.api.domain.usuario.DadosDetalhamentoUsuario;
import med.voll.api.domain.usuario.Perfil;
import med.voll.api.domain.usuario.Usuario;
import med.voll.api.domain.usuario.UsuarioRepository;
import med.voll.api.infra.security.DadosTokenJWT;
import med.voll.api.infra.security.TokenService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@Tag(name = "Autenticação", description = "Endpoints para autenticação e cadastro de usuários")
public class AutenticacaoController {

    private final AuthenticationManager manager;
    private final TokenService tokenService;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AutenticacaoController(AuthenticationManager manager,
                                  TokenService tokenService,
                                  UsuarioRepository usuarioRepository,
                                  PasswordEncoder passwordEncoder) {
        this.manager = manager;
        this.tokenService = tokenService;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    @Operation(summary = "Autenticar usuário", description = "Realiza a autenticação do usuário e retorna o token JWT")
    public ResponseEntity<DadosTokenJWT> autenticar(@RequestBody @Valid DadosAutenticacao dados){
        var authenticationToken = new UsernamePasswordAuthenticationToken(dados.login(), dados.senha());
        var authentication = manager.authenticate(authenticationToken);

        var tokenJWT = tokenService.gerarToken((Usuario) authentication.getPrincipal());
        return ResponseEntity.ok(new DadosTokenJWT(tokenJWT));
    }

    @PostMapping("/cadastro")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Cadastrar novo usuário", description = "Cria um novo usuário. Requer perfil ADMIN. Não é possível criar outro ADMIN por esta rota.")
    public ResponseEntity<DadosDetalhamentoUsuario> cadastrar(@RequestBody @Valid DadosCadastroUsuario dados) {
        if (dados.role() == Perfil.ROLE_ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (usuarioRepository.existsByLogin(dados.login())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        var usuario = new Usuario();
        usuario.setLogin(dados.login());
        usuario.setSenha(passwordEncoder.encode(dados.senha()));
        usuario.setRole(dados.role());

        usuario = usuarioRepository.save(usuario);

        return ResponseEntity.status(HttpStatus.CREATED).body(new DadosDetalhamentoUsuario(usuario));
    }
}
