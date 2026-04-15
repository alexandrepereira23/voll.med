package med.voll.api.service;

import med.voll.api.domain.convenio.*;
import med.voll.api.exception.ValidacaoException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ConvenioService {

    private final ConvenioRepository convenioRepository;

    public ConvenioService(ConvenioRepository convenioRepository) {
        this.convenioRepository = convenioRepository;
    }

    @Transactional
    public DadosDetalhamentoConvenio criar(DadosCadastroConvenio dados) {
        if (convenioRepository.existsByCodigoANS(dados.codigoANS())) {
            throw new ValidacaoException("Já existe um convênio cadastrado com o código ANS informado.");
        }
        var convenio = new Convenio(dados);
        convenioRepository.save(convenio);
        return new DadosDetalhamentoConvenio(convenio);
    }

    @Transactional(readOnly = true)
    public Page<DadosListagemConvenio> listar(Pageable pageable) {
        return convenioRepository.findAllByAtivoTrue(pageable).map(DadosListagemConvenio::new);
    }

    @Transactional(readOnly = true)
    public DadosDetalhamentoConvenio detalhar(Long id) {
        var convenio = buscarAtivo(id);
        return new DadosDetalhamentoConvenio(convenio);
    }

    @Transactional
    public DadosDetalhamentoConvenio atualizar(Long id, DadosAtualizacaoConvenio dados) {
        var convenio = buscarAtivo(id);
        convenio.atualizar(dados);
        return new DadosDetalhamentoConvenio(convenio);
    }

    @Transactional
    public void inativar(Long id) {
        var convenio = buscarAtivo(id);
        convenio.inativar();
    }

    private Convenio buscarAtivo(Long id) {
        var convenio = convenioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Convênio não encontrado"));
        if (!convenio.isAtivo()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Convênio não encontrado");
        }
        return convenio;
    }
}
