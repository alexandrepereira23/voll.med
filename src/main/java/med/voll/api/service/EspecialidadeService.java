package med.voll.api.service;

import med.voll.api.domain.medico.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EspecialidadeService {

    private final EspecialidadeRepository especialidadeRepository;

    public EspecialidadeService(EspecialidadeRepository especialidadeRepository) {
        this.especialidadeRepository = especialidadeRepository;
    }

    @Transactional
    public DadosDetalhamentoEspecialidade criar(DadosCadastroEspecialidade dados) {
        if (especialidadeRepository.existsByNomeIgnoreCase(dados.nome())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe uma especialidade com este nome");
        }
        var especialidade = new EspecialidadeEntity(dados.nome());
        especialidadeRepository.save(especialidade);
        return new DadosDetalhamentoEspecialidade(especialidade);
    }

    @Transactional(readOnly = true)
    public Page<DadosListagemEspecialidade> listar(Pageable paginacao) {
        return especialidadeRepository.findAllByAtivoTrue(paginacao)
                .map(DadosListagemEspecialidade::new);
    }

    @Transactional(readOnly = true)
    public DadosDetalhamentoEspecialidade detalhar(Long id) {
        var especialidade = especialidadeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Especialidade não encontrada"));
        return new DadosDetalhamentoEspecialidade(especialidade);
    }

    @Transactional
    public DadosDetalhamentoEspecialidade atualizar(Long id, DadosAtualizacaoEspecialidade dados) {
        var especialidade = especialidadeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Especialidade não encontrada"));
        especialidade.atualizar(dados.nome());
        return new DadosDetalhamentoEspecialidade(especialidade);
    }

    @Transactional
    public void inativar(Long id) {
        var especialidade = especialidadeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Especialidade não encontrada"));
        especialidade.inativar();
    }
}
