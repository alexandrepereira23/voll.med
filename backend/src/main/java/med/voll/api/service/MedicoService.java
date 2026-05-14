package med.voll.api.service;

import med.voll.api.domain.medico.*;
import med.voll.api.domain.usuario.Perfil;
import med.voll.api.domain.usuario.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MedicoService {

    private final MedicoRepository medicoRepository;
    private final EspecialidadeRepository especialidadeRepository;

    public MedicoService(MedicoRepository medicoRepository, EspecialidadeRepository especialidadeRepository) {
        this.medicoRepository = medicoRepository;
        this.especialidadeRepository = especialidadeRepository;
    }

    @Transactional
    public DadosDetalhamentoMedico cadastrar(DadosCadastroMedico dados) {
        var especialidade = especialidadeRepository.getReferenceById(dados.especialidadeId());
        var medico = new Medico(dados, especialidade);
        medicoRepository.save(medico);
        return new DadosDetalhamentoMedico(medico);
    }

    @Transactional
    public DadosDetalhamentoMedico atualizar(DadosAtualizacaoMedico dados) {
        var medico = medicoRepository.getReferenceById(dados.id());
        medico.atualizarInformacoes(dados);
        return new DadosDetalhamentoMedico(medico);
    }

    @Transactional
    public void excluir(Long id) {
        var medico = medicoRepository.getReferenceById(id);
        medico.excluir();
    }

    @Transactional(readOnly = true)
    public DadosDetalhamentoMedico detalhar(Long id) {
        var medico = medicoRepository.getReferenceById(id);
        return new DadosDetalhamentoMedico(medico);
    }

    @Transactional(readOnly = true)
    public Page<DadosListagemMedico> listar(Pageable paginacao, Usuario usuario) {
        if (usuario.getAuthorities().contains(Perfil.ROLE_MEDICO)) {
            return medicoRepository.findAllByAtivoTrueAndUsuarioId(paginacao, usuario.getId())
                    .map(DadosListagemMedico::new);
        }
        return medicoRepository.findAllByAtivoTrue(paginacao).map(DadosListagemMedico::new);
    }
}