package med.voll.api.domain.convenio;

public record DadosListagemConvenio(
        Long id,
        String nome,
        String codigoANS,
        TipoConvenio tipo
) {
    public DadosListagemConvenio(Convenio convenio) {
        this(convenio.getId(), convenio.getNome(), convenio.getCodigoANS(), convenio.getTipo());
    }
}
