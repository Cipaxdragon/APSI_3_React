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
  DOSEN: 'sidanus_dosen',
  RUANGAN: 'sidanus_ruangan',
  EVENTS: 'sidanus_events',
};

const SEED_STUDENTS = [
  {
    nim: '60900121064',
    nama: 'Ahmad Ghazali',
    prodi: 'Sistem Informasi',
    semester: 10,
    email: 'ahmadghazali@uin.ac.id',
    hp: '082312345678',
    judul: 'Analisis Penerimaan Sistem ERP Menggunakan Metode Technology Acceptance Model (TAM) pada PT. Sinar Nusantara Makassar',
    abstrak: 'Penelitian ini bertujuan untuk menganalisis tingkat penerimaan sistem ERP pada PT. Sinar Nusantara Makassar menggunakan TAM.',
    pembimbing1: 'Dr. Farida Yusuf, S.Kom., M.T.',
    pembimbing2: 'Rahman, S.Kom., M.T.',
    statusUjian: 'belum',
    angkatan: 2021,
  },
  {
    nim: '60900124026',
    nama: 'Hilya Aini Nur Ridha',
    prodi: 'Sistem Informasi',
    semester: 4,
    email: 'hilya@uin.ac.id',
    hp: '081234567890',
    judul: 'Penerapan Metode Agile dalam Pengembangan Sistem Informasi',
    abstrak: 'Penelitian ini berfokus pada implementasi Agile di lingkungan akademik.',
    pembimbing1: 'Dr. Farida Yusuf, S.Kom., M.T.',
    pembimbing2: 'Rahman, S.Kom., M.T.',
    statusUjian: 'belum',
    angkatan: 2024,
  },
  {
    nim: '60900124027',
    nama: 'Suci Ramadhani',
    prodi: 'Sistem Informasi',
    semester: 4,
    email: 'suci@uin.ac.id',
    hp: '082345678901',
    judul: 'Perancangan Sistem Informasi Pendaftaran Ujian Berbasis Web',
    abstrak: 'Penelitian ini mengembangkan sistem untuk digitalisasi ujian mahasiswa.',
    pembimbing1: 'Faisal, S.Kom., M.Kom.',
    pembimbing2: 'Erfina, S.Kom., M.Kom.',
    statusUjian: 'proposal_selesai',
    angkatan: 2024,
  },
  {
    nim: '60900124028',
    nama: 'Muh. Jabal Nurfajri',
    prodi: 'Sistem Informasi',
    semester: 4,
    email: 'jabal@uin.ac.id',
    hp: '083456789012',
    judul: 'Implementasi Machine Learning untuk Prediksi Kelulusan Mahasiswa',
    abstrak: 'Penelitian ini mengimplementasikan algoritma machine learning.',
    pembimbing1: 'Asrul Ashari Muin, S.Kom., M.Kom.',
    pembimbing2: 'Faisal, S.Kom., M.Kom.',
    statusUjian: 'hasil_selesai',
    angkatan: 2024,
  },
  {
    nim: '60900124029',
    nama: 'Dirghayu',
    prodi: 'Sistem Informasi',
    semester: 4,
    email: 'dirghayu@uin.ac.id',
    hp: '084567890123',
    judul: 'Analisis Keamanan Jaringan Menggunakan Metode Penetration Testing',
    abstrak: 'Penelitian ini menganalisis keamanan jaringan komputer.',
    pembimbing1: 'Firmansyah Ibrahim, S.Kom., M.Kom.',
    pembimbing2: 'Izmy Alwiah Musdar, S.Kom., M.Cs.',
    statusUjian: 'belum',
    angkatan: 2024,
  },
  {
    nim: '60900124046',
    nama: 'Elfitrah Ridhayana',
    prodi: 'Sistem Informasi',
    semester: 4,
    email: 'elfitrah@uin.ac.id',
    hp: '085678901234',
    judul: 'Evaluasi Usability Aplikasi Mobile Menggunakan Metode SUS',
    abstrak: 'Penelitian ini mengevaluasi aplikasi mobile banking.',
    pembimbing1: 'Dr. Hastuti, S.Pd., M.Pd.i.',
    pembimbing2: 'Adhy Rizaldy, S.Kom., M.Kom.',
    statusUjian: 'belum',
    angkatan: 2024,
  },
];

