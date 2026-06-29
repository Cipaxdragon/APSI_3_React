import React, { useState, useEffect } from 'react';
import PengujiSidebar from '../../components/layout/PengujiSidebar';
import PageHeader from '../../components/layout/PageHeader';
import { SidanusDB } from '../../db/sidanusDB';
import { useAuth } from '../../context/AuthContext';

export default function PengujiDashboardPage() {
  const { session } = useAuth();
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    setSchedules(SidanusDB.getSchedules());
  }, []);

  // Filter jadwal dimana penguji terlibat dan statusnya disetujui kaprodi
  // Identitas penguji disimpan di session.identifier
  const pengujiName = session.identifier === 'penguji' ? 'Faisal Akib, S.Kom., M.Kom.' : session.identifier; // Fallback untuk demo
  
  const mySchedules = schedules.filter(sch => 
    sch.statusKaprodi === 'disetujui' &&
    (sch.ketuaSidang.includes(pengujiName) || 
     sch.sekretaris.includes(pengujiName) || 
     sch.penguji1.includes(pengujiName) || 
     sch.penguji2.includes(pengujiName))
  );

  const handleInputNilai = (sch) => {
    if(!window.confirm('Simulasi: Tandai ujian ini telah selesai dan lulus?')) return;

    const student = SidanusDB.getStudent(sch.nim);
    if (!student) return;

    // Update status ujian mahasiswa
    const newStatus = sch.jenisUjian === 'proposal' ? 'proposal_selesai' 
                    : sch.jenisUjian === 'hasil' ? 'hasil_selesai' 
                    : 'lulus';

    SidanusDB.updateStudent(sch.nim, { statusUjian: newStatus });
    
    // Update status pendaftaran menjadi selesai agar timeline di mahasiswa reset
    if (sch.registrationId) {
      SidanusDB.updateRegistration(sch.registrationId, { statusVerifikasi: 'lulus' });
    }
    
    // Sembunyikan jadwal dari dashboard karena sudah selesai
    SidanusDB.updateSchedule(sch.id, { statusKaprodi: 'selesai' });

    alert(`Berhasil! Ujian ${SidanusDB.getExamLabel(sch.jenisUjian)} untuk ${student.nama} telah dinyatakan Selesai/Lulus.`);
    window.location.reload();
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <PengujiSidebar />
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <PageHeader title="Jadwal Ujian" />
        
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          <section className="bg-gradient-to-r from-rose-700 to-rose-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
            <h2 className="text-xl sm:text-2xl font-extrabold">{pengujiName}</h2>
            <p className="text-rose-100 text-sm mt-1">Dosen Penguji / Pembimbing</p>
            <div className="mt-4 flex gap-4">
              <div>
                <p className="text-3xl font-extrabold">{mySchedules.length}</p>
                <p className="text-xs text-rose-200 uppercase tracking-wider font-semibold">Total Jadwal Menguji</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <h2 className="font-bold text-slate-800 p-5 border-b border-slate-100">Daftar Jadwal Ujian Mahasiswa</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">WAKTU & RUANGAN</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">MAHASISWA</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">JUDUL & TIM PENGUJI</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mySchedules.map((sch) => {
                    const student = SidanusDB.getStudent(sch.nim);
                    let myRole = [];
                    if(sch.ketuaSidang.includes(pengujiName)) myRole.push("Ketua/Pembimbing 1");
                    if(sch.sekretaris.includes(pengujiName)) myRole.push("Sekretaris/Pembimbing 2");
                    if(sch.penguji1.includes(pengujiName)) myRole.push("Penguji 1");
                    if(sch.penguji2.includes(pengujiName)) myRole.push("Penguji 2");

                    return (
                      <tr key={sch.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-slate-700">{SidanusDB.formatDate(sch.tanggal)}</p>
                          <p className="text-xs font-semibold text-rose-600 mt-1">{sch.jamMulai} - {sch.jamSelesai}</p>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {sch.ruangan}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800 text-sm">{student.nama}</p>
                          <p className="text-xs text-slate-500">{student.nim}</p>
                          <span className="inline-block mt-2 text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                            Peran: {myRole.join(', ')}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-xs text-slate-600 italic line-clamp-2 leading-relaxed mb-2" title={student.judul}>"{student.judul}"</p>
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            {SidanusDB.getExamLabel(sch.jenisUjian)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button onClick={() => handleInputNilai(sch)} className="text-xs font-bold text-white bg-rose-600 px-4 py-2 rounded-lg shadow-sm hover:bg-rose-700 transition-colors w-full">
                            Tandai Lulus / Nilai
                          </button>
                          <button className="text-xs font-bold text-slate-600 bg-slate-100 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-200 transition-colors mt-2 w-full">
                            Lihat Draft
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {mySchedules.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-slate-400 text-sm">Belum ada jadwal menguji.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
