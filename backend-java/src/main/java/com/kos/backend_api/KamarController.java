package com.kos.backend_api;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kos.backend_api.models.Kamar;
import com.kos.backend_api.models.KamarDetailDTO;
import com.kos.backend_api.models.WebResponse;
import com.kos.backend_api.models.AdminCabang;
import com.kos.backend_api.models.enums.StatusKamar;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;

@RestController
@RequestMapping("/api/kamar")
public class KamarController {

    @Autowired
    private KamarRepository kamarRepository;

    @Autowired
    private TransaksiSewaRepository transaksiSewaRepository;

    @Autowired
    private RiwayatSewaRepository riwayatSewaRepository;

    @Autowired
    private AdminCabangRepository adminCabangRepository;

    @GetMapping
    public WebResponse<List<Kamar>> getAll() {
        List<Kamar> data = kamarRepository.findByStatusKetersediaanNot(StatusKamar.NONAKTIF);
        populateNamaPenyewa(data);
        return new WebResponse<>(200, "Berhasil mengambil data kamar", data);
    }

    @GetMapping("/cabang/{cabangId}")
    public WebResponse<List<Kamar>> getByCabang(@PathVariable("cabangId") int cabangId) {
        List<Kamar> data = kamarRepository.findByCabangIdCabangAndStatusKetersediaanNot(cabangId, StatusKamar.NONAKTIF);
        populateNamaPenyewa(data);
        return new WebResponse<>(200, "Berhasil mengambil data kamar di cabang ini", data);
    }

    @GetMapping("/{id}")
    public WebResponse<KamarDetailDTO> getById(@PathVariable("id") int id) {
        Kamar kamar = kamarRepository.findById(id).orElse(null);
        if (kamar == null) {
            return new WebResponse<>(404, "Kamar tidak ditemukan", null);
        }

        KamarDetailDTO dto = new KamarDetailDTO();
        dto.setId(kamar.getIdKamar());
        dto.setNomorKamar(kamar.getNomorKamar());
        dto.setFasilitas(kamar.getFasilitas() != null ? kamar.getFasilitas().name() : null);
        dto.setHarga(kamar.getHargaSewa());
        dto.setStatus(kamar.getStatusKetersediaan() != null ? kamar.getStatusKetersediaan().name() : null);
        dto.setFoto(kamar.getFoto());
        
        if (kamar.getCabang() != null) {
            adminCabangRepository.findByCabangIdCabang(kamar.getCabang().getIdCabang())
                .ifPresent(admin -> {
                    dto.setNamaAdmin(admin.getNama());
                    dto.setNoTeleponAdmin(admin.getNoTelepon());
                });
        }

        if (StatusKamar.PENUH.equals(kamar.getStatusKetersediaan())) {
            var transaksiOpt = transaksiSewaRepository.findFirstByKamarIdKamarOrderByTanggalTransaksiDesc(id);
            if (transaksiOpt.isPresent()) {
                var transaksi = transaksiOpt.get();
                dto.setNamaPenyewa(transaksi.getPenyewa().getNama());
                dto.setTempoBayar(transaksi.getTanggalTransaksi().plusMonths(1).toString()); // Default 1 month
            }
        }

        return new WebResponse<>(200, "Detail kamar berhasil diambil", dto);
    }

    private void validateAdminCabangAccess(Integer kamarCabangId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated())
            return;

        Object principal = auth.getPrincipal();
        if (principal instanceof AdminCabang admin) {
            if (admin.getCabang() == null || admin.getCabang().getIdCabang() != kamarCabangId) {
                throw new AccessDeniedException(
                        "Akses Ditolak: Anda hanya berhak mengelola kamar di cabang Anda sendiri.");
            }
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public WebResponse<Kamar> create(@RequestBody Kamar request) {
        if (request.getCabang() != null) {
            validateAdminCabangAccess(request.getCabang().getIdCabang());
        }
        Kamar data = kamarRepository.save(request);
        return new WebResponse<>(201, "Kamar berhasil ditambahkan", data);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public WebResponse<Kamar> update(@PathVariable int id, @RequestBody Kamar request) {
        return kamarRepository.findById(id).map(kamar -> {
            validateAdminCabangAccess(kamar.getCabang().getIdCabang());
            if (request.getCabang() != null) {
                validateAdminCabangAccess(request.getCabang().getIdCabang());
            }
            kamar.setNomorKamar(request.getNomorKamar());
            kamar.setFasilitas(request.getFasilitas());
            kamar.setHargaSewa(request.getHargaSewa());
            kamar.setStatusKetersediaan(request.getStatusKetersediaan());
            kamarRepository.save(kamar);
            return new WebResponse<>(200, "Data berhasil diupdate", kamar);
        }).orElseThrow(() -> new RuntimeException("Kamar tidak ditemukan"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public WebResponse<String> delete(@PathVariable int id) {
        return kamarRepository.findById(id).map(kamar -> {
            validateAdminCabangAccess(kamar.getCabang().getIdCabang());
            kamar.setStatusKetersediaan(StatusKamar.NONAKTIF);
            kamarRepository.save(kamar);
            return new WebResponse<>(200, "Kamar berhasil dinonaktifkan", "OK");
        }).orElseThrow(() -> new RuntimeException("Kamar tidak ditemukan"));
    }

    private void populateNamaPenyewa(List<Kamar> data) {
        for (Kamar kamar : data) {
            if (StatusKamar.PENUH.equals(kamar.getStatusKetersediaan())) {
                var transaksi = transaksiSewaRepository.findFirstByKamarIdKamarOrderByTanggalTransaksiDesc(kamar.getIdKamar());
                if (transaksi.isPresent()) {
                    kamar.setNamaPenyewa(transaksi.get().getPenyewa().getNama());
                } else {
                    // Fallback ke RiwayatSewa jika di transaksi tidak ada
                    riwayatSewaRepository.findFirstByKamarIdKamarOrderByTanggalMasukDesc(kamar.getIdKamar())
                        .ifPresent(r -> kamar.setNamaPenyewa(r.getPenyewa().getNama()));
                }
            }
        }
    }
}