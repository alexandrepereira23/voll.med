package med.voll.api.domain.paciente;

import med.voll.api.domain.convenio.TipoConvenio;

import java.time.LocalDate;

public record DadosDetalhamentoConvenioPaciente(
        Long id,
        Long pacienteId,
        String nomePaciente,
        Long convenioId,
        String nomeConvenio,
        String codigoANS,
        TipoConvenio tipoConvenio,
        String numeroCarteirinha,
        LocalDate validade
) {
    public DadosDetalhamentoConvenioPaciente(ConvenioPaciente cp) {
        this(
                cp.getId(),
                cp.getPaciente().getId(),
                cp.getPaciente().getNome(),
                cp.getConvenio().getId(),
                cp.getConvenio().getNome(),
                cp.getConvenio().getCodigoANS(),
                cp.getConvenio().getTipo(),
                cp.getNumeroCarteirinha(),
                cp.getValidade()
        );
    }
}
