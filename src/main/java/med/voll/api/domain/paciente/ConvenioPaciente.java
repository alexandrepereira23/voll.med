package med.voll.api.domain.paciente;

import jakarta.persistence.*;
import lombok.*;
import med.voll.api.domain.convenio.Convenio;

import java.time.LocalDate;

@Table(name = "convenio_pacientes",
       uniqueConstraints = @UniqueConstraint(columnNames = {"paciente_id", "convenio_id"}))
@Entity(name = "ConvenioPaciente")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class ConvenioPaciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convenio_id")
    private Convenio convenio;

    private String numeroCarteirinha;
    private LocalDate validade;
    private boolean ativo;

    public ConvenioPaciente(Paciente paciente, Convenio convenio, DadosCadastroConvenioPaciente dados) {
        this.paciente = paciente;
        this.convenio = convenio;
        this.numeroCarteirinha = dados.numeroCarteirinha();
        this.validade = dados.validade();
        this.ativo = true;
    }

    public void inativar() {
        this.ativo = false;
    }
}
