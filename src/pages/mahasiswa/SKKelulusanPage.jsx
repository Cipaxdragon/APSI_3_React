import React from 'react';
import MahasiswaSidebar from '../../components/layout/MahasiswaSidebar';
import PageHeader from '../../components/layout/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { SidanusDB } from '../../db/sidanusDB';
import { FileBadge, Download } from 'lucide-react';

export default function SKKelulusanPage() {
  const { session } = useAuth();
  const student = SidanusDB.getStudent(session?.identifier);
  
  if (!student) return null;

  const isLulus = student.statusUjian === 'lulus';
  
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <MahasiswaSidebar />
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <PageHeader title="SK Kelulusan" />
        
        <main className="flex-1 p-4 sm:p-6 max-w-3xl mx-auto w-full">
          {!isLulus ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileBadge className="w-10 h-10 text-slate-300" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Belum Tersedia</h2>
              <p className="text-slate-500 max-w-sm mx-auto">SK Kelulusan akan diterbitkan setelah Anda menyelesaikan Ujian Munaqasyah dan melengkapi semua persyaratan bebas pustaka & administrasi.</p>
            </div>
          ) : (
            <section className="bg-white rounded-2xl border border-emerald-100 shadow-lg shadow-emerald-500/10 p-6 sm:p-10 text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileBadge className="w-12 h-12 text-emerald-600" />
              </div>
              
              <h2 className="text-2xl font-extrabold text-slate-800 mb-1">Surat Keterangan Lulus (SKL)</h2>
              <p className="text-sm font-semibold text-emerald-600 mb-8">Telah Diterbitkan</p>

              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 text-left max-w-lg mx-auto mb-8 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-semibold text-slate-500">Nomor SKL</span>
                  <span className="font-bold text-slate-800">SKL/UIN-AM/SI/2026/089</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-semibold text-slate-500">Nama Mahasiswa</span>
                  <span className="font-bold text-slate-800">{student.nama}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-semibold text-slate-500">NIM</span>
                  <span className="font-bold text-slate-800">{student.nim}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Tanggal Terbit</span>
                  <span className="font-bold text-slate-800">18 Juni 2026</span>
                </div>
              </div>

              <button className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-95">
                <Download className="w-5 h-5" />
                Unduh PDF SKL
              </button>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
