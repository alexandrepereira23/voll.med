package med.voll.api.domain.consulta;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record DadosAgendamentoConsulta(
        @NotNull
        @Schema(example = "1")
        Long idPaciente,

        @Schema(example = "1")
        Long idMedico,

        @NotNull
        @Future
        @Schema(example = "2024-12-20T10:00:00")
        LocalDateTime data,

        @Schema(example = "ROTINA", description = "ROTINA (30 min), PRIORITARIO (10 min) ou URGENCIA (sem restrição). Padrão: ROTINA")
        PrioridadeConsulta prioridade,

        @Schema(example = "1", description = "ID da consulta original. Quando informado, agenda um retorno (não consome a cota diária do paciente)")
        Long consultaOrigemId
) {
}
