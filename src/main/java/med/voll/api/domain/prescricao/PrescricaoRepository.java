package med.voll.api.domain.prescricao;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrescricaoRepository extends JpaRepository<Prescricao, Long> {

    Page<Prescricao> findAllByAtivoTrueAndProntuarioId(Long prontuarioId, Pageable pageable);

    Page<Prescricao> findAllByAtivoTrueAndProntuarioMedicoId(Long medicoId, Pageable pageable);

    Page<Prescricao> findAllByAtivoTrueAndProntuarioIdAndProntuarioMedicoId(
            Long prontuarioId, Long medicoId, Pageable pageable);
}
