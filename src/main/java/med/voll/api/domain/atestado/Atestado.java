package med.voll.api.domain.atestado;

import jakarta.persistence.*;
import lombok.*;
import med.voll.api.domain.prontuario.Prontuario;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Table(name = "atestados")
@Entity(name = "Atestado")
@EntityListeners(AuditingEntityListener.class)
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

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime criadoEm;

    @LastModifiedDate
    private LocalDateTime atualizadoEm;

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
