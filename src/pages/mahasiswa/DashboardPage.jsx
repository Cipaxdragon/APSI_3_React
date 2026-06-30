import React from 'react';
import { Link } from 'react-router-dom';
import MahasiswaSidebar from '../../components/layout/MahasiswaSidebar';
import PageHeader from '../../components/layout/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { SidanusDB } from '../../db/sidanusDB';
import { useRegistrations } from '../../hooks/useRegistrations';

export default function MahasiswaDashboard() {
  const { session } = useAuth();
  const student = SidanusDB.getStudent(session?.identifier);
  const { registrations } = useRegistrations(student?.nim);
  
  if (!student) return null;

  // Stat Counters
  const schedules = SidanusDB.getSchedules();
  const completedSchedules = schedules.filter(s => s.nim === student.nim && s.statusKaprodi === 'selesai');
  const latestCompletedSchedule = completedSchedules.length > 0 ? [...completedSchedules].sort((a,b) => b.id.localeCompare(a.id))[0] : null;

  const statDikirim = registrations.length;
  const statDisetujui = registrations.filter(r => r.statusVerifikasi === 'disetujui').length;
  const statRevisi = registrations.filter(r => r.statusVerifikasi === 'dikembalikan').length + completedSchedules.filter(s => s.perluRevisi).length;
  
  const activeSchedules = schedules.filter(s => s.nim === student.nim && s.statusKaprodi === 'disetujui');
  const statJadwal = activeSchedules.length;

  const currentSchedule = activeSchedules.length > 0 ? activeSchedules[0] : null;

  const sortedRegs = [...registrations].sort((a, b) => {
    const dateDiff = new Date(b.tanggalDaftar) - new Date(a.tanggalDaftar);
    return dateDiff !== 0 ? dateDiff : b.id.localeCompare(a.id);
  });
  const activeReg = sortedRegs[0];
  
  // isProses: ada pendaftaran aktif yang belum selesai/dikembalikan/lulus
  // AND tidak punya jadwal yang sudah selesai (statusKaprodi: 'selesai')
  const activeRegSchedule = activeReg ? schedules.find(s => s.registrationId === activeReg.id) : null;
  const isProses = activeReg 
    && activeReg.statusVerifikasi !== 'lulus' 
    && activeReg.statusVerifikasi !== 'dikembalikan'
    && activeRegSchedule?.statusKaprodi !== 'selesai';
  const isLulusTotal = student.statusUjian === 'lulus';

  // Tentukan Status Akademik Mahasiswa
  const getStatusAkademikLabel = () => {
    if (isLulusTotal) {
      return { label: 'Telah Lulus (Alumni)', color: 'bg-amber-400 text-amber-900 border-amber-400', icon: '🎓' };
    }
    
    // Cek jika sedang ada pendaftaran aktif yang belum selesai
    if (isProses) {
      return { 
         label: `Sedang Proses ${SidanusDB.getExamLabel(activeReg.jenisUjian)}`, 
         color: 'bg-blue-400/30 text-blue-50 border-blue-400/50 shadow-[0_0_10px_rgba(96,165,250,0.2)]',
         icon: '⏳'
      };
    }

    if (student.statusUjian === 'hasil_selesai') {
      return { label: 'Tahap Persiapan Munaqasyah', color: 'bg-emerald-800/40 text-emerald-100 border-emerald-500/30', icon: '📝' };
    }
    if (student.statusUjian === 'proposal_selesai') {
      return { label: 'Tahap Persiapan Seminar Hasil', color: 'bg-emerald-800/40 text-emerald-100 border-emerald-500/30', icon: '📝' };
    }
    
    return { label: 'Tahap Persiapan Proposal', color: 'bg-slate-800/30 text-slate-200 border-slate-400/30', icon: '📖' };
  };

  const statusAkademik = getStatusAkademikLabel();

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <MahasiswaSidebar />
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <PageHeader title="Dashboard Mahasiswa" />
        
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          {/* Welcome / Schedule Banner */}
          {currentSchedule ? (
            <section className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-0 lg:divide-x lg:divide-white/10 items-stretch">
                
                {/* Kolom 1: Judul Ujian & Skripsi */}
                <div className="flex flex-col justify-center lg:pr-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/40 border border-blue-400/40 rounded-full text-[10px] font-bold text-white uppercase tracking-wider mb-4 shadow-sm w-fit">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Jadwal Ditetapkan
                  </div>
                  
                  <h2 className="text-3xl font-extrabold mb-3 text-white drop-shadow-sm leading-tight">
                    {SidanusDB.getExamLabel(currentSchedule.jenisUjian)}
                  </h2>
                  <div className="flex gap-3 items-start bg-white/10 rounded-xl p-3.5 border border-white/20 shadow-inner">
                    <svg className="w-5 h-5 text-blue-200 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <p className="text-blue-50 font-medium italic text-sm leading-relaxed">"{student.judul}"</p>
                  </div>
                </div>

                {/* Kolom 2: Waktu & Ruangan */}
                <div className="flex flex-col justify-center lg:px-8">
                  <div className="mb-6">
                    <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-1.5">Pelaksanaan</p>
                    <p className="font-extrabold text-2xl text-white tracking-tight leading-none mb-1">{SidanusDB.formatDate(currentSchedule.tanggal)}</p>
                    <p className="text-sm font-semibold text-blue-100">{currentSchedule.jamMulai} - {currentSchedule.jamSelesai} WITA</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-1.5">Ruangan</p>
                    <p className="font-bold text-white flex items-center gap-2 text-lg">
                      <svg className="w-5 h-5 text-blue-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {currentSchedule.ruangan}
                    </p>
                  </div>
                </div>
                
                {/* Kolom 3: Majelis Penguji */}
                <div className="flex flex-col justify-center lg:pl-8">
                  <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-4">Susunan Majelis Penguji</p>
                  <ul className="space-y-3.5">
                    {[
                      { role: 'Ketua Sidang / Pembimbing 1', name: currentSchedule.ketuaSidang, initial: 'K' },
                      { role: 'Sekretaris / Pembimbing 2', name: currentSchedule.sekretaris, initial: 'S' },
                      { role: 'Penguji 1', name: currentSchedule.penguji1, initial: 'P1' },
                      { role: 'Penguji 2', name: currentSchedule.penguji2, initial: 'P2' },
                    ].map((p, idx) => p.name ? (
                      <li key={idx} className="flex items-center gap-3.5">
                        <div className="w-8 h-8 rounded-full bg-blue-500/40 border border-blue-400/50 flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0 shadow-sm">{p.initial}</div>
                        <div>
                          <p className="text-sm font-bold text-white leading-tight">{p.name}</p>
                          <p className="text-[10px] font-semibold text-blue-200 mt-0.5">{p.role}</p>
                        </div>
                      </li>
                    ) : null)}
                  </ul>
                </div>

              </div>
            </section>
          ) : (
            <section className="bg-gradient-to-r from-emerald-700 to-emerald-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden">
              {/* Dekorasi Background */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1 relative z-10">Selamat Datang,</p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-1 relative z-10">
                <h2 className="text-xl sm:text-2xl font-extrabold">{student.nama} 👋</h2>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold w-fit ${statusAkademik.color}`}>
                  <span>{statusAkademik.icon}</span>
                  {statusAkademik.label}
                </div>
              </div>
              <p className="text-emerald-100 text-sm relative z-10">{student.nim} • {student.prodi}</p>
              
              <div className="mt-4 bg-white/10 border border-white/20 rounded-xl px-4 py-3 flex items-start gap-3 max-w-2xl relative z-10">
                <svg className="w-4 h-4 text-emerald-200 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wide mb-0.5">Judul Skripsi</p>
                  <p className="text-white text-xs sm:text-sm font-medium leading-relaxed italic">"{student.judul}"</p>
                </div>
              </div>
              
              <div className="mt-5 flex flex-wrap gap-2 relative z-10">
                {!isProses && !isLulusTotal ? (
                  <Link to="/mahasiswa/daftar-ujian" className="inline-flex items-center gap-2 bg-white text-emerald-700 text-xs font-bold px-5 py-2.5 rounded-xl shadow hover:shadow-lg hover:-translate-y-0.5 transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Daftar Ujian Baru
                  </Link>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-emerald-800/40 text-emerald-100 border border-emerald-500/30 text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm cursor-not-allowed">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {isLulusTotal ? 'Seluruh Ujian Selesai' : 'Pendaftaran Terkunci (Sedang Proses)'}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Status Cards */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <StatCard icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" color="amber" count={statDikirim} label="Berkas Dikirim" />
            <StatCard icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" color="emerald" count={statDisetujui} label="Berkas Disetujui" />
            <StatCard icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" color="blue" count={statJadwal} label="Jadwal Aktif" />
            <StatCard icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" color="rose" count={statRevisi} label="Perlu Revisi" />
          </section>

          {/* Timeline & Jadwal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            
            <section className="order-2 lg:order-1 lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800">Tracking Pendaftaran Aktif</h3>
              </div>
              <Timeline student={student} registrations={registrations} />
            </section>

            <div className="order-1 lg:order-2 space-y-4">
              <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 text-sm">Jadwal Terdekat</h3>
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                {currentSchedule ? (
                  <div>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold mb-3 
                      ${currentSchedule.jenisUjian === 'munaqasyah' ? 'bg-emerald-100 text-emerald-700' : 
                        currentSchedule.jenisUjian === 'hasil' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'}`}>
                      {SidanusDB.getExamLabel(currentSchedule.jenisUjian)}
                    </span>
                    <p className="text-xl font-extrabold text-slate-800">{SidanusDB.formatDate(currentSchedule.tanggal)}</p>
                    <p className="text-sm font-semibold text-slate-600 mt-1">{currentSchedule.jamMulai} - {currentSchedule.jamSelesai}</p>
                    <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {currentSchedule.ruangan}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-sm">Tidak ada jadwal aktif.</div>
                )}
              </section>

              <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">Status Kelulusan</h3>
                </div>
                {student.statusUjian === 'lulus' ? (
                  <div>
                    <p className="text-emerald-600 font-bold text-sm">Telah Lulus Munaqasyah 🎉</p>
                    <Link to="/mahasiswa/sk-kelulusan" className="mt-3 block w-full text-center text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 py-2 rounded-lg transition-colors">
                      Lihat SK Kelulusan
                    </Link>
                  </div>
                ) : student.statusUjian === 'hasil_selesai' ? (
                  <p className="text-teal-600 font-bold text-sm py-2">Telah Lulus Ujian Hasil</p>
                ) : student.statusUjian === 'proposal_selesai' ? (
                  <p className="text-blue-600 font-bold text-sm py-2">Telah Lulus Ujian Proposal</p>
                ) : (
                  <p className="text-slate-400 text-sm py-4">Belum ada pengumuman kelulusan.</p>
                )}

                {/* Tampilkan catatan dari penguji jika ada (baik wajib revisi maupun sekadar pesan) */}
                {latestCompletedSchedule?.catatanPenguji && (
                  <div className={`mt-4 border rounded-xl p-4 ${latestCompletedSchedule.perluRevisi ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                    <p className={`text-xs font-bold mb-2 flex items-center gap-1.5 ${latestCompletedSchedule.perluRevisi ? 'text-amber-800' : 'text-blue-800'}`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      {latestCompletedSchedule.perluRevisi ? 'Catatan Revisi Wajib' : 'Catatan / Pesan Penguji'}
                    </p>
                    <p className={`text-sm leading-relaxed italic ${latestCompletedSchedule.perluRevisi ? 'text-amber-900' : 'text-blue-900'}`}>"{latestCompletedSchedule.catatanPenguji}"</p>
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ icon, color, count, label }) {
  const colors = {
    amber: 'bg-amber-100 text-amber-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    rose: 'bg-rose-100 text-rose-600'
  };
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color].split(' ')[0]}`}>
        <svg className={`w-5 h-5 ${colors[color].split(' ')[1]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
        </svg>
      </div>
      <p className="text-2xl font-extrabold text-slate-800">{count}</p>
      <p className="text-xs text-slate-500 mt-0.5 font-medium">{label}</p>
    </div>
  );
}

function Timeline({ student, registrations }) {
  // Ambil pendaftaran terbaru
  const sortedRegs = [...registrations].sort((a, b) => new Date(b.tanggalDaftar) - new Date(a.tanggalDaftar));
  const activeReg = sortedRegs[0];

  if (!activeReg) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-slate-500 font-medium">Belum ada pendaftaran aktif</p>
        <p className="text-xs text-slate-400 mt-1">Silakan ajukan pendaftaran baru melalui menu Daftar Ujian.</p>
      </div>
    );
  }

  const isReturned = activeReg.statusVerifikasi === 'dikembalikan';
  const isApproved = activeReg.statusVerifikasi === 'disetujui' || activeReg.statusVerifikasi === 'lulus';
  const isFinished = activeReg.statusVerifikasi === 'lulus';

  const steps = [
    { label: 'Kirim Berkas', status: 'done', desc: `Pendaftaran ${SidanusDB.getExamLabel(activeReg.jenisUjian)} dikirim` },
    { 
      label: 'Verifikasi Admin', 
      status: isApproved ? 'done' : (isReturned ? 'error' : 'active'), 
      desc: isApproved ? 'Disetujui Admin' : (isReturned ? 'Berkas Perlu Revisi' : 'Sedang diverifikasi') 
    },
    { label: 'Penjadwalan', status: 'pending', desc: 'Menunggu plotting jadwal' },
    { label: 'Persetujuan Kaprodi', status: 'pending', desc: 'Menunggu SK Kaprodi' },
    { label: 'Pelaksanaan Ujian', status: 'pending', desc: 'Menunggu hasil pengujian' },
  ];

  let latestSchedule = null;
  if (!isReturned) {
    latestSchedule = SidanusDB.getSchedules().slice().reverse().find(s => s.registrationId === activeReg.id);
    if (latestSchedule || isFinished) {
      steps[2].status = 'done'; steps[2].desc = 'Jadwal ditetapkan';
      
      if (isFinished || latestSchedule?.statusKaprodi === 'disetujui' || latestSchedule?.statusKaprodi === 'selesai') {
        steps[3].status = 'done'; steps[3].desc = 'Disetujui Kaprodi';
        steps[4].status = isFinished ? 'done' : 'active';
        steps[4].desc = isFinished ? 'Lulus Ujian 🎉' : 'Menunggu pelaksanaan ujian';
      } else if (latestSchedule?.statusKaprodi === 'ditolak') {
        steps[3].status = 'error'; steps[3].desc = 'Ditolak Kaprodi';
      } else {
        steps[3].status = 'active'; steps[3].desc = 'Menunggu Kaprodi';
      }
    } else if (isApproved) {
      steps[2].status = 'active';
    }
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-100"></div>
      <div className="space-y-6 relative">
        {steps.map((step, idx) => (
          <div key={idx} className="flex gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 z-10 bg-white
              ${step.status === 'done' ? 'border-emerald-500' : step.status === 'active' ? 'border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]' : step.status === 'error' ? 'border-rose-500 shadow-[0_0_0_4px_rgba(244,63,94,0.1)]' : 'border-slate-200'}`}>
              {step.status === 'done' && <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
              {step.status === 'active' && <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>}
              {step.status === 'error' && <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>}
            </div>
            <div className="pt-1">
              <p className={`font-bold text-sm ${step.status === 'active' ? 'text-blue-600' : step.status === 'done' ? 'text-emerald-700' : step.status === 'error' ? 'text-rose-600' : 'text-slate-400'}`}>
                {step.label}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
              {step.status === 'error' && activeReg.catatanAdmin && idx === 1 && (
                <div className="mt-2 bg-rose-50 border border-rose-100 rounded-lg p-3 text-xs text-rose-700">
                  <span className="font-bold block mb-1">Catatan Admin:</span>
                  {activeReg.catatanAdmin}
                </div>
              )}
              {step.status === 'error' && latestSchedule?.catatanKaprodi && idx === 3 && (
                <div className="mt-2 bg-rose-50 border border-rose-100 rounded-lg p-3 text-xs text-rose-700">
                  <span className="font-bold block mb-1">Catatan Kaprodi:</span>
                  {latestSchedule.catatanKaprodi}
                  <p className="mt-1.5 italic opacity-80">Admin prodi akan segera mengatur ulang jadwal sidang Anda berdasarkan catatan di atas. Harap menunggu jadwal baru.</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
