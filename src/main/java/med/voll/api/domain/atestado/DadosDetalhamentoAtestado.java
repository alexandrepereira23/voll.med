package med.voll.api.domain.atestado;

import java.time.LocalDate;

public record DadosDetalhamentoAtestado(
        Long id,
        Long prontuarioId,
        Integer diasAfastamento,
        String cid10,
        LocalDate dataEmissao,
        String observacoes
) {
    public DadosDetalhamentoAtestado(Atestado atestado) {
        this(
                atestado.getId(),
                atestado.getProntuario().getId(),
                atestado.getDiasAfastamento(),
                atestado.getCid10(),
                atestado.getDataEmissao(),
                atestado.getObservacoes()
        );
    }
}
