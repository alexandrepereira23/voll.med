package med.voll.api.service;

import med.voll.api.domain.paciente.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public DadosDetalhamentoPaciente detalhar(Long id) {
        var paciente = pacienteRepository.getReferenceById(id);
        return new DadosDetalhamentoPaciente(paciente);
    }

    @Transactional(readOnly = true)
    public Page<DadosListagemPaciente> listarAtivos(Pageable paginacao) {
        return pacienteRepository.findAllByAtivoTrue(paginacao).map(DadosListagemPaciente::new);
    }
}