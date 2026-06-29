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
  const statDikirim = registrations.length;
  const statDisetujui = registrations.filter(r => r.statusVerifikasi === 'disetujui').length;
  const statRevisi = registrations.filter(r => r.statusVerifikasi === 'dikembalikan').length;
  
  const schedules = SidanusDB.getSchedules();
  const activeSchedules = schedules.filter(s => s.nim === student.nim && s.statusKaprodi === 'disetujui');
  const statJadwal = activeSchedules.length;

  const currentSchedule = activeSchedules.length > 0 ? activeSchedules[0] : null;

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <MahasiswaSidebar />
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <PageHeader title="Dashboard Mahasiswa" />
        
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          {/* Welcome Banner */}
          <section className="bg-gradient-to-r from-emerald-700 to-emerald-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
            <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1">Selamat Datang,</p>
            <h2 className="text-xl sm:text-2xl font-extrabold">{student.nama} 👋</h2>
            <p className="text-emerald-100 text-sm mt-1">{student.nim} • {student.prodi}</p>
            
            <div className="mt-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3 flex items-start gap-3 max-w-2xl">
              <svg className="w-4 h-4 text-emerald-200 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wide mb-0.5">Judul Skripsi</p>
                <p className="text-white text-xs sm:text-sm font-medium leading-relaxed italic">"{student.judul}"</p>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/mahasiswa/daftar-ujian" className="inline-flex items-center gap-2 bg-white text-emerald-700 text-xs font-bold px-4 py-2 rounded-xl shadow hover:shadow-md transition-shadow">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Daftar Ujian Baru
              </Link>
            </div>
          </section>

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
                {student.statusUjian === 'hasil_selesai' ? (
                  <div>
                    <p className="text-emerald-600 font-bold text-sm">Telah Lulus Munaqasyah</p>
                    <Link to="/mahasiswa/sk-kelulusan" className="mt-3 block w-full text-center text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 py-2 rounded-lg transition-colors">
                      Lihat SK Kelulusan
                    </Link>
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm text-center py-4">Belum ada pengumuman kelulusan.</p>
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
  const isApproved = activeReg.statusVerifikasi === 'disetujui';

  const steps = [
    { label: 'Kirim Berkas', status: 'done', desc: `Pendaftaran ${SidanusDB.getExamLabel(activeReg.jenisUjian)} dikirim` },
    { 
      label: 'Verifikasi Admin', 
      status: isApproved ? 'done' : (isReturned ? 'error' : 'active'), 
      desc: isApproved ? 'Disetujui Admin' : (isReturned ? 'Berkas Perlu Revisi' : 'Sedang diverifikasi') 
    },
    { label: 'Penjadwalan', status: 'pending', desc: 'Menunggu plotting jadwal' },
    { label: 'Persetujuan Kaprodi', status: 'pending', desc: 'Menunggu SK Kaprodi' },
  ];

  if (!isReturned) {
    const schedule = SidanusDB.getSchedules().find(s => s.registrationId === activeReg.id);
    if (schedule) {
      steps[2].status = 'done'; steps[2].desc = 'Jadwal diusulkan';
      if (schedule.statusKaprodi === 'disetujui') {
        steps[3].status = 'done'; steps[3].desc = 'Disetujui Kaprodi';
      } else if (schedule.statusKaprodi === 'ditolak') {
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
