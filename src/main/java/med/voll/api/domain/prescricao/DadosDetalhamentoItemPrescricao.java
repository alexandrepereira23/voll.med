package med.voll.api.domain.prescricao;

public record DadosDetalhamentoItemPrescricao(
        Long id,
        String medicamento,
        String dosagem,
        String posologia,
        String duracao
) {
    public DadosDetalhamentoItemPrescricao(PrescricaoItem item) {
        this(item.getId(), item.getMedicamento(), item.getDosagem(),
                item.getPosologia(), item.getDuracao());
    }
}
