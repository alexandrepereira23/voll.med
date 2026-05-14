package med.voll.api.domain.prescricao;

import jakarta.persistence.*;
import lombok.*;

@Table(name = "prescricao_itens")
@Entity(name = "PrescricaoItem")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class PrescricaoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescricao_id")
    private Prescricao prescricao;

    private String medicamento;
    private String dosagem;
    private String posologia;
    private String duracao;

    public PrescricaoItem(Prescricao prescricao, DadosCadastroItemPrescricao dados) {
        this.prescricao = prescricao;
        this.medicamento = dados.medicamento();
        this.dosagem = dados.dosagem();
        this.posologia = dados.posologia();
        this.duracao = dados.duracao();
    }
}
