package med.voll.api.domain.medico;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EspecialidadeRepository extends JpaRepository<EspecialidadeEntity, Long> {

    Page<EspecialidadeEntity> findAllByAtivoTrue(Pageable pageable);

    boolean existsByNomeIgnoreCase(String nome);
}
