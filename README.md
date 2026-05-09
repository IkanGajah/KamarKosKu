# Kamar Kos Ku (berganti nama dari Sistem Manajemen Kos)

Sebuah aplikasi terintegrasi (full-stack) untuk mempermudah pengelolaan bisnis kos-kosan atau kontrakan. Sistem ini mendukung multi-cabang, pengelolaan peran pengguna (RBAC), serta pemantauan tagihan dan operasional kos secara waktu nyata (real-time).

## Fitur Utama

- Role-Based Access Control (RBAC): Memiliki sistem otorisasi dan autentikasi aman dengan JWT untuk 3 peran utama:
  - Owner (Pemilik): Akses penuh ke seluruh data cabang, laporan keuangan, dan manajemen pengguna (admin cabang).
  - Admin Cabang: Mengelola data kamar, penyewa, tagihan, dan operasional khusus untuk cabang yang ditugaskan.
  - Penyewa (Tenant): Melihat katalog kamar, status tagihan, dan riwayat pembayaran.
  - Guest: Melihat katalog kamar yang tersedia di berbagai cabang sebelum login.
- Manajemen Multi-Cabang: Pemilik dapat memantau dan mengelola beberapa lokasi kos dalam satu platform.
- Sistem Penagihan Otomatis: Pembuatan dan pemantauan jadwal penagihan sewa secara berkala.
- Katalog Kamar & Ketersediaan: Menampilkan daftar kamar, fasilitas, dan status ketersediaan secara real-time.
- Laporan & Pencatatan Operasional: Mencatat pengeluaran operasional dan menghasilkan laporan keuangan sederhana.

## Teknologi yang Digunakan

Frontend:
- React Native & Expo (Aplikasi Mobile/Web)
- TypeScript
- React Navigation

Backend:
- Java Spring Boot
- Spring Security & JWT (JSON Web Token) untuk Autentikasi
- Spring Data JPA (Hibernate)
- RESTful API

Database & Cloud/Deployment:
- MySQL (di-host di Aiven)
- Microsoft Azure (Hosting Backend)
- GitHub Actions (CI/CD Pipeline)

---

## Panduan Instalasi & Menjalankan Proyek Lokal

### Prasyarat
Pastikan Anda telah menginstal perangkat lunak berikut di komputer Anda:
- Node.js & npm (untuk Frontend Expo)
- Java Development Kit (JDK) 17 atau lebih baru
- Maven (untuk Backend Spring Boot)
- MySQL Server (jika ingin menggunakan database lokal alih-alih cloud)

### 1. Setup Backend (Spring Boot)
1. Buka folder backend:
   cd backend-java

2. Konfigurasi file application.properties di src/main/resources/. Sesuaikan dengan kredensial database Anda:
   spring.datasource.url=jdbc:mysql://[HOST]:[PORT]/[NAMA_DB]?sslMode=REQUIRED
   spring.datasource.username=[USERNAME]
   spring.datasource.password=[PASSWORD]
   jwt.secret=[YOUR_SUPER_SECRET_KEY]

3. Jalankan aplikasi:
   mvn spring-boot:run
   (Backend akan berjalan secara default di http://localhost:8080)

### 2. Setup Frontend (Expo)
1. Buka folder frontend:
   cd frontend-kos

2. Instal semua dependensi:
   npm install

3. Konfigurasi Endpoint API (pastikan URL backend lokal atau cloud sudah benar).

4. Jalankan aplikasi menggunakan Expo:
   npx expo start
   (Pindai QR Code menggunakan aplikasi Expo Go di smartphone Anda, atau tekan 'w' untuk web, 'a' untuk Android)

---

## Struktur Direktori Proyek

manajemen-kos/
├── backend-java/             (Source code Spring Boot REST API)
│   ├── src/main/java/...     (Controllers, Models, Repositories, Security, Services)
│   └── src/main/resources/   (Konfigurasi aplikasi)
│
└── frontend-kos/             (Source code React Native / Expo)
    ├── app/                  (Halaman dan rute aplikasi - Expo Router)
    ├── components/           (Komponen UI)
    └── assets/               (Gambar, ikon, aset)

## Deployment (CI/CD)

Proyek ini telah dikonfigurasi untuk ter-deploy secara otomatis menggunakan GitHub Actions:
- Setiap perubahan yang di-push ke branch main akan di-build dan di-deploy ke Microsoft Azure.
- Database menggunakan layanan terkelola dari Aiven MySQL.

---

Dibuat sebagai bagian dari Praktikum PPLBO.
