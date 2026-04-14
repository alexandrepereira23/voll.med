package med.voll.api.domain.prescricao;

import java.time.LocalDate;

public record DadosListagemPrescricao(
        Long id,
        Long prontuarioId,
        TipoPrescricao tipo,
        LocalDate dataEmissao,
        LocalDate dataValidade
) {
    public DadosListagemPrescricao(Prescricao prescricao) {
        this(
                prescricao.getId(),
                prescricao.getProntuario().getId(),
                prescricao.getTipo(),
                prescricao.getDataEmissao(),
                prescricao.getDataValidade()
        );
    }
}
