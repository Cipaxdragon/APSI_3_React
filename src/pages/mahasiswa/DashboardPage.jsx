import React from 'react';
import { Link } from 'react-router-dom';
import MahasiswaSidebar from '../../components/layout/MahasiswaSidebar';
import PageHeader from '../../components/layout/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { SidanusDB } from '../../db/sidanusDB';
import { useRegistrations } from '../../hooks/useRegistrations';
import { generateBeritaAcara, generateLembarPengesahan, generateSKL } from '../../utils/pdfGenerator';

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
              
              {/* Tampilkan Update Realtime Catatan Penguji */}
              {(currentSchedule.catatanPenguji1 || currentSchedule.catatanPenguji2) && (
                <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
                  <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    Live: Update Penilaian Dosen Masuk
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentSchedule.catatanPenguji1 && (
                      <div className="bg-white/10 border border-white/20 rounded-xl p-4 shadow-sm">
                        <p className="text-xs font-bold mb-1 flex items-center gap-1.5 text-blue-100">
                          Dari Penguji 1 ({currentSchedule.penguji1})
                        </p>
                        <p className="text-sm leading-relaxed italic text-white">"{currentSchedule.catatanPenguji1}"</p>
                      </div>
                    )}
                    {currentSchedule.catatanPenguji2 && (
                      <div className="bg-white/10 border border-white/20 rounded-xl p-4 shadow-sm">
                        <p className="text-xs font-bold mb-1 flex items-center gap-1.5 text-blue-100">
                          Dari Penguji 2 ({currentSchedule.penguji2})
                        </p>
                        <p className="text-sm leading-relaxed italic text-white">"{currentSchedule.catatanPenguji2}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
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

          {/* Functional Widgets: Progress & Quick Actions */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Progress Bar Skripsi */}
            <div className={`${currentSchedule ? 'xl:col-span-2' : 'xl:col-span-3'} bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 transition-all`}>
              <h3 className="font-bold text-slate-800 text-sm mb-6">Progres Penyelesaian Skripsi</h3>
              
              <div className="relative">
                {/* Background Line */}
                <div className="absolute top-1/2 left-0 w-full h-1.5 bg-slate-100 rounded-full -translate-y-1/2"></div>
                
                {/* Active Progress Line */}
                <div 
                  className="absolute top-1/2 left-0 h-1.5 bg-emerald-500 rounded-full -translate-y-1/2 transition-all duration-1000"
                  style={{ width: student.statusUjian === 'lulus' ? '100%' : student.statusUjian === 'hasil_selesai' ? '66%' : student.statusUjian === 'proposal_selesai' ? '33%' : '0%' }}
                ></div>

                {/* Steps */}
                <div className="relative flex justify-between">
                  {[
                    { label: 'Pendaftaran', status: 'done', desc: 'Selesai' },
                    { label: 'Ujian Proposal', status: student.statusUjian === 'proposal_selesai' || student.statusUjian === 'hasil_selesai' || student.statusUjian === 'lulus' ? 'done' : 'active', desc: 'Tahap 1' },
                    { label: 'Seminar Hasil', status: student.statusUjian === 'hasil_selesai' || student.statusUjian === 'lulus' ? 'done' : student.statusUjian === 'proposal_selesai' ? 'active' : 'pending', desc: 'Tahap 2' },
                    { label: 'Ujian Munaqasyah', status: student.statusUjian === 'lulus' ? 'done' : student.statusUjian === 'hasil_selesai' ? 'active' : 'pending', desc: 'Final' }
                  ].map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center w-1/4">
                      <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center bg-white z-10 transition-colors
                        ${step.status === 'done' ? 'border-emerald-500 text-emerald-500' : step.status === 'active' ? 'border-blue-500 text-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]' : 'border-slate-200 text-slate-300'}`}>
                        {step.status === 'done' ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <div className={`w-2.5 h-2.5 rounded-full ${step.status === 'active' ? 'bg-blue-500' : 'bg-slate-200'}`}></div>
                        )}
                      </div>
                      <p className={`mt-3 text-xs font-bold text-center leading-tight ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-700'}`}>{step.label}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions (Muncul jika ada jadwal ATAU sudah lulus) */}
            {(currentSchedule || student.statusUjian === 'lulus') && (
              <div className="xl:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 flex flex-col transition-all">
                <h3 className="font-bold text-slate-800 text-sm mb-4">Berkas Administrasi Ujian</h3>
                <div className="grid grid-cols-2 gap-3 flex-1">
                  {/* Berita Acara & Lembar Pengesahan hanya muncul jika punya jadwal. SKL muncul jika lulus. */}
                  {currentSchedule && (
                    <>
                      <button 
                        onClick={() => generateBeritaAcara(student, currentSchedule)}
                        className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors text-slate-600 group"
                      >
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:text-emerald-600">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <span className="text-[11px] font-bold text-center leading-tight">Berita Acara<br/>Ujian</span>
                      </button>
                      <button 
                        onClick={() => generateLembarPengesahan(student, currentSchedule)}
                        className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-colors text-slate-600 group"
                      >
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:text-amber-600">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </div>
                        <span className="text-[11px] font-bold text-center leading-tight">Unduh Template<br/>Lembar Pengesahan</span>
                      </button>
                    </>
                  )}
                  
                  {student.statusUjian === 'lulus' && (
                    <button 
                      onClick={() => generateSKL(student, currentSchedule)}
                      className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 hover:text-emerald-800 transition-colors text-emerald-700 group col-span-2"
                    >
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:text-emerald-700 text-emerald-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0v7" /></svg>
                      </div>
                      <span className="text-[11px] font-bold text-center leading-tight">Unduh Surat Keterangan Lulus (SKL)</span>
                    </button>
                  )}
                </div>
              </div>
            )}
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
              <MiniCalendar scheduleDate={currentSchedule?.tanggal} />

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

                {/* Tampilkan catatan dari penguji 1 dan 2 */}
                {(latestCompletedSchedule?.catatanPenguji1 || latestCompletedSchedule?.catatanPenguji2) && (
                  <div className="mt-4 space-y-3">
                    {latestCompletedSchedule?.catatanPenguji1 && (
                      <div className="border rounded-xl p-4 bg-blue-50 border-blue-200">
                        <p className="text-xs font-bold mb-2 flex items-center gap-1.5 text-blue-800">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          Catatan Penguji 1 ({latestCompletedSchedule.penguji1})
                        </p>
                        <p className="text-sm leading-relaxed italic text-blue-900">"{latestCompletedSchedule.catatanPenguji1}"</p>
                      </div>
                    )}
                    {latestCompletedSchedule?.catatanPenguji2 && (
                      <div className="border rounded-xl p-4 bg-blue-50 border-blue-200">
                        <p className="text-xs font-bold mb-2 flex items-center gap-1.5 text-blue-800">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          Catatan Penguji 2 ({latestCompletedSchedule.penguji2})
                        </p>
                        <p className="text-sm leading-relaxed italic text-blue-900">"{latestCompletedSchedule.catatanPenguji2}"</p>
                      </div>
                    )}
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
  const colorThemes = {
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'bg-amber-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', iconBg: 'bg-rose-100' }
  };

  const theme = colorThemes[color];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${theme.bg} ${theme.text} group-hover:${theme.iconBg}`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={icon} />
          </svg>
        </div>
        <h4 className="text-3xl font-black text-slate-800 leading-none mt-1">{count}</h4>
      </div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
    </div>
  );
}

function MiniCalendar({ scheduleDate }) {
  const today = new Date();
  const displayDate = scheduleDate ? new Date(scheduleDate) : today;
  const dispMonth = displayDate.getMonth();
  const dispYear = displayDate.getFullYear();
  
  const firstDay = new Date(dispYear, dispMonth, 1).getDay();
  const daysInMonth = new Date(dispYear, dispMonth + 1, 0).getDate();
  
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 text-sm">Kalender Akademik</h3>
        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
          {monthNames[dispMonth]} {dispYear}
        </span>
      </div>
      
      <div className="grid grid-cols-7 text-center gap-1 mb-2">
        {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((d, i) => (
          <div key={i} className="text-[10px] font-bold text-slate-400">{d}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
        {days.map((day, idx) => {
          if (!day) return <div key={idx} className="p-1"></div>;
          
          const isSchedule = scheduleDate && new Date(scheduleDate).getDate() === day && dispMonth === new Date(scheduleDate).getMonth() && dispYear === new Date(scheduleDate).getFullYear();
          const isToday = day === today.getDate() && dispMonth === today.getMonth() && dispYear === today.getFullYear();
          
          return (
            <div key={idx} className={`text-xs font-bold rounded-full w-7 h-7 mx-auto flex items-center justify-center cursor-default transition-all
              ${isSchedule && !isToday ? 'border-2 border-blue-600 text-blue-700' 
                : isToday ? 'bg-emerald-500 text-white shadow-md ring-2 ring-emerald-200' 
                : 'text-slate-600 hover:bg-slate-100'}`}>
              {day}
            </div>
          );
        })}
      </div>
    </section>
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
