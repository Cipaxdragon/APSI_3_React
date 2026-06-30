import React, { useState, useEffect } from 'react';
import KaprodiSidebar from '../../components/layout/KaprodiSidebar';
import PageHeader from '../../components/layout/PageHeader';
import { SidanusDB } from '../../db/sidanusDB';

export default function KaprodiDashboardPage() {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    setSchedules(SidanusDB.getSchedules());
  }, []);

  const antrian = schedules.filter(s => s.statusKaprodi === 'menunggu');
  const disetujui = schedules.filter(s => s.statusKaprodi === 'disetujui');

  const [rejectModal, setRejectModal] = useState({ open: false, schId: null, catatan: '' });

  const handleVerify = (id, newStatus) => {
    if (newStatus === 'ditolak') {
      setRejectModal({ open: true, schId: id, catatan: '' });
      return;
    }
    SidanusDB.updateSchedule(id, { statusKaprodi: newStatus });
    setSchedules(SidanusDB.getSchedules());
  };

  const handleTolakSubmit = (e) => {
    e.preventDefault();
    if (!rejectModal.catatan.trim()) {
      alert('Harap isi alasan penolakan.');
      return;
    }
    SidanusDB.updateSchedule(rejectModal.schId, { 
      statusKaprodi: 'ditolak', 
      catatanKaprodi: rejectModal.catatan 
    });
    setSchedules(SidanusDB.getSchedules());
    setRejectModal({ open: false, schId: null, catatan: '' });
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <KaprodiSidebar />
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <PageHeader title="Persetujuan Jadwal Ujian" />
        
        {/* Modal Tolak */}
        {rejectModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Tolak Jadwal</h3>
                <button onClick={() => setRejectModal({ open: false, schId: null, catatan: '' })} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <form onSubmit={handleTolakSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Alasan Penolakan</label>
                  <textarea
                    rows="3"
                    value={rejectModal.catatan}
                    onChange={e => setRejectModal({...rejectModal, catatan: e.target.value})}
                    placeholder="Contoh: Dosen penguji 2 sedang cuti, mohon ganti dosen..."
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-100 focus:border-rose-400 outline-none"
                    required
                  ></textarea>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setRejectModal({ open: false, schId: null, catatan: '' })} className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200">Batal</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-sm hover:bg-rose-700">Kirim Penolakan</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 space-y-6">
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-3xl font-extrabold text-amber-600">{antrian.length}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">Menunggu Persetujuan</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-3xl font-extrabold text-emerald-600">{disetujui.length}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">Total Jadwal Disetujui</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <h2 className="font-bold text-slate-800 p-5 border-b border-slate-100">Antrian Persetujuan Jadwal</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">MAHASISWA</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">JADWAL & RUANGAN</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">TIM PENGUJI</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {antrian.map((sch) => {
                    const student = SidanusDB.getStudent(sch.nim);
                    return (
                      <tr key={sch.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800 text-sm">{student.nama}</p>
                          <p className="text-xs text-slate-500">{student.nim}</p>
                          <span className="inline-block mt-1 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            {SidanusDB.getExamLabel(sch.jenisUjian)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-slate-700">{SidanusDB.formatDate(sch.tanggal)}</p>
                          <p className="text-xs text-slate-600">{sch.jamMulai} - {sch.jamSelesai}</p>
                          <p className="text-xs text-slate-500 mt-1">{sch.ruangan}</p>
                        </td>
                        <td className="px-5 py-4">
                          <ul className="text-xs text-slate-600 space-y-1">
                            <li><span className="font-semibold w-16 inline-block">Ketua:</span> {sch.ketuaSidang}</li>
                            <li><span className="font-semibold w-16 inline-block">Sekretaris:</span> {sch.sekretaris}</li>
                            <li><span className="font-semibold w-16 inline-block">Penguji 1:</span> {sch.penguji1}</li>
                            <li><span className="font-semibold w-16 inline-block">Penguji 2:</span> {sch.penguji2}</li>
                          </ul>
                        </td>
                        <td className="px-5 py-4 text-center space-y-2">
                          <button onClick={() => handleVerify(sch.id, 'disetujui')} className="block w-full text-center text-xs font-bold bg-emerald-100 text-emerald-700 py-2 rounded-lg hover:bg-emerald-200">Setujui Jadwal</button>
                          <button onClick={() => handleVerify(sch.id, 'ditolak')} className="block w-full text-center text-xs font-bold bg-rose-100 text-rose-700 py-2 rounded-lg hover:bg-rose-200">Tolak & Revisi</button>
                        </td>
                      </tr>
                    );
                  })}
                  {antrian.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-slate-400 text-sm">Tidak ada jadwal yang perlu disetujui.</td>
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
