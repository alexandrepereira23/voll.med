package med.voll.api.domain.auditoria;

import java.time.LocalDateTime;

public record DadosListagemAuditoria(
        Long id,
        Long prontuarioId,
        Long usuarioId,
        AcaoAuditoria acao,
        LocalDateTime dataHora,
        String ipOrigem
) {
    public DadosListagemAuditoria(AuditoriaProntuario a) {
        this(a.getId(), a.getProntuarioId(), a.getUsuarioId(), a.getAcao(), a.getDataHora(), a.getIpOrigem());
    }
}
