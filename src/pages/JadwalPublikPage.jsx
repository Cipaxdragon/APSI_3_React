import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SidanusDB } from '../db/sidanusDB';
import { Search, Calendar, MapPin, Clock } from 'lucide-react';

export default function JadwalPublikPage() {
  const [schedules, setSchedules] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Hanya jadwal yang sudah disetujui kaprodi
    const approvedSchedules = SidanusDB.getSchedules().filter(s => s.statusKaprodi === 'disetujui');
    // Sort by date nearest
    approvedSchedules.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
    setSchedules(approvedSchedules);
  }, []);

  const filtered = schedules.filter(sch => {
    const student = SidanusDB.getStudent(sch.nim);
    if (!student) return false;
    const q = search.toLowerCase();
    return student.nama.toLowerCase().includes(q) || student.nim.includes(q) || sch.ruangan.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 leading-tight">SIDANUS</h1>
              <p className="text-[10px] text-slate-500 font-medium">Jadwal Ujian Publik</p>
            </div>
          </div>
          <Link to="/" className="text-sm font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 px-4 py-2 rounded-lg transition-colors">
            Masuk Portal
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Jadwal Ujian Terbuka</h2>
          <p className="text-slate-500 mt-2">Daftar jadwal ujian mahasiswa Program Studi Sistem Informasi</p>
        </div>

        <div className="relative max-w-xl mx-auto mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input 
            type="text" 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm shadow-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:outline-none transition-all"
            placeholder="Cari nama mahasiswa, NIM, atau ruangan..." 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(sch => {
            const student = SidanusDB.getStudent(sch.nim);
            return (
              <div key={sch.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                <div className={`px-5 py-3 border-b border-slate-100 flex items-center justify-between ${
                  sch.jenisUjian === 'munaqasyah' ? 'bg-emerald-50 border-emerald-100' :
                  sch.jenisUjian === 'hasil' ? 'bg-teal-50 border-teal-100' : 'bg-blue-50 border-blue-100'
                }`}>
                  <span className={`text-xs font-bold ${
                    sch.jenisUjian === 'munaqasyah' ? 'text-emerald-700' :
                    sch.jenisUjian === 'hasil' ? 'text-teal-700' : 'text-blue-700'
                  }`}>
                    {SidanusDB.getExamLabel(sch.jenisUjian)}
                  </span>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-4">
                    <p className="font-extrabold text-slate-800 text-lg leading-tight">{student.nama}</p>
                    <p className="text-sm font-medium text-slate-500">{student.nim}</p>
                  </div>
                  
                  <div className="space-y-2 mt-auto">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-brand-500" />
                      <span className="font-semibold">{SidanusDB.formatDate(sch.tanggal)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Clock className="w-4 h-4 text-brand-500" />
                      <span>{sch.jamMulai} - {sch.jamSelesai}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-brand-500" />
                      <span>{sch.ruangan}</span>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 mt-auto">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tim Penguji</p>
                  <ul className="text-xs text-slate-600 space-y-1">
                    <li className="flex gap-2"><span className="w-4 shrink-0 text-slate-400">1.</span> <span className="truncate">{sch.ketuaSidang}</span></li>
                    <li className="flex gap-2"><span className="w-4 shrink-0 text-slate-400">2.</span> <span className="truncate">{sch.sekretaris}</span></li>
                    <li className="flex gap-2"><span className="w-4 shrink-0 text-slate-400">3.</span> <span className="truncate">{sch.penguji1}</span></li>
                    <li className="flex gap-2"><span className="w-4 shrink-0 text-slate-400">4.</span> <span className="truncate">{sch.penguji2}</span></li>
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg font-medium">Tidak ada jadwal ujian ditemukan.</p>
          </div>
        )}
      </main>
    </div>
  );
}
