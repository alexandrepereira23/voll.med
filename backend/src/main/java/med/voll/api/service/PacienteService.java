package med.voll.api.service;

import med.voll.api.domain.paciente.*;
import med.voll.api.domain.usuario.Perfil;
import med.voll.api.domain.usuario.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PacienteService {

    private final PacienteRepository pacienteRepository;

    public PacienteService(PacienteRepository pacienteRepository) {
        this.pacienteRepository = pacienteRepository;
    }

    @Transactional
    public DadosDetalhamentoPaciente cadastrar(DadosCadastroPaciente dados) {
        var paciente = new Paciente(dados);
        pacienteRepository.save(paciente);
        return new DadosDetalhamentoPaciente(paciente);
    }

    @Transactional
    public DadosDetalhamentoPaciente atualizar(DadosAtualizacaoPaciente dados) {
        var paciente = pacienteRepository.getReferenceById(dados.id());
        paciente.atualizarInformacoes(dados);
        return new DadosDetalhamentoPaciente(paciente);
    }

    @Transactional
    public void excluir(Long id) {
        var paciente = pacienteRepository.getReferenceById(id);
        paciente.excluir();
    }

    @Transactional(readOnly = true)
    public DadosDetalhamentoPaciente detalhar(Long id, Usuario usuario) {
        var paciente = usuario.getAuthorities().contains(Perfil.ROLE_MEDICO)
                ? pacienteRepository.findAtivoVinculadoAoMedico(id, usuario.getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a este paciente"))
                : pacienteRepository.getReferenceById(id);
        return new DadosDetalhamentoPaciente(paciente);
    }

    @Transactional(readOnly = true)
    public Page<DadosListagemPaciente> listarAtivos(Pageable paginacao, Usuario usuario) {
        if (usuario.getAuthorities().contains(Perfil.ROLE_MEDICO)) {
            return pacienteRepository.findAllAtivosVinculadosAoMedico(paginacao, usuario.getId())
                    .map(DadosListagemPaciente::new);
        }
        return pacienteRepository.findAllByAtivoTrue(paginacao).map(DadosListagemPaciente::new);
    }
}
