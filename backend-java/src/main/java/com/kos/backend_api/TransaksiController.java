package com.kos.backend_api;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kos.backend_api.models.Kamar;
import com.kos.backend_api.models.Penyewa;
import com.kos.backend_api.models.TransaksiSewa;
import com.kos.backend_api.models.WebResponse;
import com.kos.backend_api.models.User;
import com.kos.backend_api.models.Owner;
import com.kos.backend_api.models.AdminCabang;
import com.kos.backend_api.models.enums.StatusKamar;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;

@RestController
@RequestMapping("/api/transaksi")
public class TransaksiController {

    @Autowired
    private TransaksiSewaRepository transaksiRepository;

    @Autowired
    private KamarRepository kamarRepository;

    @Autowired
    private PenyewaRepository penyewaRepository;

    @Autowired
    private AdminCabangRepository adminCabangRepository;

    private void validateAdminCabangAccess(Integer kamarCabangId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return;
        
        Object principal = auth.getPrincipal();
        if (principal instanceof AdminCabang admin) {
            if (admin.getCabang() == null || admin.getCabang().getIdCabang() != kamarCabangId) {
                throw new AccessDeniedException("Akses Ditolak: Anda hanya berhak mengelola transaksi di cabang Anda sendiri.");
            }
        }
    }

    @PostMapping("/check-in")
    @PreAuthorize("isAuthenticated()")
    public WebResponse<TransaksiSewa> checkIn(@RequestBody TransaksiSewa request) {
        Kamar kamar = kamarRepository.findById(request.getKamar().getIdKamar())
                .orElseThrow(() -> new RuntimeException("Kamar tidak ditemukan"));

        validateAdminCabangAccess(kamar.getCabang().getIdCabang());

        if (!StatusKamar.TERSEDIA.equals(kamar.getStatusKetersediaan())) {
            throw new RuntimeException("Kamar sedang tidak tersedia!");
        }

        Penyewa penyewa = request.getPenyewa();
        if (penyewa.getIdUser() == 0) {
            penyewa = penyewaRepository.save(penyewa);
            request.setPenyewa(penyewa); 
        } else {
            penyewaRepository.findById(penyewa.getIdUser())
                .orElseThrow(() -> new RuntimeException("Data penyewa tidak ditemukan"));
        }
    
        if (request.getTanggalTransaksi() == null) {
            request.setTanggalTransaksi(java.time.LocalDate.now());
        }
        if (request.getJatuhTempo() == null) {
            request.setJatuhTempo(request.getTanggalTransaksi().plusMonths(1));
        }

        kamar.setStatusKetersediaan(StatusKamar.PENUH);
        kamarRepository.save(kamar);

        TransaksiSewa baru = transaksiRepository.save(request);

        return new WebResponse<>(201, "Check-in berhasil! Status kamar telah diperbarui.", baru);
    }

    @PostMapping("/booking")
    @PreAuthorize("hasRole('PENYEWA')")
    public WebResponse<TransaksiSewa> booking(@RequestBody TransaksiSewa request) {
        if (request.getKamar() == null || request.getKamar().getIdKamar() == 0) {
            throw new RuntimeException("ID Kamar tidak valid atau tidak ditemukan dalam request!");
        }

        Kamar kamar = kamarRepository.findById(request.getKamar().getIdKamar())
                .orElseThrow(() -> new RuntimeException("Kamar dengan ID " + request.getKamar().getIdKamar() + " tidak ditemukan"));

        if (!StatusKamar.TERSEDIA.equals(kamar.getStatusKetersediaan())) {
            throw new RuntimeException("Kamar sedang tidak tersedia!");
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();

        Penyewa penyewa = penyewaRepository.findById(user.getIdUser())
            .orElseGet(() -> penyewaRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> new RuntimeException("Data profil penyewa tidak ditemukan. Pastikan Anda sudah terdaftar sebagai penyewa.")));

        // Cek apakah sudah ada booking PENDING untuk kamar ini oleh penyewa ini
        java.util.Optional<TransaksiSewa> existing = transaksiRepository.findByPenyewaIdUserAndKamarIdKamarAndStatusBayar(
            penyewa.getIdUser(), kamar.getIdKamar(), com.kos.backend_api.models.enums.StatusBayar.PENDING
        );
        if (existing.isPresent()) {
            throw new RuntimeException("Anda sudah memiliki pesanan yang menunggu konfirmasi untuk kamar ini.");
        }

        request.setPenyewa(penyewa);
        request.setKamar(kamar);
        request.setStatusBayar(com.kos.backend_api.models.enums.StatusBayar.PENDING);

        if (request.getTanggalTransaksi() == null) {
            request.setTanggalTransaksi(java.time.LocalDate.now());
        }
        if (request.getJatuhTempo() == null) {
            request.setJatuhTempo(request.getTanggalTransaksi().plusMonths(1));
        }

        // Jangan ubah status kamar dulu, tunggu konfirmasi admin

        TransaksiSewa baru = transaksiRepository.save(request);

        return new WebResponse<>(201, "Booking berhasil! Menunggu konfirmasi admin.", baru);
    }

