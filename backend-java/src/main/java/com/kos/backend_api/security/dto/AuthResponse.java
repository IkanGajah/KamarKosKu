package com.kos.backend_api.security.dto;

public class AuthResponse {
    private String token;
    private String username;
    private String role;
    private String nama;
    private String noTelepon;

    public AuthResponse(String token, String username, String role, String nama, String noTelepon) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.nama = nama;
        this.noTelepon = noTelepon;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getNama() { return nama; }
    public void setNama(String nama) { this.nama = nama; }

    public String getNoTelepon() { return noTelepon; }
    public void setNoTelepon(String noTelepon) { this.noTelepon = noTelepon; }
}
