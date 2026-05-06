package com.kos.backend_api;

import com.kos.backend_api.models.AdminCabang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AdminCabangRepository extends JpaRepository<AdminCabang, Integer> {
    Optional<AdminCabang> findByCabangIdCabang(Integer idCabang);
}
