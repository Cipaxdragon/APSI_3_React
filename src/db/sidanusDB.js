/**
 * SIDANUS — Data Layer (localStorage)
 * Konversi dari data.js (vanilla) ke ES Module untuk React.
 * Semua data tetap di localStorage — tidak ada backend.
 */

const KEYS = {
  SESSION: 'sidanus_session',
  STUDENTS: 'sidanus_students',
  REGISTRATIONS: 'sidanus_registrations',
  SCHEDULES: 'sidanus_schedules',
};

const SEED_STUDENTS = [
  {
    nim: '60900121034',
    nama: 'Ahmad Fauzi Ramadhan',
    prodi: 'Sistem Informasi',
    semester: 8,
    email: 'ahmadffauzi@uin.ac.id',
    hp: '082312345678',
    judul: 'Analisis Penerimaan Sistem ERP Menggunakan Metode Technology Acceptance Model (TAM) pada PT. Sinar Nusantara Makassar',
    abstrak: 'Penelitian ini bertujuan untuk menganalisis tingkat penerimaan sistem ERP pada PT. Sinar Nusantara Makassar menggunakan TAM.',
    pembimbing1: 'Dr. Andi Sumarni, S.T., M.Kom.',
    pembimbing2: 'Andi Muhammad Ansar, S.Kom., M.T.',
    statusUjian: 'belum',
    angkatan: 2021,
  },
  {
    nim: '60900120057',
    nama: 'Muhammad Rizal Aditya',
    prodi: 'Sistem Informasi',
    semester: 10,
    email: 'rizaladitya@uin.ac.id',
    hp: '081234567890',
    judul: 'Implementasi Machine Learning untuk Prediksi Mahasiswa Bermasalah di PTKIN',
    abstrak: 'Penelitian ini mengimplementasikan algoritma machine learning untuk memprediksi mahasiswa yang berpotensi bermasalah.',
    pembimbing1: 'Dr. Andi Sumarni, S.T., M.Kom.',
    pembimbing2: 'Andi Muhammad Ansar, S.Kom., M.T.',
    statusUjian: 'hasil_selesai',
    angkatan: 2020,
  },
  {
    nim: '60900120091',
    nama: 'Zainal Abidin Harahap',
    prodi: 'Sistem Informasi',
    semester: 10,
    email: 'zainal.abidin@uin.ac.id',
    hp: '085678901234',
    judul: 'Analisis Keamanan Jaringan Komputer Menggunakan Metode Penetration Testing',
    abstrak: 'Penelitian ini menganalisis keamanan jaringan komputer dengan pendekatan penetration testing.',
    pembimbing1: 'Dr. H. Alamsyah, S.T., M.T.',
    pembimbing2: 'Faisal Akib, S.Kom., M.Kom.',
    statusUjian: 'hasil_selesai',
    angkatan: 2020,
  },
  {
    nim: '60900121005',
    nama: 'Fatimah Az-Zahra',
    prodi: 'Sistem Informasi',
    semester: 8,
    email: 'fatimah.az@uin.ac.id',
    hp: '087890123456',
    judul: 'Perancangan Sistem Informasi Perpustakaan Berbasis Web pada Kampus UIN Alauddin Makassar',
    abstrak: 'Penelitian ini merancang sistem informasi perpustakaan berbasis web untuk meningkatkan efisiensi layanan.',
    pembimbing1: 'Faisal Akib, S.Kom., M.Kom.',
    pembimbing2: 'Rismawati, S.Kom., M.Kom.',
    statusUjian: 'proposal_selesai',
    angkatan: 2021,
  },
  {
    nim: '60900121019',
    nama: 'Nur Hikmah Salsabila',
    prodi: 'Sistem Informasi',
    semester: 8,
    email: 'hikmah.salsa@uin.ac.id',
    hp: '089012345678',
    judul: 'Evaluasi Usability Aplikasi Mobile Banking Menggunakan Metode System Usability Scale (SUS)',
    abstrak: 'Penelitian ini mengevaluasi tingkat usability aplikasi mobile banking menggunakan metode SUS.',
    pembimbing1: 'Nur Afif, S.T., M.T.',
    pembimbing2: 'Rismawati, S.Kom., M.Kom.',
    statusUjian: 'belum',
    angkatan: 2021,
  },
];

const SEED_REGISTRATIONS = [
  {
    id: 'REG-001',
    nim: '60900120057',
    jenisUjian: 'munaqasyah',
    tanggalDaftar: '2026-06-10',
    berkas: {
      sk_seminar_hasil: true, berita_acara_hasil: true, naskah_skripsi: true,
      kartu_bimbingan: true, sertifikat: true, transkrip: true,
      bukti_lunas_spp: true, lembar_komprehensif: true, bukti_hafalan: true,
    },
    statusVerifikasi: 'disetujui',
    catatanAdmin: '',
  },
  {
    id: 'REG-002',
    nim: '60900121005',
    jenisUjian: 'hasil',
    tanggalDaftar: '2026-06-12',
    berkas: {
      sk_pembimbing: true, sk_sempro: true, berita_acara_sempro: true,
      draft_hasil: true, kartu_bimbingan_hasil: true,
    },
    statusVerifikasi: 'disetujui',
    catatanAdmin: '',
  },
];

