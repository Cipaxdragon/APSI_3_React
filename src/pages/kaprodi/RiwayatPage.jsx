import React, { useState, useEffect } from 'react';
import KaprodiSidebar from '../../components/layout/KaprodiSidebar';
import PageHeader from '../../components/layout/PageHeader';
import { SidanusDB } from '../../db/sidanusDB';
import { FileText, CheckCircle, XCircle } from 'lucide-react';

export default function RiwayatPage() {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    setSchedules(SidanusDB.getSchedules());
  }, []);

  const history = schedules.filter(s => ['disetujui', 'ditolak', 'selesai'].includes(s.statusKaprodi));

  // Sort by latest first (assuming ID correlates with creation order for this mock)
  history.sort((a, b) => b.id - a.id);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <KaprodiSidebar />
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <PageHeader title="Riwayat Persetujuan" />
        
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">Arsip Persetujuan Jadwal</h2>
                <p className="text-xs text-slate-500 mt-0.5">Daftar jadwal ujian yang telah Anda proses</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase">Waktu & Ruangan</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase">Mahasiswa</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase">Jenis Ujian</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase">Status & Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map(sch => {
                    const student = SidanusDB.getStudent(sch.nim);
                    const isDitolak = sch.statusKaprodi === 'ditolak';
                    return (
                      <tr key={sch.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800 text-sm">{SidanusDB.formatDate(sch.tanggal)}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{sch.jamMulai} - {sch.jamSelesai} • {sch.ruangan}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800 text-sm">{student?.nama}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{student?.nim}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${sch.jenisUjian === 'munaqasyah' ? 'bg-emerald-100 text-emerald-700' : sch.jenisUjian === 'hasil' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'}`}>
                            {SidanusDB.getExamLabel(sch.jenisUjian)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {isDitolak ? (
                            <div className="inline-flex flex-col gap-1.5">
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg w-fit">
                                <XCircle className="w-3.5 h-3.5" />
                                Ditolak
                              </span>
                              {sch.catatanKaprodi && (
                                <p className="text-[11px] text-rose-600/80 max-w-[200px] leading-snug">"{sch.catatanKaprodi}"</p>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Disetujui
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  
                  {history.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-10 text-slate-400 text-sm">
                        Belum ada riwayat persetujuan jadwal.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </main>
      </div>
    </div>
  );
}
