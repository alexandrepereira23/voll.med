package med.voll.api.domain.convenio;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Table(name = "convenios")
@Entity(name = "Convenio")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Convenio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @Column(name = "codigo_ans", unique = true)
    private String codigoANS;

    @Enumerated(EnumType.STRING)
    private TipoConvenio tipo;

    private boolean ativo;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime criadoEm;

    @LastModifiedDate
    private LocalDateTime atualizadoEm;

    public Convenio(DadosCadastroConvenio dados) {
        this.nome = dados.nome();
        this.codigoANS = dados.codigoANS();
        this.tipo = dados.tipo();
        this.ativo = true;
    }

    public void atualizar(DadosAtualizacaoConvenio dados) {
        if (dados.nome() != null) this.nome = dados.nome();
    }

    public void inativar() {
        this.ativo = false;
    }
}
