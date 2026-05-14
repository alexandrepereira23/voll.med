package med.voll.api.domain.convenio;

public record DadosDetalhamentoConvenio(
        Long id,
        String nome,
        String codigoANS,
        TipoConvenio tipo,
        boolean ativo
) {
    public DadosDetalhamentoConvenio(Convenio convenio) {
        this(convenio.getId(), convenio.getNome(), convenio.getCodigoANS(), convenio.getTipo(), convenio.isAtivo());
    }
}
