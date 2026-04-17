package med.voll.api.domain.medico;

public record DadosListagemEspecialidade(Long id, String nome) {

    public DadosListagemEspecialidade(EspecialidadeEntity especialidade) {
        this(especialidade.getId(), especialidade.getNome());
    }
}
