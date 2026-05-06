package com.kos.backend_api.security;

import com.kos.backend_api.PenyewaRepository;
import com.kos.backend_api.models.Penyewa;
import com.kos.backend_api.models.User;
import com.kos.backend_api.models.WebResponse;
import com.kos.backend_api.security.dto.AuthRequest;
import com.kos.backend_api.security.dto.AuthResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PenyewaRepository penyewaRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private com.kos.backend_api.UserRepository userRepository;

    @PostMapping("/login")
    public WebResponse<AuthResponse> authenticateUser(@RequestBody AuthRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        User userPrincipal = (User) authentication.getPrincipal();
        
        // AMBIL ULANG DARI DB UNTUK MEMASTIKAN DATA TERISI (Sapu Bersih)
        User userDetails = userRepository.findByEmail(userPrincipal.getUsername())
                .orElse(userPrincipal);
        
        String jwt = jwtUtils.generateToken(userDetails);
        
        // Ambil role dari authorities (kita kembalikan 1 role dari List)
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        AuthResponse authResponse = new AuthResponse(
                jwt, 
                userDetails.getUsername(), 
                role, 
                userDetails.getNama(), 
                userDetails.getNoTelepon()
        );
        return new WebResponse<>(200, "Login Berhasil", authResponse);
    }

    @PostMapping("/register")
    public WebResponse<Penyewa> registerUser(@RequestBody Penyewa signUpRequest) {
        // Cek username atau email apakah sudah ada
        // Untuk penyederhanaan saat ini, langsung hash password dan save.
        
        Penyewa penyewa = new Penyewa(
                encoder.encode(signUpRequest.getPassword()),
                signUpRequest.getNama(),
                signUpRequest.getNoTelepon(),
                signUpRequest.getEmail(),
                signUpRequest.getNoKtp()
        );

        penyewaRepository.save(penyewa);
        return new WebResponse<>(201, "Registrasi Penyewa Berhasil", penyewa);
    }

    @PutMapping("/change-password")
    public WebResponse<String> changePassword(@RequestParam String oldPassword, @RequestParam String newPassword) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("Akses Ditolak: Harus login untuk mengubah password");
        }

        User userDetails = (User) authentication.getPrincipal();
        
        // Verifikasi password lama
        if (!encoder.matches(oldPassword, userDetails.getPassword())) {
            throw new RuntimeException("Password lama salah");
        }

        User dbUser = userRepository.findById(userDetails.getIdUser())
            .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));

        dbUser.setPassword(encoder.encode(newPassword));
        userRepository.save(dbUser);

        return new WebResponse<>(200, "Password berhasil diubah", "OK");
    }
}
