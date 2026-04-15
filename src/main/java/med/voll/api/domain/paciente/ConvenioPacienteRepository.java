package med.voll.api.domain.paciente;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConvenioPacienteRepository extends JpaRepository<ConvenioPaciente, Long> {

    Page<ConvenioPaciente> findAllByPacienteIdAndAtivoTrue(Long pacienteId, Pageable pageable);

    Optional<ConvenioPaciente> findByPacienteIdAndConvenioId(Long pacienteId, Long convenioId);

    boolean existsByPacienteIdAndConvenioIdAndAtivoTrue(Long pacienteId, Long convenioId);
}
