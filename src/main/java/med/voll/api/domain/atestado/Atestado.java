package med.voll.api.domain.atestado;

import jakarta.persistence.*;
import lombok.*;
import med.voll.api.domain.prontuario.Prontuario;

import java.time.LocalDate;

@Table(name = "atestados")
@Entity(name = "Atestado")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Atestado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prontuario_id")
    private Prontuario prontuario;

    private Integer diasAfastamento;
    private String cid10;
    private LocalDate dataEmissao;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    private boolean ativo;

    public Atestado(Prontuario prontuario, DadosCadastroAtestado dados) {
        this.prontuario = prontuario;
        this.diasAfastamento = dados.diasAfastamento();
        this.cid10 = dados.cid10();
        this.dataEmissao = LocalDate.now();
        this.observacoes = dados.observacoes();
        this.ativo = true;
    }

    public void inativar() {
        this.ativo = false;
    }
}
