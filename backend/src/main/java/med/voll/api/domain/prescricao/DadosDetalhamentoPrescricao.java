package med.voll.api.domain.prescricao;

import java.time.LocalDate;
import java.util.List;

public record DadosDetalhamentoPrescricao(
        Long id,
        Long prontuarioId,
        TipoPrescricao tipo,
        LocalDate dataEmissao,
        LocalDate dataValidade,
        List<DadosDetalhamentoItemPrescricao> itens
) {
    public DadosDetalhamentoPrescricao(Prescricao prescricao) {
        this(
                prescricao.getId(),
                prescricao.getProntuario().getId(),
                prescricao.getTipo(),
                prescricao.getDataEmissao(),
                prescricao.getDataValidade(),
                prescricao.getItens().stream().map(DadosDetalhamentoItemPrescricao::new).toList()
        );
    }
}
