package med.voll.api.domain.consulta;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface ConsultaRepository extends JpaRepository<Consulta, Long> {

    boolean existsByPacienteIdAndDataHoraBetweenAndAtivoTrue(Long idPaciente, LocalDateTime primeiroHorario, LocalDateTime ultimoHorario);

    boolean existsByMedicoIdAndDataHoraAndAtivoTrue(Long idMedico, LocalDateTime dataHora);

    boolean existsByConsultaOrigemId(Long consultaOrigemId);

    @Query("SELECT c FROM Consulta c JOIN FETCH c.medico JOIN FETCH c.paciente WHERE c.ativo = true")
    Page<Consulta> findAllByAtivoTrue(Pageable paginacao);

    @Query("""
        SELECT c FROM Consulta c
        JOIN FETCH c.medico m
        JOIN FETCH c.paciente
        WHERE c.ativo = true AND m.usuario.id = :usuarioId
        """)
    Page<Consulta> findAllByAtivoTrueAndMedicoUsuarioId(Pageable paginacao, @Param("usuarioId") Long usuarioId);
}