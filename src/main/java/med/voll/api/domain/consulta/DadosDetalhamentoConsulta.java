package med.voll.api.domain.consulta;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

public record DadosDetalhamentoConsulta(
        @Schema(description = "ID da consulta") Long id,
        @Schema(description = "ID do médico") Long idMedico,
        @Schema(description = "ID do paciente") Long idPaciente,
        @Schema(description = "Data e hora da consulta") LocalDateTime data,
        @Schema(description = "Prioridade: ROTINA, PRIORITARIO ou URGENCIA") PrioridadeConsulta prioridade,
        @Schema(description = "Tipo: NORMAL ou RETORNO") TipoConsulta tipo,
        @Schema(description = "ID da consulta original (preenchido apenas quando tipo = RETORNO)") Long consultaOrigemId
) {
    public DadosDetalhamentoConsulta(Consulta consulta) {
        this(
                consulta.getId(),
                consulta.getMedico().getId(),
                consulta.getPaciente().getId(),
                consulta.getDataHora(),
                consulta.getPrioridade(),
                consulta.getTipo(),
                consulta.getConsultaOrigem() != null ? consulta.getConsultaOrigem().getId() : null
        );
    }
}
