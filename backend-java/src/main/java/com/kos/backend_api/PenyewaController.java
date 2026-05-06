package com.kos.backend_api;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kos.backend_api.models.Penyewa;
import com.kos.backend_api.models.WebResponse;
import com.kos.backend_api.models.User;
import com.kos.backend_api.models.Owner;
import com.kos.backend_api.models.AdminCabang;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;

@RestController
@RequestMapping("/api/penyewa")
public class PenyewaController {

    @Autowired
    private PenyewaRepository penyewaRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public WebResponse<List<Penyewa>> getAll() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        
        List<Penyewa> data;
        if (user instanceof Owner) {
            data = penyewaRepository.findAll();
        } else if (user instanceof AdminCabang admin) {
            data = penyewaRepository.findPenyewaByCabangId(admin.getCabang().getIdCabang());
        } else {
            throw new AccessDeniedException("Akses ditolak");
        }
        
        return new WebResponse<>(200, "Daftar penyewa berhasil diambil", data);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public WebResponse<Penyewa> create(@RequestBody Penyewa request) {
        Penyewa baru = penyewaRepository.save(java.util.Objects.requireNonNull(request));
        return new WebResponse<>(201, "Penyewa berhasil didaftarkan secara manual", baru);
    }

    @GetMapping("/profil")
    @PreAuthorize("hasRole('PENYEWA')")
    public WebResponse<Penyewa> getProfil() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        Penyewa penyewa = penyewaRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Data penyewa tidak ditemukan"));
        
        return new WebResponse<>(200, "Profil berhasil diambil", penyewa);
    }

    @org.springframework.web.bind.annotation.PutMapping("/profil")
    @PreAuthorize("hasRole('PENYEWA')")
    public WebResponse<Penyewa> updateProfil(@RequestBody Penyewa request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        return penyewaRepository.findByEmail(email).map(penyewa -> {
            if (request.getNama() != null) penyewa.setNama(request.getNama());
            if (request.getNoTelepon() != null) penyewa.setNoTelepon(request.getNoTelepon());
            if (request.getNoKtp() != null) penyewa.setNoKtp(request.getNoKtp());
            
            penyewaRepository.save(java.util.Objects.requireNonNull(penyewa));
            return new WebResponse<>(200, "Profil berhasil diperbarui", penyewa);
        }).orElseThrow(() -> new RuntimeException("Data penyewa tidak ditemukan"));
    }
}