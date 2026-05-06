package com.kos.backend_api.models; 

public class KamarDetailDTO {
    private int id;
    private String nomorKamar;
    private String fasilitas;
    private Integer harga;
    private String status;
    private String foto;
    
    private String namaPenyewa; 
    private String tempoBayar;
    private String namaAdmin;
    private String noTeleponAdmin;

    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    public String getNomorKamar() {
        return nomorKamar;
    }
    public void setNomorKamar(String nomorKamar) {
        this.nomorKamar = nomorKamar;
    }
    public String getFasilitas() {
        return fasilitas;
    }
    public void setFasilitas(String fasilitas) {
        this.fasilitas = fasilitas;
    }
    public Integer getHarga() {
        return harga;
    }
    public void setHarga(Integer harga) {
        this.harga = harga;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public String getFoto() {
        return foto;
    }
    public void setFoto(String foto) {
        this.foto = foto;
    }
    public String getNamaPenyewa() {
        return namaPenyewa;
    }
    public void setNamaPenyewa(String namaPenyewa) {
        this.namaPenyewa = namaPenyewa;
    }
    public String getTempoBayar() {
        return tempoBayar;
    }
    public void setTempoBayar(String tempoBayar) {
        this.tempoBayar = tempoBayar;
    }  
    public String setNamaAdmin(String namaAdmin){
        this.namaAdmin = namaAdmin;
    }
    public String setNoTeleponAdmin(String noTeleponAdmin){
        this.noTeleponAdmin = noTeleponAdmin;
    }
    public String getNamaAdmin(){
        return namaAdmin;
    }
    public String getNoTeleponAdmin(){
        return noTeleponAdmin;
    }
}