package com.kos.backend_api;

import com.kos.backend_api.models.AdminCabang;
import com.kos.backend_api.models.CabangKos;
import com.kos.backend_api.models.WebResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    @Autowired
    private AdminCabangRepository adminCabangRepository;

    @Autowired
    private CabangKosRepository cabangKosRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @GetMapping("/profile")
    public WebResponse<com.kos.backend_api.models.User> getProfile() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        com.kos.backend_api.models.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));
                
        return new WebResponse<>(200, "Profil berhasil diambil", user);
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public WebResponse<com.kos.backend_api.models.User> updateProfile(@RequestBody ProfileRequest request) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        com.kos.backend_api.models.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));
        
        if (request.getNama() != null) user.setNama(request.getNama());
        if (request.getNoTelepon() != null) user.setNoTelepon(request.getNoTelepon());
        
        com.kos.backend_api.models.User updated = userRepository.save(user);
        return new WebResponse<>(200, "Profil berhasil diupdate", updated);
    }

    public static class ProfileRequest {
        private String nama;
        private String noTelepon;
        public String getNama() { return nama; }
        public void setNama(String nama) { this.nama = nama; }
        public String getNoTelepon() { return noTelepon; }
        public void setNoTelepon(String noTelepon) { this.noTelepon = noTelepon; }
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('OWNER')")
    public WebResponse<List<AdminCabang>> getAllAdmin() {
        return new WebResponse<>(200, "Daftar admin berhasil diambil", adminCabangRepository.findAll());
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('OWNER')")
    public WebResponse<AdminCabang> createAdmin(@RequestBody AdminCabang request) {
        // Validasi Email Unik
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email '" + request.getEmail() + "' sudah terdaftar");
        }

        // Password wajib diisi
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new RuntimeException("Password wajib diisi");
        }

        // Cabang bersifat opsional saat pembuatan awal (bisa diatur nanti di Edit Cabang)
        if (request.getCabang() != null && request.getCabang().getIdCabang() != 0) {
            CabangKos cabang = cabangKosRepository.findById(request.getCabang().getIdCabang())
                    .orElseThrow(() -> new RuntimeException("Cabang Kos tidak ditemukan"));
            request.setCabang(cabang);
        } else {
            request.setCabang(null);
        }

        request.setPassword(encoder.encode(request.getPassword()));

        AdminCabang savedAdmin = adminCabangRepository.save(request);
        return new WebResponse<>(201, "Admin Cabang berhasil dibuat", savedAdmin);
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public WebResponse<String> deleteAdmin(@PathVariable int id) {
        AdminCabang admin = adminCabangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin tidak ditemukan"));
        
        adminCabangRepository.delete(admin);
        return new WebResponse<>(200, "Admin berhasil dihapus", "OK");
    }

    @PutMapping("/admin/{id}/cabang")
    @PreAuthorize("hasRole('OWNER')")
    public WebResponse<AdminCabang> updateAdminCabang(@PathVariable int id, @RequestBody AdminCabang request) {
        AdminCabang admin = adminCabangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin tidak ditemukan"));
        
        if (request.getCabang() == null || request.getCabang().getIdCabang() == 0) {
            admin.setCabang(null);
        } else {
            CabangKos cabang = cabangKosRepository.findById(request.getCabang().getIdCabang())
                    .orElseThrow(() -> new RuntimeException("Cabang Kos tidak ditemukan"));
            admin.setCabang(cabang);
        }
        
        AdminCabang updatedAdmin = adminCabangRepository.save(admin);
        return new WebResponse<>(200, "Cabang admin berhasil diupdate", updatedAdmin);
    }
}
