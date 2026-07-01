import React, { useState, useEffect } from 'react';
import PengujiSidebar from '../../components/layout/PengujiSidebar';
import PageHeader from '../../components/layout/PageHeader';
import { SidanusDB } from '../../db/sidanusDB';
import { useAuth } from '../../context/AuthContext';
import { Archive } from 'lucide-react';

export default function PengujiRiwayatPage() {
  const { session } = useAuth();
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    setSchedules(SidanusDB.getSchedules());
  }, []);

  const pengujiName = session.identifier === 'penguji' ? 'Faisal Akib, S.Kom., M.Kom.' : session.identifier;

  const hasFinished = (sch) => {
    return (sch.penguji1 === pengujiName && sch.statusPenguji1 === 'selesai') ||
           (sch.penguji2 === pengujiName && sch.statusPenguji2 === 'selesai') ||
           (sch.ketuaSidang === pengujiName && sch.statusKetua === 'selesai') ||
           (sch.sekretaris === pengujiName && sch.statusSekretaris === 'selesai');
  };

  const completedSchedules = schedules.filter(sch =>
    (sch.statusKaprodi === 'selesai' || hasFinished(sch)) &&
    (sch.ketuaSidang === pengujiName ||
     sch.sekretaris === pengujiName ||
     sch.penguji1 === pengujiName ||
     sch.penguji2 === pengujiName)
  );

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <PengujiSidebar />
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <PageHeader title="Portal Dosen Penguji" />

        <main className="flex-1 p-4 sm:p-6 space-y-6">
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <Archive className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-slate-800">Riwayat Ujian Selesai</h2>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full">{completedSchedules.length} selesai</span>
            </div>
            <div className="divide-y divide-slate-100">
              {completedSchedules.map(sch => {
                const student = SidanusDB.getStudent(sch.nim);
                let myCatatan = '';
                let myNilai = '';
                
                if (sch.penguji1 === pengujiName) { myCatatan = sch.catatanPenguji1; myNilai = sch.nilaiPenguji1; }
                else if (sch.penguji2 === pengujiName) { myCatatan = sch.catatanPenguji2; myNilai = sch.nilaiPenguji2; }
                else if (sch.ketuaSidang === pengujiName) { myCatatan = sch.catatanKetua; }
                else if (sch.sekretaris === pengujiName) { myCatatan = sch.catatanSekretaris; }

                return (
                  <div key={sch.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{student?.nama}</p>
                        <p className="text-xs text-slate-500">{SidanusDB.getExamLabel(sch.jenisUjian)} · {SidanusDB.formatDate(sch.tanggal)}</p>
                        {myCatatan && <p className="text-xs text-slate-400 italic mt-1">"{myCatatan}"</p>}
                      </div>
                    </div>
                    <div className="text-right">
                        {sch.statusKaprodi !== 'selesai' ? (
                          <p className="text-[10px] text-amber-600 font-bold bg-amber-100 px-2 py-0.5 rounded-full mt-1 inline-block">Menunggu Penguji Lain</p>
                        ) : (
                          <>
                            {myNilai && <p className="text-lg font-extrabold text-emerald-600">{myNilai}</p>}
                          </>
                        )}
                    </div>
                  </div>
                );
              })}
              {completedSchedules.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-sm">Belum ada riwayat ujian yang selesai dinilai.</div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
