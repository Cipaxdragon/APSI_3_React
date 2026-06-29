import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/layout/AdminSidebar';
import PageHeader from '../../components/layout/PageHeader';
import { SidanusDB } from '../../db/sidanusDB';
import { useRegistrations } from '../../hooks/useRegistrations';

export default function AdminDashboardPage() {
  const { registrations, updateRegistration } = useRegistrations();
  
  const statMasuk = registrations.length;
  const statMenunggu = registrations.filter(r => r.statusVerifikasi === 'menunggu').length;
  const statDisetujui = registrations.filter(r => r.statusVerifikasi === 'disetujui').length;
  const statDikembalikan = registrations.filter(r => r.statusVerifikasi === 'dikembalikan').length;

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('Semua Jenis Ujian');
  const [filterStatus, setFilterStatus] = useState('Semua Status');

  const filteredRegs = registrations.filter(reg => {
    const student = SidanusDB.getStudent(reg.nim);
    if (!student) return false;
    
    const matchSearch = student.nama.toLowerCase().includes(search.toLowerCase()) || student.nim.includes(search);
    const matchType = filterType === 'Semua Jenis Ujian' || SidanusDB.getExamLabel(reg.jenisUjian) === filterType;
    let matchStatus = true;
    if (filterStatus === 'Menunggu Verifikasi') matchStatus = reg.statusVerifikasi === 'menunggu';
    if (filterStatus === 'Disetujui') matchStatus = reg.statusVerifikasi === 'disetujui';
    if (filterStatus === 'Dikembalikan') matchStatus = reg.statusVerifikasi === 'dikembalikan';

    return matchSearch && matchType && matchStatus;
  });

  const handleVerify = (id, newStatus) => {
    updateRegistration(id, { statusVerifikasi: newStatus });
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <AdminSidebar />
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <PageHeader title="Verifikasi Berkas Pendaftaran" />
        
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          {/* Stats */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard value={statMasuk} label="Total Masuk" desc="Bulan Ini" color="blue" />
            <StatCard value={statMenunggu} label="Menunggu Verifikasi" desc="Perlu ditindaklanjuti" color="amber" />
            <StatCard value={statDisetujui} label="Disetujui" desc="Lanjut penjadwalan" color="emerald" />
            <StatCard value={statDikembalikan} label="Dikembalikan" desc="Berkas tidak lengkap" color="rose" />
          </section>

          {/* Filters */}
          <section className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama / NIM mahasiswa..." className="input-style w-full pl-10" />
            </div>
            <div className="flex gap-3">
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input-style w-40">
                <option>Semua Jenis Ujian</option>
                <option>Ujian Proposal</option>
                <option>Seminar Hasil</option>
                <option>Munaqasyah</option>
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-style w-40">
                <option>Semua Status</option>
                <option>Menunggu Verifikasi</option>
                <option>Disetujui</option>
                <option>Dikembalikan</option>
              </select>
            </div>
          </section>

          {/* Table */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">NO</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">MAHASISWA</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">JENIS UJIAN</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">TGL. DAFTAR</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">STATUS</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRegs.map((reg, idx) => {
                    const student = SidanusDB.getStudent(reg.nim);
                    const isDisetujui = reg.statusVerifikasi === 'disetujui';
                    return (
                      <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 text-slate-400 font-medium">{String(idx+1).padStart(2,'0')}</td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800 text-sm">{student.nama}</p>
                          <p className="text-xs text-slate-500">{student.nim}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            reg.jenisUjian === 'munaqasyah' ? 'bg-emerald-100 text-emerald-700' : 
                            reg.jenisUjian === 'hasil' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {SidanusDB.getExamLabel(reg.jenisUjian)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-600">{SidanusDB.formatDate(reg.tanggalDaftar)}</td>
                        <td className="px-5 py-4">
                          {isDisetujui ? <span className="text-emerald-600 text-xs font-bold bg-emerald-100 px-2 py-1 rounded-full">✓ Disetujui</span>
                           : reg.statusVerifikasi === 'dikembalikan' ? <span className="text-rose-600 text-xs font-bold bg-rose-100 px-2 py-1 rounded-full">✗ Dikembalikan</span>
                           : <span className="text-amber-600 text-xs font-bold bg-amber-100 px-2 py-1 rounded-full">⏳ Menunggu</span>}
                        </td>
                        <td className="px-5 py-4 text-center">
                          {reg.statusVerifikasi === 'menunggu' ? (
                            <div className="flex justify-center gap-2">
                              <button onClick={() => handleVerify(reg.id, 'disetujui')} className="text-xs font-bold text-emerald-600 hover:underline">Setujui</button>
                              <button onClick={() => handleVerify(reg.id, 'dikembalikan')} className="text-xs font-bold text-rose-600 hover:underline">Tolak</button>
                            </div>
                          ) : isDisetujui ? (
                            <Link to="/admin/penjadwalan" className="text-xs font-bold text-violet-600 hover:underline">📅 Jadwalkan</Link>
                          ) : (
                            <span className="text-xs text-slate-400">Selesai</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRegs.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-400 text-sm">Tidak ada pendaftaran ditemukan.</td>
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

function StatCard({ value, label, desc, color }) {
  const colorMap = {
    blue: 'text-blue-600',
    amber: 'text-amber-600',
    emerald: 'text-emerald-600',
    rose: 'text-rose-600'
  };
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <p className={`text-3xl font-extrabold ${colorMap[color]}`}>{value}</p>
      <p className="text-xs text-slate-500 font-medium mt-1">{label}</p>
      <p className={`text-[10px] ${colorMap[color]} mt-1`}>{desc}</p>
    </div>
  );
}
