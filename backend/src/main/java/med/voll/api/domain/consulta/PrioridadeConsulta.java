package med.voll.api.domain.consulta;

public enum PrioridadeConsulta {
    ROTINA,       // antecedência mínima 30 minutos
    PRIORITARIO,  // antecedência mínima 10 minutos
    URGENCIA      // sem restrição de antecedência
}
