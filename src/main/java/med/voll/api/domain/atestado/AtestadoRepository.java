package med.voll.api.domain.atestado;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AtestadoRepository extends JpaRepository<Atestado, Long> {

    Page<Atestado> findAllByAtivoTrueAndProntuarioPacienteId(Long pacienteId, Pageable pageable);

    Page<Atestado> findAllByAtivoTrueAndProntuarioPacienteIdAndProntuarioMedicoId(
            Long pacienteId, Long medicoId, Pageable pageable);
}
