package med.voll.api.service;

import med.voll.api.domain.consulta.*;
import med.voll.api.domain.usuario.Perfil;
import med.voll.api.domain.usuario.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConsultaService {

    private final AgendaDeConsultas agendaDeConsultas;
    private final ConsultaRepository consultaRepository;

    public ConsultaService(AgendaDeConsultas agendaDeConsultas, ConsultaRepository consultaRepository) {
        this.agendaDeConsultas = agendaDeConsultas;
        this.consultaRepository = consultaRepository;
    }

    @Transactional
    public DadosDetalhamentoConsulta agendar(DadosAgendamentoConsulta dados) {
        return agendaDeConsultas.agendar(dados);
    }

    @Transactional
    public void cancelar(DadosCancelamentoConsulta dados) {
        agendaDeConsultas.cancelar(dados);
    }

    @Transactional(readOnly = true)
    public Page<DadosListagemConsulta> listarAtivas(Pageable paginacao, Usuario usuario) {
        if (usuario.getAuthorities().contains(Perfil.ROLE_MEDICO)) {
            return consultaRepository.findAllByAtivoTrueAndMedicoUsuarioId(paginacao, usuario.getId())
                    .map(DadosListagemConsulta::new);
        }
        return consultaRepository.findAllByAtivoTrue(paginacao).map(DadosListagemConsulta::new);
    }
}