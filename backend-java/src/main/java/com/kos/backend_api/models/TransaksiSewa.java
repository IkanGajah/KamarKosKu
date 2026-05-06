package com.kos.backend_api.models;

import java.time.LocalDate;

import com.kos.backend_api.models.enums.MetodePembayaran;
import com.kos.backend_api.models.enums.StatusBayar;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "transaksi_sewa")
public class TransaksiSewa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idTransaksi;

    @ManyToOne
    @JoinColumn(name = "id_penyewa")
    private Penyewa penyewa;

    @ManyToOne
    @JoinColumn(name = "id_kamar")
    private Kamar kamar;

    private LocalDate tanggalTransaksi;
    private int nominal;
    
    @Enumerated(EnumType.STRING)
    private MetodePembayaran metodePembayaran;
    
    @Enumerated(EnumType.STRING)
    private StatusBayar statusBayar; 

    private LocalDate jatuhTempo;

    @Transient
    private String namaAdmin;

    @Transient
    private String noTeleponAdmin;

    public TransaksiSewa() {}

    public TransaksiSewa(Penyewa penyewa, Kamar kamar, LocalDate tanggalTransaksi, int nominal, MetodePembayaran metodePembayaran, StatusBayar statusBayar, LocalDate jatuhTempo) {
        this.penyewa = penyewa;
        this.kamar = kamar;
        this.tanggalTransaksi = tanggalTransaksi;
        this.nominal = nominal;
        this.metodePembayaran = metodePembayaran;
        this.statusBayar = statusBayar;
        this.jatuhTempo = jatuhTempo;
    }

    public int getIdTransaksi() { return idTransaksi; }
    public void setIdTransaksi(int idTransaksi) { this.idTransaksi = idTransaksi; }

    public Penyewa getPenyewa() { return penyewa; }
    public void setPenyewa(Penyewa penyewa) { this.penyewa = penyewa; }

    public Kamar getKamar() { return kamar; }
    public void setKamar(Kamar kamar) { this.kamar = kamar; }

    public LocalDate getTanggalTransaksi() { return tanggalTransaksi; }
    public void setTanggalTransaksi(LocalDate tanggalTransaksi) { this.tanggalTransaksi = tanggalTransaksi; }

    public int getNominal() { return nominal; }
    public void setNominal(int nominal) { this.nominal = nominal; }

    public MetodePembayaran getMetodePembayaran() { return metodePembayaran; }
    public void setMetodePembayaran(MetodePembayaran metodePembayaran) { this.metodePembayaran = metodePembayaran; }

    public StatusBayar getStatusBayar() { return statusBayar; }
    public void setStatusBayar(StatusBayar statusBayar) { this.statusBayar = statusBayar; }

    public LocalDate getJatuhTempo() { return jatuhTempo; }
    public void setJatuhTempo(LocalDate jatuhTempo) { this.jatuhTempo = jatuhTempo; }

    public void setNamaAdmin(String namaAdmin){ this.namaAdmin = namaAdmin; }
    public String getNamaAdmin(){ return namaAdmin; }
    
    public void setNoTeleponAdmin(String noTeleponAdmin){ this.noTeleponAdmin = noTeleponAdmin; }
    public String getNoTeleponAdmin(){ return noTeleponAdmin; }
}