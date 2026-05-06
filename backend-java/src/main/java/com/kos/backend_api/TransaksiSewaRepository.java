package com.kos.backend_api;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kos.backend_api.models.TransaksiSewa;
import org.springframework.stereotype.Repository;

import com.kos.backend_api.models.enums.StatusBayar;
import java.util.List;

@Repository
public interface TransaksiSewaRepository extends JpaRepository<TransaksiSewa, Integer> {
    Optional<TransaksiSewa> findFirstByKamarIdKamarOrderByTanggalTransaksiDesc(Integer kamarIdKamar);
    List<TransaksiSewa> findByKamarCabangIdCabang(Integer idCabang);
    List<TransaksiSewa> findByPenyewaIdUser(Integer idPenyewa);
    Optional<TransaksiSewa> findByPenyewaIdUserAndKamarIdKamarAndStatusBayar(Integer idPenyewa, Integer idKamar, StatusBayar statusBayar);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(t.nominal), 0) FROM TransaksiSewa t WHERE t.kamar.cabang.idCabang = :cabangId AND t.statusBayar = 'LUNAS' AND MONTH(t.tanggalTransaksi) = :bulan AND YEAR(t.tanggalTransaksi) = :tahun")
    Integer sumPemasukanByCabangBulanTahun(@org.springframework.data.repository.query.Param("cabangId") int cabangId, @org.springframework.data.repository.query.Param("bulan") int bulan, @org.springframework.data.repository.query.Param("tahun") int tahun);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(t.nominal), 0) FROM TransaksiSewa t WHERE t.statusBayar = 'LUNAS' AND MONTH(t.tanggalTransaksi) = :bulan AND YEAR(t.tanggalTransaksi) = :tahun")
    Integer sumTotalPemasukanBulanTahun(@org.springframework.data.repository.query.Param("bulan") int bulan, @org.springframework.data.repository.query.Param("tahun") int tahun);
}