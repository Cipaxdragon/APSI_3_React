import React, { useState, useEffect } from 'react';
import PengujiSidebar from '../../components/layout/PengujiSidebar';
import PageHeader from '../../components/layout/PageHeader';
import { SidanusDB } from '../../db/sidanusDB';
import { useAuth } from '../../context/AuthContext';

export default function PengujiDashboardPage() {
  const { session } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [nilaiModal, setNilaiModal] = useState({ open: false, sch: null });

  useEffect(() => {
    setSchedules(SidanusDB.getSchedules());
  }, []);

  // Untuk demo, fallback ke dosen yang ada di seed
  const pengujiName = session.identifier === 'penguji' ? 'Faisal Akib, S.Kom., M.Kom.' : session.identifier;

  const hasFinished = (sch) => {
    return (sch.penguji1 === pengujiName && sch.statusPenguji1 === 'selesai') ||
           (sch.penguji2 === pengujiName && sch.statusPenguji2 === 'selesai') ||
           (sch.ketuaSidang === pengujiName && sch.statusKetua === 'selesai') ||
           (sch.sekretaris === pengujiName && sch.statusSekretaris === 'selesai');
  };

  const mySchedules = schedules.filter(sch =>
    sch.statusKaprodi === 'disetujui' && !hasFinished(sch) &&
    (sch.ketuaSidang === pengujiName ||
     sch.sekretaris === pengujiName ||
     sch.penguji1 === pengujiName ||
     sch.penguji2 === pengujiName)
  );



  const handleSelesaikanUjian = (sch, { nilai, catatan }) => {
    const student = SidanusDB.getStudent(sch.nim);
    if (!student) return;

    const updatedSch = { ...sch };
    if (sch.penguji1 === pengujiName) {
      updatedSch.statusPenguji1 = 'selesai';
      updatedSch.nilaiPenguji1 = nilai;
      updatedSch.catatanPenguji1 = catatan;
    } else if (sch.penguji2 === pengujiName) {
      updatedSch.statusPenguji2 = 'selesai';
      updatedSch.nilaiPenguji2 = nilai;
      updatedSch.catatanPenguji2 = catatan;
    } else if (sch.ketuaSidang === pengujiName) {
      updatedSch.statusKetua = 'selesai';
      updatedSch.catatanKetua = catatan;
    } else if (sch.sekretaris === pengujiName) {
      updatedSch.statusSekretaris = 'selesai';
      updatedSch.catatanSekretaris = catatan;
    }

    // Check if both Penguji 1 and 2 are finished (Ketua & Sekretaris optional for completion lock)
    const isBothDone = updatedSch.statusPenguji1 === 'selesai' && updatedSch.statusPenguji2 === 'selesai';

    SidanusDB.updateSchedule(sch.id, updatedSch);

    if (isBothDone) {
      const newStatus =
        sch.jenisUjian === 'proposal' ? 'proposal_selesai'
        : sch.jenisUjian === 'hasil' ? 'hasil_selesai'
        : 'lulus';

      SidanusDB.updateStudent(sch.nim, { statusUjian: newStatus });

      if (sch.registrationId) {
        SidanusDB.updateRegistration(sch.registrationId, { statusVerifikasi: 'lulus' });
      }

      SidanusDB.updateSchedule(sch.id, {
        statusKaprodi: 'selesai',
        tanggalSelesai: new Date().toISOString(),
      });
      alert(`✅ Ujian ${SidanusDB.getExamLabel(sch.jenisUjian)} untuk ${student.nama} telah diselesaikan sepenuhnya!`);
    } else {
      alert(`✅ Input Anda berhasil disimpan. Menunggu penguji lain untuk menyelesaikan ujian ini.`);
    }

    setSchedules(SidanusDB.getSchedules());
    setNilaiModal({ open: false, sch: null });
  };

  const getMyRole = (sch) => {
    const roles = [];
    if (sch.ketuaSidang?.includes(pengujiName)) roles.push('Ketua/Pembimbing 1');
    if (sch.sekretaris?.includes(pengujiName)) roles.push('Sekretaris/Pembimbing 2');
    if (sch.penguji1?.includes(pengujiName)) roles.push('Penguji 1');
    if (sch.penguji2?.includes(pengujiName)) roles.push('Penguji 2');
    return roles.join(', ');
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <PengujiSidebar />
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <PageHeader title="Portal Dosen Penguji" />

        <NilaiModal
          modal={nilaiModal}
          onClose={() => setNilaiModal({ open: false, sch: null })}
          onSubmit={handleSelesaikanUjian}
        />

        <main className="flex-1 p-4 sm:p-6 space-y-6">
          {/* Banner */}
          <section className="bg-gradient-to-r from-rose-700 to-rose-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
            <p className="text-rose-200 text-xs font-semibold uppercase tracking-wider mb-1">Selamat Datang,</p>
            <h2 className="text-xl sm:text-2xl font-extrabold">{pengujiName}</h2>
            <p className="text-rose-100 text-sm mt-1">Dosen Penguji / Pembimbing</p>
            <div className="mt-4 flex gap-6">
              <div>
                <p className="text-3xl font-extrabold">{mySchedules.length}</p>
                <p className="text-xs text-rose-200 uppercase tracking-wider font-semibold">Ujian Aktif</p>
              </div>
            </div>
          </section>

          {/* Info simulasi */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <p className="text-xs font-bold text-amber-800">Mode Simulasi</p>
              <p className="text-xs text-amber-700 mt-0.5">Ujian dapat diselesaikan kapan saja tanpa harus menunggu jadwal berlangsung. Ini adalah simulasi alur penilaian.</p>
            </div>
          </div>

          {/* Jadwal Aktif */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Jadwal Menguji Aktif</h2>
              <span className="text-xs bg-rose-100 text-rose-700 font-bold px-3 py-1 rounded-full">{mySchedules.length} jadwal</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase">WAKTU & RUANGAN</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase">MAHASISWA</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase">JUDUL & UJIAN</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mySchedules.map((sch) => {
                    const student = SidanusDB.getStudent(sch.nim);
                    return (
                      <tr key={sch.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-slate-700">{SidanusDB.formatDate(sch.tanggal)}</p>
                          <p className="text-xs font-semibold text-rose-600 mt-1">{sch.jamMulai} - {sch.jamSelesai}</p>
                          <p className="text-xs text-slate-500 mt-1">{sch.ruangan}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800 text-sm">{student?.nama}</p>
                          <p className="text-xs text-slate-500">{student?.nim}</p>
                          <span className="inline-block mt-1.5 text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                            Peran: {getMyRole(sch)}
                          </span>
                        </td>
                        <td className="px-5 py-4 max-w-xs">
                          <p className="text-xs text-slate-600 italic line-clamp-2 leading-relaxed mb-2">"{student?.judul}"</p>
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            {SidanusDB.getExamLabel(sch.jenisUjian)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => setNilaiModal({ open: true, sch })}
                            className="text-xs font-bold text-white bg-rose-600 px-4 py-2 rounded-xl shadow-sm hover:bg-rose-700 transition-colors w-full flex items-center justify-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Selesaikan Ujian
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {mySchedules.length === 0 && (
                    <tr><td colSpan="4" className="text-center py-10 text-slate-400 text-sm">Belum ada jadwal menguji aktif.</td></tr>
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

// ─── Modal Penilaian Ujian ────────────────────────────
function NilaiModal({ modal, onClose, onSubmit }) {
  const [nilai, setNilai] = useState('A');
  const [catatan, setCatatan] = useState('');

  if (!modal.open || !modal.sch) return null;
  const sch = modal.sch;
  const student = SidanusDB.getStudent(sch.nim);

  const isScoredExam = sch.jenisUjian !== 'proposal';

  const handleSubmit = (e) => {
    e.preventDefault();
    const actionLabel = isScoredExam ? `Selesaikan ujian dengan nilai ${nilai}?` : `Selesaikan ujian ini?`;
    if (!window.confirm(`Konfirmasi: ${actionLabel}`)) return;
    onSubmit(sch, { nilai: isScoredExam ? nilai : null, catatan });
    setNilai('A');
    setCatatan('');
  };

  const nilaiOptions = [
    { value: 'A', label: 'A (Sangat Memuaskan)', color: 'emerald' },
    { value: 'B+', label: 'B+ (Memuaskan)', color: 'teal' },
    { value: 'B', label: 'B (Baik)', color: 'blue' },
    { value: 'C+', label: 'C+ (Cukup Baik)', color: 'amber' },
    { value: 'C', label: 'C (Cukup)', color: 'orange' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Penyelesaian Ujian</h3>
            <p className="text-xs text-slate-500 mt-0.5">{SidanusDB.getExamLabel(sch.jenisUjian)} · {sch.id}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Info Mahasiswa */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-400 font-medium mb-1">Mahasiswa</p>
            <p className="font-bold text-slate-800">{student?.nama}</p>
            <p className="text-xs text-slate-500 italic mt-0.5 line-clamp-2">"{student?.judul}"</p>
          </div>

          {/* Pilih Nilai (Hanya untuk non-proposal) */}
          {isScoredExam && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Nilai Akhir Ujian</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {nilaiOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setNilai(opt.value)}
                    className={`py-3 rounded-xl text-sm font-extrabold border-2 transition-all ${nilai === opt.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 scale-105 shadow-md'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {opt.value}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">{nilaiOptions.find(o => o.value === nilai)?.label}</p>
            </div>
          )}

          {/* Catatan */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Catatan / Rekomendasi Sidang</label>
            <textarea
              rows={3}
              value={catatan}
              onChange={e => setCatatan(e.target.value)}
              placeholder="Contoh: Mahasiswa perlu memperbaiki bab 3 metodologi penelitian..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-rose-400"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl text-sm hover:bg-slate-50 transition-colors">
              Batal
            </button>
            <button type="submit" className="flex-1 bg-rose-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-rose-700 transition-colors flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Simpan & Selesaikan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
