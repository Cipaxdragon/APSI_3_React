# 📘 DOKUMENTASI SIDANUS (Versi React SPA)
## Sistem Pendaftaran Ujian — Jurusan Sistem Informasi
### UIN Alauddin Makassar

---

## 1. Tentang Aplikasi

**SIDANUS** (Sistem Pendaftaran Ujian SI) adalah aplikasi berbasis web yang dirancang untuk mengelola seluruh proses **pendaftaran dan penjadwalan ujian akademik** di Jurusan Sistem Informasi, Fakultas Sains dan Teknologi, Universitas Islam Negeri Alauddin Makassar.

Aplikasi ini menangani **3 jenis ujian utama**:

| No | Jenis Ujian | Keterangan |
|----|-------------|------------|
| 1 | **Ujian Proposal (SEMPRO)** | Seminar Proposal — tahap awal penelitian skripsi |
| 2 | **Ujian Hasil** | Seminar Hasil Penelitian — presentasi temuan penelitian |
| 3 | **Ujian Munaqasyah** | Ujian akhir / sidang skripsi — ujian komprehensif akhir |

### Tujuan Utama
- Mendigitalkan proses pendaftaran ujian yang sebelumnya manual (berbasis kertas).
- Mempermudah verifikasi kelengkapan berkas persyaratan mahasiswa.
- Menyediakan sistem penjadwalan ujian yang terintegrasi.
- Memberikan transparansi status pendaftaran secara *real-time* kepada mahasiswa.
- Memudahkan koordinasi antar stakeholder (mahasiswa, admin, kaprodi, penguji).

---

## 2. Arsitektur Aplikasi (Pembaharuan)

Versi ini telah melalui tahap migrasi besar (Refactoring) dari arsitektur *Vanilla HTML/JS Multi-Page* menjadi **Single Page Application (SPA) berbasis React**. Hal ini dilakukan untuk menyelesaikan kendala sinkronisasi data antar halaman dan masalah *null reference DOM rendering* pada versi sebelumnya.

### Teknologi yang Digunakan
| Komponen | Teknologi |
|----------|-----------|
| Frontend | React.js (via Vite) |
| Routing | React Router DOM v6 |
| Styling | TailwindCSS v3 + Custom CSS |
| Iconography | Lucide-React |
| Font | Inter (Google Fonts) |
| Arsitektur | Single Page Application (SPA) |
| State Management | React Context API (`AuthContext`) & Custom Hooks (`useRegistrations`) |
| Data | Sinkronisasi `localStorage` modular (`sidanusDB.js`) |

### Struktur Direktori Proyek Baru

```text
APSI_3_React/
├── index.html                   ← HTML Entry Point
├── package.json                 ← Dependensi proyek (React, Vite, Tailwind)
├── tailwind.config.js           ← Konfigurasi tema dan warna brand SIDANUS
├── vite.config.js               ← Konfigurasi server development Vite
├── src/
│   ├── main.jsx                 ← Entry point React & BrowserRouter
│   ├── App.jsx                  ← Konfigurasi Routing & AuthGuard
│   ├── index.css                ← CSS Dasar & Custom utilities
│   ├── context/
│   │   └── AuthContext.jsx      ← State Management untuk Sesi Login Global
│   ├── db/
│   │   └── sidanusDB.js         ← Controller LocalStorage (Simulasi Database)
│   ├── hooks/
│   │   └── useRegistrations.js  ← Custom Hook untuk mengelola pendaftaran
│   ├── components/
│   │   └── layout/              ← Komponen Layout yang dapat digunakan ulang
│   │       ├── PageHeader.jsx
│   │       ├── MahasiswaSidebar.jsx
│   │       ├── AdminSidebar.jsx
│   │       ├── KaprodiSidebar.jsx
│   │       └── PengujiSidebar.jsx
│   └── pages/                   ← Kumpulan Komponen Halaman
│       ├── LoginPage.jsx
│       ├── JadwalPublikPage.jsx
│       ├── mahasiswa/           ← Portal Mahasiswa
│       │   ├── DashboardPage.jsx
│       │   ├── DaftarUjianPage.jsx
│       │   ├── NotifikasiPage.jsx
│       │   ├── ProfilPage.jsx
│       │   └── SKKelulusanPage.jsx
│       ├── admin/               ← Portal Admin
│       │   ├── DashboardPage.jsx
│       │   ├── PenjadwalanPage.jsx
│       │   ├── KalenderPage.jsx
│       │   └── DatabasePage.jsx
│       ├── kaprodi/             ← Portal Kaprodi
│       │   ├── DashboardPage.jsx
│       │   ├── RiwayatPage.jsx
│       │   └── KalenderPage.jsx
│       └── penguji/             ← Portal Penguji
│           └── DashboardPage.jsx
```

---

## 3. Peran Pengguna (Aktor) & Fitur Utama

Sistem ini memiliki **4 peran pengguna** yang masing-masing memiliki akses dan tanggung jawab berbeda:

### 👨‍🎓 1. Mahasiswa
- **Tugas**: Mendaftarkan ujian, mengunggah berkas, memantau status secara *real-time*.
- **Keunggulan Baru**: 
  - Jenis ujian sudah terkunci otomatis mengikuti perkembangan akademik terakhir mahasiswa.
  - Slot dokumen yang diminta akan beradaptasi secara otomatis berdasarkan tipe ujian.
  - Tracking *timeline* pada Dashboard diperbarui otomatis sejalan dengan perubahan yang dilakukan Admin/Kaprodi.
  - Terdapat **Generator PDF Surat Keterangan Lulus (SKL)** resmi bagi mahasiswa yang telah menyelesaikan ujian Munaqasyah.

