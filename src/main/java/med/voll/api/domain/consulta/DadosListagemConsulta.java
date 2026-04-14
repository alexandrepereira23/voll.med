package med.voll.api.domain.consulta;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

public record DadosListagemConsulta(
        @Schema(description = "ID da consulta") Long id,
        @Schema(description = "Nome do médico") String nomeMedico,
        @Schema(description = "Nome do paciente") String nomePaciente,
        @Schema(description = "Data e hora da consulta") LocalDateTime dataHora,
        @Schema(description = "Prioridade: ROTINA, PRIORITARIO ou URGENCIA") PrioridadeConsulta prioridade,
        @Schema(description = "Tipo: NORMAL ou RETORNO") TipoConsulta tipo
) {
    public DadosListagemConsulta(Consulta consulta) {
        this(
                consulta.getId(),
                consulta.getMedico().getNome(),
                consulta.getPaciente().getNome(),
                consulta.getDataHora(),
                consulta.getPrioridade(),
                consulta.getTipo()
        );
    }
}
