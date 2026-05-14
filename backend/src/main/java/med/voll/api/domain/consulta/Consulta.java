package med.voll.api.domain.consulta;

import jakarta.persistence.*;
import lombok.*;
import med.voll.api.domain.convenio.Convenio;
import med.voll.api.domain.medico.Medico;
import med.voll.api.domain.paciente.Paciente;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Table(name = "consultas")
@Entity(name = "Consulta")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Consulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Use referências diretas às entidades para integridade e consultas eficientes
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medico_id")
    private Medico medico; // Supondo que você tenha uma classe Medico

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id")
    private Paciente paciente; // Supondo que você tenha uma classe Paciente

    // Tipo ideal para armazenar data e hora com precisão
    private LocalDateTime dataHora;

    // Atributo para gerenciar o cancelamento da consulta
    private boolean ativo = true;

    // Atributo para armazenar o motivo do cancelamento
    @Enumerated(EnumType.STRING)
    private MotivoCancelamento motivoCancelamento; // Deve ser uma ENUM

    @Enumerated(EnumType.STRING)
    private PrioridadeConsulta prioridade;

    @Enumerated(EnumType.STRING)
    private TipoConsulta tipo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consulta_origem_id")
    private Consulta consultaOrigem;

    @Enumerated(EnumType.STRING)
    private CanceladoPor canceladoPor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convenio_id")
    private Convenio convenio;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime criadoEm;

    @LastModifiedDate
    private LocalDateTime atualizadoEm;

    public Consulta(Medico medico, Paciente paciente, LocalDateTime dataHora, PrioridadeConsulta prioridade) {
        this.medico = medico;
        this.paciente = paciente;
        this.dataHora = dataHora;
        this.prioridade = prioridade;
        this.tipo = TipoConsulta.NORMAL;
        this.ativo = true;
    }

    public Consulta(Medico medico, Paciente paciente, LocalDateTime dataHora,
                    PrioridadeConsulta prioridade, Consulta consultaOrigem) {
        this(medico, paciente, dataHora, prioridade);
        this.consultaOrigem = consultaOrigem;
        this.tipo = TipoConsulta.RETORNO;
    }

    public void cancelar(MotivoCancelamento motivo, CanceladoPor canceladoPor) {
        this.ativo = false;
        this.motivoCancelamento = motivo;
        this.canceladoPor = canceladoPor;
    }

    public void setConvenio(Convenio convenio) {
        this.convenio = convenio;
    }

}