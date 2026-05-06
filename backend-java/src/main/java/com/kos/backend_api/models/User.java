package com.kos.backend_api.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "user")
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_user")
    protected int idUser;


    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    protected String password;
    
    @com.fasterxml.jackson.annotation.JsonProperty("nama")
    @Column(name = "nama")
    protected String nama;
    
    @com.fasterxml.jackson.annotation.JsonProperty("noTelepon")
    @Column(name = "no_telepon")
    protected String noTelepon;
    
    @Column(name = "email", unique = true)
    protected String email;

    public User() {}

    public User(String password, String nama, String noTelepon, String email) {
        this.password = password;
        this.nama = nama;
        this.noTelepon = noTelepon;
        this.email = email;
    }

    @JsonIgnore
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String role = "ROLE_USER";
        if (this instanceof Owner) {
            role = "ROLE_OWNER";
        } else if (this instanceof AdminCabang) {
            role = "ROLE_ADMIN";
        } else if (this instanceof Penyewa) {
            role = "ROLE_PENYEWA";
        }
        return List.of(new SimpleGrantedAuthority(role));
    }

    @JsonIgnore
    @Override
    public boolean isAccountNonExpired() { return true; }

    @JsonIgnore
    @Override
    public boolean isAccountNonLocked() { return true; }

    @JsonIgnore
    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @JsonIgnore
    @Override
    public boolean isEnabled() { return true; }

    public int getIdUser() { return idUser; }
    public void setIdUser(int idUser) { this.idUser = idUser; }

    @Override
    public String getUsername() { return email; }

    @Override
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getNama() { return nama; }
    public void setNama(String nama) { this.nama = nama; }

    public String getNoTelepon() { return noTelepon; }
    public void setNoTelepon(String noTelepon) { this.noTelepon = noTelepon; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}