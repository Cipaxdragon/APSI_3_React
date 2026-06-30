
---

## 2. Poin-Poin Catatan & Revisi Sistem

### A. Pengelolaan Berkas dan Dokumen Persyaratan Ujian
* **Perubahan yang Diapresiasi:** Dokumen yang tidak relevan di luar konteks ujian yang ada pada versi sebelumnya telah dihapus. Berkas pendaftaran kini telah disesuaikan dengan aturan berjalan (seperti Proposal, Kartu Kontrol, Transkrip Nilai, SK, Berita Acara, dan Dokumen Munaqasyah).
* **Kekurangan Dokumen yang Harus Dilengkapi:**
  * **Lembar Konsultasi Pembimbing:** Lembar konsultasi untuk Pembimbing 1 dan Pembimbing 2 **wajib tetap ada** dan harus dipastikan menggunakan **berkas asli** (bukan pindaian seadanya atau tanda tangan yang tidak valid).
  * **Lembar Ujian Komprehensif & Hafalan:** Dokumen kelulusan ujian komprehensif beserta bukti/sertifikat hafalan harus dipindahkan dan diintegrasikan ke dalam sistem bagian pendaftaran ini.
  * **Pembedaan Berkas Munaqasyah:** Dokumen persyaratan untuk Ujian Munaqasyah harus dibedakan secara spesifik dari ujian proposal maupun hasil.

### B. Perbaikan Tampilan Antarmuka (UI)
* **Reposisi Elemen Penting:** Komponen atau informasi penting yang sebelumnya berada di bagian bawah layout kini sudah berhasil dipindahkan ke bagian atas.
* **Komentar Dosen:** Perubahan ini dinilai sudah bagus. Dosen menyarankan agar elemen visual tersebut diperbesar (*"kasih besar ya"*) supaya identitas mahasiswa (Nama, NIM) serta Judul Skripsi dapat langsung terlihat jelas oleh pengguna (terutama dosen atau admin) saat pertama kali membuka halaman.

### C. Logika Alur Sistem & Status Mahasiswa (Kritik Utama)
* **Masalah pada Prototipe UI:** Saat simulasi pendaftaran baru di akun mahasiswa, sistem secara otomatis langsung menyorot (*highlight*) menu "Munaqasyah". Secara logika aplikasi berjalan, mahasiswa tidak boleh memilih jenis ujian secara bebas. 
* **Aturan Alur Kontrol yang Benar:** Pilihan jenis ujian harus bersifat sekuensial (berurutan) dan terkunci otomatis berdasarkan status akademik mahasiswa saat itu. 
  * *Contoh:* Jika mahasiswa berada di tahap awal, hanya tombol **Ujian Proposal** yang aktif. Jika telah dinyatakan menyelesaikan proposal, akses pendaftaran ujian proposal otomatis ditutup (*stop*), dan sistem membuka akses untuk pendaftaran **Ujian Hasil**.

### D. Solusi Penyederhanaan Kompleksitas Aplikasi (Rekomendasi Dosen)
* **Masalah Kompleksitas Fitur Penilaian:** Fitur pengisian nilai oleh dosen penguji (yang mencakup penguasaan materi, catatan revisi rinci, input angka, dsb.) dinilai **terlalu kompleks dan panjang** untuk diselesaikan dalam waktu dekat. Jika diintegrasikan sampai ke kalkulasi otomatis ke dashboard mahasiswa, dikhawatirkan aplikasi tidak akan selesai tepat waktu.
* **Solusi dari Dosen:**
  1. **Batasi Ruang Lingkup (Scope):** Jangan memprioritaskan atau mengambil bagian penilaian dosen terlebih dahulu. **Fokuskan sistem sepenuhnya pada Proses Pendaftaran saja.**
  2. **Gunakan Kendali Admin/Kaprodi (Status Toggling):** Daripada sistem mendeteksi kelulusan berdasarkan kalkulasi nilai dosen penguji yang rumit, alihkan logika kontrol tersebut ke halaman **Admin/Kaprodi**.
  3. **Mekanisme Kerja Tombol Kontrol:** * Di dashboard Admin, buatkan tombol penanda status seperti **[Proposal Selesai]** dan **[Hasil Selesai]**.
     * Data dari input admin inilah yang akan dibaca oleh dashboard mahasiswa. Jika admin belum menandai *Proposal Selesai* pada mahasiswa tersebut, maka tombol pendaftaran *Ujian Hasil* dan *Munaqasyah* di akun mahasiswa akan tetap tidak aktif (*disabled*).

---

## 3. Timeline & Batas Waktu Penyelesaian

* **Review Berikutnya (Pekan Depan):** Mahasiswa wajib mendemonstrasikan hasil perbaikan UI dan penyederhanaan logika pendaftaran menggunakan sistem kontrol admin di atas.
* **Batas Akhir Revisi (Final Deadline):** Pekan depan adalah **kesempatan terakhir untuk melakukan revisi**. Hasil akhir yang sudah bersih dari revisi harus segera dikumpulkan pada pekan berikutnya.
* **Catatan Urgensi:** Waktu pelaksanaan ujian riil sudah sangat dekat, kelompok diharapkan bergerak cepat menyelesaikan fungsionalitas utama aplikasi pendaftaran ini tanpa memperlebar ke fitur-fitur sekunder yang rumit.
"""