    @PostMapping("/check-out/{idTransaksi}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public WebResponse<String> checkOut(@PathVariable int idTransaksi) {
        TransaksiSewa transaksi = transaksiRepository.findById(idTransaksi)
                .orElseThrow(() -> new RuntimeException("Data transaksi tidak ditemukan"));

        Kamar kamar = transaksi.getKamar();
        validateAdminCabangAccess(kamar.getCabang().getIdCabang());

        if (StatusKamar.TERSEDIA.equals(kamar.getStatusKetersediaan())) {
            throw new RuntimeException("Kamar ini sudah berstatus Tersedia dan tidak sedang disewa.");
        }

        kamar.setStatusKetersediaan(StatusKamar.TERSEDIA);
        kamarRepository.save(kamar);

        return new WebResponse<>(200, "Check-out berhasil! Kamar telah kembali Tersedia.", "OK");
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public WebResponse<List<TransaksiSewa>> getAll() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        
        List<TransaksiSewa> data;
        if (user instanceof Owner) {
            data = transaksiRepository.findAll();
        } else if (user instanceof AdminCabang admin) {
            data = transaksiRepository.findByKamarCabangIdCabang(admin.getCabang().getIdCabang());
        } else if (user instanceof Penyewa penyewa) {
            data = transaksiRepository.findByPenyewaIdUser(penyewa.getIdUser());
        } else {
            throw new AccessDeniedException("Akses ditolak");
        }
        
        populateAdminInfo(data);
        
        return new WebResponse<>(200, "Daftar transaksi berhasil diambil", data);
    }

    private void populateAdminInfo(List<TransaksiSewa> data) {
        for (TransaksiSewa t : data) {
            if (t.getKamar() != null && t.getKamar().getCabang() != null) {
                adminCabangRepository.findByCabangIdCabang(t.getKamar().getCabang().getIdCabang())
                    .ifPresent(admin -> {
                        t.setNamaAdmin(admin.getNama());
                        t.setNoTeleponAdmin(admin.getNoTelepon());
                    });
            }
        }
    }

    @PutMapping("/{idTransaksi}/bayar-online")
    @PreAuthorize("hasRole('PENYEWA')")
    public WebResponse<TransaksiSewa> bayarOnline(@PathVariable int idTransaksi) {
        TransaksiSewa transaksi = transaksiRepository.findById(idTransaksi)
                .orElseThrow(() -> new RuntimeException("Data transaksi tidak ditemukan"));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();

        if (transaksi.getPenyewa().getIdUser() != user.getIdUser()) {
            throw new AccessDeniedException("Akses Ditolak: Ini bukan transaksi Anda.");
        }

        transaksi.setStatusBayar(com.kos.backend_api.models.enums.StatusBayar.LUNAS);
        transaksiRepository.save(transaksi);

        return new WebResponse<>(200, "Pembayaran online berhasil (MOCK)", transaksi);
    }

    @PutMapping("/{idTransaksi}/konfirmasi-manual")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public WebResponse<TransaksiSewa> konfirmasiManual(@PathVariable int idTransaksi) {
        TransaksiSewa transaksi = transaksiRepository.findById(idTransaksi)
                .orElseThrow(() -> new RuntimeException("Data transaksi tidak ditemukan"));

        validateAdminCabangAccess(transaksi.getKamar().getCabang().getIdCabang());

        transaksi.setStatusBayar(com.kos.backend_api.models.enums.StatusBayar.LUNAS);
        
        Kamar kamar = transaksi.getKamar();
        kamar.setStatusKetersediaan(StatusKamar.PENUH);
        kamarRepository.save(kamar);
        
        transaksiRepository.save(transaksi);

        return new WebResponse<>(200, "Pembayaran manual berhasil dikonfirmasi dan kamar sekarang terisi", transaksi);
    }
}