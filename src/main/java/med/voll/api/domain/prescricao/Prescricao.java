package med.voll.api.domain.prescricao;

import jakarta.persistence.*;
import lombok.*;
import med.voll.api.domain.prontuario.Prontuario;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Table(name = "prescricoes")
@Entity(name = "Prescricao")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Prescricao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prontuario_id")
    private Prontuario prontuario;

    @Enumerated(EnumType.STRING)
    private TipoPrescricao tipo;

    private LocalDate dataEmissao;
    private LocalDate dataValidade;
    private boolean ativo;

    @OneToMany(mappedBy = "prescricao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PrescricaoItem> itens = new ArrayList<>();

    public Prescricao(Prontuario prontuario, TipoPrescricao tipo) {
        this.prontuario = prontuario;
        this.tipo = tipo;
        this.dataEmissao = LocalDate.now();
        this.dataValidade = tipo == TipoPrescricao.ESPECIAL
                ? dataEmissao.plusDays(60)
                : dataEmissao.plusDays(30);
        this.ativo = true;
    }

    public void adicionarItens(List<DadosCadastroItemPrescricao> dadosItens) {
        dadosItens.forEach(d -> this.itens.add(new PrescricaoItem(this, d)));
    }

    public void inativar() {
        this.ativo = false;
    }
}
