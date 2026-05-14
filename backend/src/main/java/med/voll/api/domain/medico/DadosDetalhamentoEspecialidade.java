package med.voll.api.domain.medico;

public record DadosDetalhamentoEspecialidade(Long id, String nome, boolean ativo) {

    public DadosDetalhamentoEspecialidade(EspecialidadeEntity especialidade) {
        this(especialidade.getId(), especialidade.getNome(), especialidade.isAtivo());
    }
}
