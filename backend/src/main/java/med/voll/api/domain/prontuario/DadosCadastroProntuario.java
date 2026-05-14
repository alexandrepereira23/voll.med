package med.voll.api.domain.prontuario;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DadosCadastroProntuario(

        @NotNull
        @Schema(example = "1", description = "ID da consulta realizada à qual o prontuário será vinculado")
        Long consultaId,

        @NotBlank
        @Schema(example = "Paciente relata dor de cabeça há 3 dias, associada a febre e coriza.", description = "Anamnese: queixa principal e histórico relatado pelo paciente")
        String anamnese,

        @NotBlank
        @Schema(example = "Sinusite aguda", description = "Diagnóstico do médico (texto livre)")
        String diagnostico,

        @Schema(example = "J01.9", description = "Código CID-10 correspondente ao diagnóstico (opcional)")
        String cid10,

        @Schema(example = "Repouso, hidratação e uso de analgésico conforme prescrição.", description = "Observações e conduta médica (opcional)")
        String observacoes
) {}