const SEED_SCHEDULES = [
  {
    id: 'SCH-001',
    registrationId: 'REG-002',
    nim: '60900121005',
    jenisUjian: 'hasil',
    tanggal: '2026-06-16',
    jamMulai: '08:00',
    jamSelesai: '10:00',
    ruangan: 'Ruang Seminar Lt. 3, Gedung A',
    ketuaSidang: 'Faisal Akib, S.Kom., M.Kom.',
    sekretaris: 'Rismawati, S.Kom., M.Kom.',
    penguji1: 'Dr. Mustari Lamada, S.Pd., M.T.',
    penguji2: 'Nur Afif, S.T., M.T.',
    statusKaprodi: 'disetujui',
    catatan: 'Mohon mahasiswa hadir 30 menit sebelum ujian dimulai.',
  },
];

// ─── Init ────────────────────────────────────────────
function init() {
  if (!localStorage.getItem(KEYS.STUDENTS))
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(SEED_STUDENTS));
  if (!localStorage.getItem(KEYS.REGISTRATIONS))
    localStorage.setItem(KEYS.REGISTRATIONS, JSON.stringify(SEED_REGISTRATIONS));
  if (!localStorage.getItem(KEYS.SCHEDULES))
    localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(SEED_SCHEDULES));
}

function resetAll() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  init();
}

// ─── Session ─────────────────────────────────────────
function setSession(role, identifier) {
  localStorage.setItem(KEYS.SESSION, JSON.stringify({ role, identifier, loginTime: new Date().toISOString() }));
}
function getSession() {
  const d = localStorage.getItem(KEYS.SESSION);
  return d ? JSON.parse(d) : null;
}
function clearSession() {
  localStorage.removeItem(KEYS.SESSION);
}

// ─── Students ─────────────────────────────────────────
function getStudents() {
  const d = localStorage.getItem(KEYS.STUDENTS);
  return d ? JSON.parse(d) : [];
}
function getStudent(nim) {
  return getStudents().find(s => s.nim === nim) || null;
}
function updateStudent(nim, updates) {
  const students = getStudents();
  const idx = students.findIndex(s => s.nim === nim);
  if (idx === -1) return false;
  students[idx] = { ...students[idx], ...updates };
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  return true;
}

// ─── Registrations ────────────────────────────────────
function getRegistrations() {
  const d = localStorage.getItem(KEYS.REGISTRATIONS);
  return d ? JSON.parse(d) : [];
}
function getRegistration(id) {
  return getRegistrations().find(r => r.id === id) || null;
}
function getRegistrationsByNim(nim) {
  return getRegistrations().filter(r => r.nim === nim);
}
function getRegistrationsByStatus(status) {
  return getRegistrations().filter(r => r.statusVerifikasi === status);
}
function hasActiveRegistration(nim) {
  return getRegistrations().some(
    r => r.nim === nim && (r.statusVerifikasi === 'menunggu' || r.statusVerifikasi === 'disetujui')
  );
}
function addRegistration(registration) {
  const regs = getRegistrations();
  const newReg = {
    ...registration,
    id: 'REG-' + String(regs.length + 1).padStart(3, '0'),
    tanggalDaftar: new Date().toISOString().split('T')[0],
    statusVerifikasi: 'menunggu',
    catatanAdmin: '',
  };
  regs.push(newReg);
  localStorage.setItem(KEYS.REGISTRATIONS, JSON.stringify(regs));
  return newReg;
}
function updateRegistration(id, updates) {
  const regs = getRegistrations();
  const idx = regs.findIndex(r => r.id === id);
  if (idx === -1) return false;
  regs[idx] = { ...regs[idx], ...updates };
  localStorage.setItem(KEYS.REGISTRATIONS, JSON.stringify(regs));
  return true;
}

// ─── Schedules ────────────────────────────────────────
function getSchedules() {
  const d = localStorage.getItem(KEYS.SCHEDULES);
  return d ? JSON.parse(d) : [];
}
function getSchedulesByStatus(status) {
  return getSchedules().filter(s => s.statusKaprodi === status);
}
function addSchedule(schedule) {
  const schedules = getSchedules();
  const newSch = {
    ...schedule,
    id: 'SCH-' + String(schedules.length + 1).padStart(3, '0'),
    statusKaprodi: 'menunggu',
  };
  schedules.push(newSch);
  localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(schedules));
  return newSch;
}
function updateSchedule(id, updates) {
  const schedules = getSchedules();
  const idx = schedules.findIndex(s => s.id === id);
  if (idx === -1) return false;
  schedules[idx] = { ...schedules[idx], ...updates };
  localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(schedules));
  return true;
}

