package med.voll.api.domain.atestado;

import java.time.LocalDate;

public record DadosListagemAtestado(
        Long id,
        Long prontuarioId,
        Integer diasAfastamento,
        LocalDate dataEmissao
) {
    public DadosListagemAtestado(Atestado atestado) {
        this(
                atestado.getId(),
                atestado.getProntuario().getId(),
                atestado.getDiasAfastamento(),
                atestado.getDataEmissao()
        );
    }
}
