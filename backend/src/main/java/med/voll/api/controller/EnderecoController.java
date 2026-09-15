package med.voll.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import med.voll.api.domain.endereco.DadosEnderecoCep;
import med.voll.api.service.ConsultaCepService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("enderecos")
@Tag(name = "Endereços", description = "Endpoints para gerenciamento e consulta de endereços")
public class EnderecoController {

    private final ConsultaCepService consultaCepService;

    public EnderecoController(ConsultaCepService consultaCepService) {
        this.consultaCepService = consultaCepService;
    }

    @GetMapping("/cep/{cep}")
    @PreAuthorize("hasAnyRole('FUNCIONARIO', 'ADMIN')")
    @Operation(summary = "Consultar endereço por CEP", description = "Consulta endereço na API integrada a partir de um CEP válido")
    public ResponseEntity<DadosEnderecoCep> consultarCep(@PathVariable String cep) {
        var endereco = consultaCepService.consultar(cep);
        return ResponseEntity.ok(endereco);
    }
}
