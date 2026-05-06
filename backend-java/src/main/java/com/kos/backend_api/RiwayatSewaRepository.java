package com.kos.backend_api;

import com.kos.backend_api.models.RiwayatSewa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RiwayatSewaRepository extends JpaRepository<RiwayatSewa, Integer> {
    Optional<RiwayatSewa> findFirstByKamarIdKamarOrderByTanggalMasukDesc(int idKamar);
}