const SEED_REGISTRATIONS = [
  {
    id: 'REG-001',
    nim: '60900124028',
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
    nim: '60900124027',
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

// ─── Master Data ─────────────────────────────────────
const SEED_DOSEN = [
  { id: '908059103', nama: 'M Sya’Rani Machrizzandi, S.Kom., M.Kom.', jabatan: 'Lektor' },
  { id: '8852773674130432', nama: 'Muhammad Rezky, S.Pd., M.Kom.', jabatan: 'Lektor' },
  { id: '0916108801', nama: 'Izmy Alwiah Musdar, S.Kom., M.Cs.', jabatan: 'Lektor' },
  { id: '2131058703', nama: 'Adhy Rizaldy, S.Kom., M.Kom.', jabatan: 'Lektor' },
  { id: '2007018701', nama: 'Asrul Ashari Muin, S.Kom., M.Kom.', jabatan: 'Lektor' },
  { id: '0915118501', nama: 'Erfina, S.Kom., M.Kom.', jabatan: 'Lektor' },
  { id: '2012127603', nama: 'Faisal, S.Kom., M.Kom.', jabatan: 'Lektor' },
  { id: '2019048701', nama: 'Dr. Farida Yusuf, S.Kom., M.T.', jabatan: 'Lektor Kepala' },
  { id: '0918128902', nama: 'Firmansyah Ibrahim, S.Kom., M.Kom.', jabatan: 'Lektor' },
  { id: '2027118701', nama: 'Dr. Hastuti, S.Pd., M.Pd.i.', jabatan: 'Lektor Kepala' },
  { id: 'Muniardi', nama: 'Muniardi', jabatan: 'Asisten Ahli' },
  { id: '0913038404', nama: 'Nahrun Hartono, S.Kom., M.Kom.', jabatan: 'Lektor' },
  { id: '2001068301', nama: 'Rahman, S.Kom., M.T.', jabatan: 'Lektor' },
  { id: '2023038802', nama: 'Reza Maulana, S.Kom., M.T.', jabatan: 'Lektor' },
];

const SEED_RUANGAN = [
  { id: 'R001', nama: 'Ruang Seminar Lt. 3, Gedung A', kapasitas: 30 },
  { id: 'R002', nama: 'Ruang Seminar Lt. 2, Gedung B', kapasitas: 25 },
  { id: 'R003', nama: 'Aula Jurusan Sistem Informasi', kapasitas: 50 },
  { id: 'R004', nama: 'Lab. Komputer 1, Gedung B', kapasitas: 20 },
  { id: 'R005', nama: 'Ruang Sidang Dekanat Lt. 4', kapasitas: 15 },
];

const SEED_ACADEMIC_EVENTS = [
  // Januari - Mei
  { id: 101, tanggal: '2026-01-01', nama: 'Tahun Baru Masehi', tipe: 'libur' },
  { id: 102, tanggal: '2026-02-18', nama: 'Isra Mikraj', tipe: 'libur' },
  { id: 103, tanggal: '2026-03-02', nama: 'Awal Perkuliahan Genap', tipe: 'akademik' },
  { id: 104, tanggal: '2026-03-20', nama: 'Hari Raya Nyepi', tipe: 'libur' },
  { id: 105, tanggal: '2026-04-10', nama: 'Hari Raya Idul Fitri', tipe: 'libur' },
  { id: 106, tanggal: '2026-04-11', nama: 'Cuti Bersama Idul Fitri', tipe: 'libur' },
  { id: 107, tanggal: '2026-05-01', nama: 'Hari Buruh Internasional', tipe: 'libur' },
  { id: 108, tanggal: '2026-05-30', nama: 'Hari Raya Waisak', tipe: 'libur' },
  
  // Juni
  { id: 1, tanggal: '2026-06-01', nama: 'Hari Lahir Pancasila', tipe: 'libur' },
  { id: 2, tanggal: '2026-06-15', nama: 'Ujian Akhir Semester (UAS)', tipe: 'akademik' },
  { id: 3, tanggal: '2026-06-16', nama: 'Ujian Akhir Semester (UAS)', tipe: 'akademik' },
  { id: 4, tanggal: '2026-06-17', nama: 'Idul Adha 1447 H', tipe: 'libur' },
  { id: 5, tanggal: '2026-06-25', nama: 'Pembekalan KKN', tipe: 'kegiatan' },
  { id: 6, tanggal: '2026-06-27', nama: 'Wisuda Sarjana', tipe: 'kegiatan' },

  // Juli - Desember
  { id: 109, tanggal: '2026-07-15', nama: 'Tahun Baru Islam', tipe: 'libur' },
  { id: 110, tanggal: '2026-07-20', nama: 'Registrasi Mahasiswa Baru', tipe: 'kegiatan' },
  { id: 111, tanggal: '2026-08-17', nama: 'Hari Kemerdekaan RI', tipe: 'libur' },
  { id: 112, tanggal: '2026-08-25', nama: 'PBAK Mahasiswa Baru', tipe: 'kegiatan' },
  { id: 113, tanggal: '2026-09-01', nama: 'Awal Perkuliahan Ganjil', tipe: 'akademik' },
  { id: 114, tanggal: '2026-09-15', nama: 'Maulid Nabi Muhammad SAW', tipe: 'libur' },
  { id: 115, tanggal: '2026-10-19', nama: 'Ujian Tengah Semester (UTS)', tipe: 'akademik' },
  { id: 116, tanggal: '2026-12-14', nama: 'UAS Ganjil', tipe: 'akademik' },
  { id: 117, tanggal: '2026-12-25', nama: 'Hari Raya Natal', tipe: 'libur' },
];

const SEED_SCHEDULES = [
  {
    id: 'SCH-001',
    registrationId: 'REG-002',
    nim: '60900124027',
    jenisUjian: 'hasil',
    tanggal: '2026-06-16',
    jamMulai: '08:00',
    jamSelesai: '10:00',
    ruangan: 'Ruang Seminar Lt. 3, Gedung A',
    ketuaSidang: 'Faisal, S.Kom., M.Kom.',
    sekretaris: 'Erfina, S.Kom., M.Kom.',
    penguji1: 'Dr. Hastuti, S.Pd., M.Pd.i.',
    penguji2: 'Firmansyah Ibrahim, S.Kom., M.Kom.',
    statusKaprodi: 'disetujui',
    catatan: 'Mohon mahasiswa hadir 30 menit sebelum ujian dimulai.',
  },
];

// ─── Init ────────────────────────────────────────────
function init() {
  // Force update seed data for new students mapping (so users don't need to clear cache manually)
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(SEED_STUDENTS));
  localStorage.setItem(KEYS.REGISTRATIONS, JSON.stringify(SEED_REGISTRATIONS));
  localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(SEED_SCHEDULES));
  localStorage.setItem(KEYS.DOSEN, JSON.stringify(SEED_DOSEN));
  if (!localStorage.getItem(KEYS.RUANGAN))
    localStorage.setItem(KEYS.RUANGAN, JSON.stringify(SEED_RUANGAN));
    
  // Force update events seed data for demo purposes
  localStorage.setItem(KEYS.EVENTS, JSON.stringify(SEED_ACADEMIC_EVENTS));
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
function addStudent(student) {
  const students = getStudents();
  if (students.find(s => s.nim === student.nim)) return false; // NIM exists
  students.push({ ...student, statusUjian: 'belum' });
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  return true;
}
function updateStudent(nim, updates) {
  const students = getStudents();
  const idx = students.findIndex(s => s.nim === nim);
  if (idx === -1) return false;
  students[idx] = { ...students[idx], ...updates };
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  return true;
}
function deleteStudent(nim) {
  let students = getStudents();
  const initialLength = students.length;
  students = students.filter(s => s.nim !== nim);
  if (students.length === initialLength) return false;
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

// ─── Master Data Helpers ─────────────────────────────
function getDosenList() {
  const d = localStorage.getItem(KEYS.DOSEN);
  return d ? JSON.parse(d) : [];
}
function addDosen(dosen) {
  const list = getDosenList();
  const newDosen = { ...dosen, id: 'D' + Date.now() };
  list.push(newDosen);
  localStorage.setItem(KEYS.DOSEN, JSON.stringify(list));
  return newDosen;
}
function updateDosen(id, updates) {
  const list = getDosenList();
  const idx = list.findIndex(d => d.id === id);
  if (idx === -1) return false;
  list[idx] = { ...list[idx], ...updates };
  localStorage.setItem(KEYS.DOSEN, JSON.stringify(list));
  return true;
}
function deleteDosen(id) {
  let list = getDosenList();
  list = list.filter(d => d.id !== id);
  localStorage.setItem(KEYS.DOSEN, JSON.stringify(list));
  return true;
}

function getRuanganList() {
  const d = localStorage.getItem(KEYS.RUANGAN);
  return d ? JSON.parse(d) : [];
}
function addRuangan(ruangan) {
  const list = getRuanganList();
  const newRuangan = { ...ruangan, id: 'R' + Date.now() };
  list.push(newRuangan);
  localStorage.setItem(KEYS.RUANGAN, JSON.stringify(list));
  return newRuangan;
}
function updateRuangan(id, updates) {
  const list = getRuanganList();
  const idx = list.findIndex(r => r.id === id);
  if (idx === -1) return false;
  list[idx] = { ...list[idx], ...updates };
  localStorage.setItem(KEYS.RUANGAN, JSON.stringify(list));
  return true;
}
function deleteRuangan(id) {
  let list = getRuanganList();
  list = list.filter(r => r.id !== id);
  localStorage.setItem(KEYS.RUANGAN, JSON.stringify(list));
  return true;
}

// Hitung tanggal kerja H+N dari hari ini (skip Sabtu & Minggu)
function getNextWorkday(offsetDays) {
  const d = new Date();
  let added = 0;
  while (added < offsetDays) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return d.toISOString().split('T')[0];
}

// Saran jadwal otomatis berdasarkan data mahasiswa
function suggestSchedule(nim) {
  const student = getStudent(nim);
  if (!student) return null;

  const suggestedDate = getNextWorkday(3);

  // Dosen yang sudah dipakai di jadwal pada tanggal yang sama
  const existingOnDate = getSchedules().filter(s => s.tanggal === suggestedDate);
  const usedDosen = new Set();
  existingOnDate.forEach(s => {
    [s.ketuaSidang, s.sekretaris, s.penguji1, s.penguji2].forEach(d => usedDosen.add(d));
  });

  // Pembimbing sudah fix sebagai ketua & sekretaris
  const ketuaSidang = student.pembimbing1;
  const sekretaris = student.pembimbing2;
  usedDosen.add(ketuaSidang);
  usedDosen.add(sekretaris);

  // Cari penguji 1 & 2 dari Dosen yang belum dipakai
  const available = getDosenList()
    .map(d => d.nama)
    .filter(nama => !usedDosen.has(nama) && nama !== ketuaSidang && nama !== sekretaris);

  // Pilih ruangan pertama yang tersedia
  const ruangan = getRuanganList()[0]?.nama || 'Ruang Seminar Lt. 3, Gedung A';

  return {
    tanggal: suggestedDate,
    jamMulai: '08:00',
    jamSelesai: '10:00',
    ruangan,
    ketuaSidang,
    sekretaris,
    penguji1: available[0] || '',
    penguji2: available[1] || '',
    catatan: 'Mohon mahasiswa hadir 30 menit sebelum ujian dimulai.',
  };
}

// Auto-init on import
init();

export const SidanusDB = {
  init, resetAll,
  setSession, getSession, clearSession,
  getStudents, getStudent, addStudent, updateStudent, deleteStudent,
  getRegistrations, getRegistration, getRegistrationsByNim,
  getRegistrationsByStatus, hasActiveRegistration, addRegistration, updateRegistration,
  getSchedules, getSchedulesByStatus, addSchedule, updateSchedule,
  getExamLabel, getStatusLabel, getStatusColor, formatDate, getNextExamType, getBerkasRequirements,
  getDosenList, addDosen, updateDosen, deleteDosen, 
  getRuanganList, addRuangan, updateRuangan, deleteRuangan, 
  suggestSchedule,
  getAcademicEvents: () => { const d = localStorage.getItem(KEYS.EVENTS); return d ? JSON.parse(d) : []; },
};
