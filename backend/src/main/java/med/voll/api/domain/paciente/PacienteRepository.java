package med.voll.api.domain.paciente;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {
    Page<Paciente> findAllByAtivoTrue(Pageable paginacao);

    @Query(
            value = """
                    SELECT DISTINCT p FROM Consulta c
                    JOIN c.paciente p
                    JOIN c.medico m
                    WHERE p.ativo = true
                      AND c.ativo = true
                      AND m.usuario.id = :usuarioId
                    """,
            countQuery = """
                    SELECT COUNT(DISTINCT p.id) FROM Consulta c
                    JOIN c.paciente p
                    JOIN c.medico m
                    WHERE p.ativo = true
                      AND c.ativo = true
                      AND m.usuario.id = :usuarioId
                    """
    )
    Page<Paciente> findAllAtivosVinculadosAoMedico(Pageable paginacao, @Param("usuarioId") Long usuarioId);

    @Query("""
            SELECT p FROM Consulta c
            JOIN c.paciente p
            JOIN c.medico m
            WHERE p.id = :pacienteId
              AND p.ativo = true
              AND c.ativo = true
              AND m.usuario.id = :usuarioId
            """)
    Optional<Paciente> findAtivoVinculadoAoMedico(
            @Param("pacienteId") Long pacienteId,
            @Param("usuarioId") Long usuarioId);
}