### 🛡️ 2. Admin Program Studi
- **Tugas**: Memverifikasi berkas, menjadwalkan ujian, menentukan penguji.
- **Keunggulan Baru**: 
  - Halaman Penjadwalan akan menyeleksi mahasiswa yang berkasnya "disetujui" atau yang jadwal sebelumnya ditolak.
  - Dilengkapi fitur **Auto-Saran Jadwal** untuk menemukan jam, ruangan, dan penguji yang tersedia secara otomatis.
  - Catatan revisi penolakan berkas dari Admin akan langsung muncul di panel Notifikasi Mahasiswa.

### 🏛️ 3. Ketua Program Studi (Kaprodi)
- **Tugas**: Menyetujui atau menolak jadwal & komposisi tim penguji yang diusulkan Admin Prodi.
- **Keunggulan Baru**:
  - Terdapat **Kalender Akademik** interaktif untuk memantau hari libur nasional, agenda kampus, dan kepadatan jadwal ujian.
  - Terdapat **Riwayat Persetujuan** (Log) untuk melacak kembali jadwal mana saja yang pernah disetujui atau ditolak beserta alasan penolakannya.

### 📋 4. Dosen Penguji
- **Tugas**: Melihat jadwal tugas menguji, memeriksa kelengkapan data skripsi mahasiswa yang akan diuji, serta memberikan penilaian.
- **Keunggulan Baru**:
  - Input nilai, catatan revisi, dan penyelesaian ujian dilakukan dengan ringkas melalui sistem *Modal / Pop-up* di Dashboard (Jadwal Menguji).
  - Terdapat halaman **Riwayat Ujian Selesai** untuk mengarsipkan semua data mahasiswa yang pernah diuji beserta nilainya.
  - Kemudahan akses login dengan fitur *Dropdown Datalist* nama dosen penguji.

---

## 4. Alur Kerja Sistem (Workflow)

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        ALUR KERJA SIDANUS                              │
│                                                                         │
│  ┌──────────┐    ┌───────────┐    ┌───────────┐    ┌──────────┐        │
│  │ MAHASISWA│───►│   ADMIN   │───►│  KAPRODI  │───►│ PENGUJI  │        │
│  └──────────┘    └───────────┘    └───────────┘    └──────────┘        │
│                                                                         │
│  1. Daftar &     3. Verifikasi   5. Approval      7. Lihat            │
│     Upload          Berkas          Jadwal            Jadwal            │
│  2. Tracking     4. Penjadwalan  6. Notifikasi    8. Pelaksanaan       │
│     Status          Ujian           ke Mahasiswa      Ujian             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Menjalankan Aplikasi di Perangkat Lokal

Karena SIDANUS sekarang berbasis ekosistem Node.js, berikut adalah cara menjalankannya:

### Persyaratan Sistem
- Terinstal **Node.js** (Minimal versi 16+)
- Git (opsional)

### Langkah Menjalankan
1. Buka Terminal / Command Prompt pada direktori `APSI_3_React`.
2. Jalankan perintah instalasi modul jika baru pertama kali *(hanya dijalankan sekali)*:
   ```bash
   npm install
   ```
3. Jalankan *development server*:
   ```bash
   npm run dev
   ```
4. Aplikasi akan dapat diakses secara lokal lewat browser, biasanya di URL: `http://localhost:5173/` atau `http://localhost:5174/`.

---

## 6. Fitur Teknis Utama (React Highlights)

| Fitur | Implementasi React |
|-------|--------------------|
| **Proteksi Rute (AuthGuard)** | Mengecek *local session*, melempar (*redirect*) pengguna yang tidak sah kembali ke `/login`. |
| **Reaktivitas UI** | State yang otomatis memicu *re-render* pada UI. Menggantikan proses manual sinkronisasi DOM. |
| **Dinamis Rendering Berkas** | Atribut `.map()` pada komponen `DaftarUjianPage` yang mengeluarkan modul *upload file* berdasarkan data konfigurasi dari `sidanusDB.js`. |
| **Reusable Components** | Pemecahan elemen *Sidebar* dan *PageHeader* agar tidak menumpuk di setiap halaman. |

---

## 7. Data Contoh (Simulasi Default)

Jika ingin melakukan tes fungsionalitas, Anda dapat menggunakan integrasi *Demo Login* pada halaman utama, atau menggunakan data bawaan berikut:

### Mahasiswa (NIM)
- **60900121034** (Ahmad Fauzi Ramadhan - *Akan direkomendasikan Ujian Proposal*)
- **60900121005** (Fatimah Az-Zahra - *Akan direkomendasikan Ujian Hasil*)
- **60900120057** (Muhammad Rizal Aditya - *Akan direkomendasikan Ujian Munaqasyah*)

### Pegawai
- Role: **admin**
- Role: **kaprodi**
- Role: **penguji**

### Reset Data
Apabila status *database localStorage* berantakan selama pengujian (semua mahasiswa telah lulus), Anda dapat mengeksekusi `SidanusDB.resetAll()` atau menekan tombol `🔄 Reset Data Simulasi` (jika ada pada antarmuka *Login*) untuk mengembalikan data awal simulasi.

---

> 📌 **Catatan Versi:** Aplikasi ini tetap memegang peran sebagai **prototype frontend tingkat lanjut**. Semua data ditransaksikan menggunakan localStorage (Web Storage API) untuk mendemonstrasikan perilaku *full-stack* pada mata kuliah **APSI (Analisis dan Perancangan Sistem Informasi)**.
