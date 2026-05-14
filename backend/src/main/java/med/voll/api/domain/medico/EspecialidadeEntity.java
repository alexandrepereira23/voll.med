package med.voll.api.domain.medico;

import jakarta.persistence.*;
import lombok.*;

@Table(name = "especialidades")
@Entity(name = "Especialidade")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class EspecialidadeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private boolean ativo;

    public EspecialidadeEntity(String nome) {
        this.nome = nome;
        this.ativo = true;
    }

    public void atualizar(String novoNome) {
        this.nome = novoNome;
    }

    public void inativar() {
        this.ativo = false;
    }
}