// ─── Helpers ──────────────────────────────────────────
function getExamLabel(type) {
  return { proposal: 'Ujian Proposal', hasil: 'Seminar Hasil', munaqasyah: 'Munaqasyah' }[type] || type;
}
function getStatusLabel(status) {
  return { menunggu: '⏳ Menunggu', disetujui: '✓ Disetujui', dikembalikan: '✗ Dikembalikan', ditolak: '✗ Ditolak' }[status] || status;
}
function getStatusColor(status) {
  return {
    menunggu: { bg: 'bg-amber-100', text: 'text-amber-700' },
    disetujui: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    dikembalikan: { bg: 'bg-rose-100', text: 'text-rose-700' },
    ditolak: { bg: 'bg-rose-100', text: 'text-rose-700' },
  }[status] || { bg: 'bg-slate-100', text: 'text-slate-700' };
}
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const d = new Date(dateStr);
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
function getNextExamType(nim) {
  const student = getStudent(nim);
  if (!student) return null;
  return { belum: 'proposal', proposal_selesai: 'hasil', hasil_selesai: 'munaqasyah' }[student.statusUjian] || null;
}
function getBerkasRequirements(jenisUjian) {
  const requirements = {
    proposal: [
      { key: 'kartu_kontrol', label: 'Kartu Kontrol / Lembar Konsultasi' },
      { key: 'naskah_proposal', label: 'Naskah Proposal (PDF)' },
      { key: 'persetujuan_pemb1', label: 'Bukti Persetujuan Pembimbing 1 (PDF)' },
      { key: 'persetujuan_pemb2', label: 'Bukti Persetujuan Pembimbing 2 (PDF)' },
      { key: 'acc_bimbingan_pemb1', label: 'Lembar Bimbingan ACC Pembimbing 1 (PDF)' },
      { key: 'acc_bimbingan_pemb2', label: 'Lembar Bimbingan ACC Pembimbing 2 (PDF)' },
      { key: 'transkrip', label: 'Transkrip Terakhir (PDF)' },
      { key: 'sk_ujian', label: 'SK Ujian (PDF)' },
    ],
    hasil: [
      { key: 'sk_pembimbing', label: 'SK Pembimbing (PDF)' },
      { key: 'sk_sempro', label: 'SK Pelaksanaan Ujian Proposal (PDF)' },
      { key: 'berita_acara_sempro', label: 'Berita Acara Ujian Proposal (PDF)' },
      { key: 'draft_hasil', label: 'Draft Hasil Penelitian (PDF)' },
      { key: 'kartu_bimbingan_hasil', label: 'Kartu Bimbingan (PDF)' },
      { key: 'acc_bimbingan_pemb1', label: 'Lembar Bimbingan ACC Pembimbing 1 (PDF)' },
      { key: 'acc_bimbingan_pemb2', label: 'Lembar Bimbingan ACC Pembimbing 2 (PDF)' },
      { key: 'acc_komprehensif', label: 'ACC Ujian Komprehensif (PDF)' },
      { key: 'file_skripsi', label: 'File Skripsi / Tugas Akhir (PDF)' },
    ],
    munaqasyah: [
      { key: 'sk_seminar_hasil', label: 'SK Pelaksanaan Ujian Seminar Hasil (PDF)' },
      { key: 'naskah_skripsi', label: 'Naskah Skripsi Final (PDF)' },
      { key: 'sertifikat', label: 'Sertifikat Kompetensi / Pendukung (PDF)' },
      { key: 'transkrip', label: 'Transkrip Nilai Sementara (PDF)' },
      { key: 'bukti_lunas_spp', label: 'Bukti Lunas Pembayaran SPP (PDF)' },
      { key: 'lembar_komprehensif', label: 'Lembar Ujian Komprehensif (PDF)' },
      { key: 'bukti_hafalan', label: 'Bukti Hafalan (PDF)' },
    ],
  };
  return requirements[jenisUjian] || [];
}

// Auto-init on import
init();

export const SidanusDB = {
  init, resetAll,
  setSession, getSession, clearSession,
  getStudents, getStudent, updateStudent,
  getRegistrations, getRegistration, getRegistrationsByNim,
  getRegistrationsByStatus, hasActiveRegistration, addRegistration, updateRegistration,
  getSchedules, getSchedulesByStatus, addSchedule, updateSchedule,
  getExamLabel, getStatusLabel, getStatusColor, formatDate, getNextExamType, getBerkasRequirements,
};
