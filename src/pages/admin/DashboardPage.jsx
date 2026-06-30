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

  const [rejectModal, setRejectModal] = useState({ open: false, regId: null, catatan: '' });
  const [berkasModal, setBerkasModal] = useState({ open: false, reg: null });

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

  const handleVerify = (id, newStatus, catatan = '') => {
    updateRegistration(id, { statusVerifikasi: newStatus, catatanAdmin: catatan });
  };
  const handleTolak = (id) => setRejectModal({ open: true, regId: id, catatan: '' });
  const handleTolakSubmit = () => {
    if (!rejectModal.catatan.trim()) {
      alert('Harap isi catatan alasan penolakan agar mahasiswa bisa memperbaiki berkasnya.');
      return;
    }
    handleVerify(rejectModal.regId, 'dikembalikan', rejectModal.catatan);
    setRejectModal({ open: false, regId: null, catatan: '' });
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <AdminSidebar />
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <PageHeader title="Verifikasi Berkas Pendaftaran" />
        <RejectModal modal={rejectModal} setModal={setRejectModal} onSubmit={handleTolakSubmit} />
        <BerkasModal
          modal={berkasModal}
          onClose={() => setBerkasModal({ open: false, reg: null })}
          onSetujui={(id) => { handleVerify(id, 'disetujui'); setBerkasModal({ open: false, reg: null }); }}
          onTolak={(id) => { setBerkasModal({ open: false, reg: null }); handleTolak(id); }}
        />
        
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
              <span className="absolute inset-y-0 left-3 flex items-center">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
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
                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">BERKAS</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">STATUS</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRegs.map((reg, idx) => {
                    const student = SidanusDB.getStudent(reg.nim);
                    const requirements = SidanusDB.getBerkasRequirements(reg.jenisUjian);
                    const uploadedCount = requirements.filter(r => reg.berkas?.[r.key] && typeof reg.berkas[r.key] === 'object').length;
                    const totalReq = requirements.length;
                    const isDisetujui = reg.statusVerifikasi === 'disetujui';
                    const hasActiveSchedule = SidanusDB.getSchedules().some(s => s.registrationId === reg.id && s.statusKaprodi !== 'ditolak');
                    const rejectedSchedule = SidanusDB.getSchedules().slice().reverse().find(s => s.registrationId === reg.id && s.statusKaprodi === 'ditolak');
                    
                    return (
                      <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 text-slate-400 font-medium">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800 text-sm">{student.nama}</p>
                          <p className="text-xs text-slate-500">{student.nim}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${reg.jenisUjian === 'munaqasyah' ? 'bg-emerald-100 text-emerald-700' : reg.jenisUjian === 'hasil' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'}`}>
                            {SidanusDB.getExamLabel(reg.jenisUjian)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-600">{SidanusDB.formatDate(reg.tanggalDaftar)}</td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setBerkasModal({ open: true, reg })}
                            className="flex items-center gap-1.5 text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            Periksa ({uploadedCount}/{totalReq})
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          {isDisetujui
                            ? <span className="text-emerald-600 text-xs font-bold bg-emerald-100 px-2 py-1 rounded-full">✓ Disetujui</span>
                            : reg.statusVerifikasi === 'dikembalikan'
                            ? <span className="text-rose-600 text-xs font-bold bg-rose-100 px-2 py-1 rounded-full">✗ Dikembalikan</span>
                            : <span className="text-amber-600 text-xs font-bold bg-amber-100 px-2 py-1 rounded-full">⏳ Menunggu</span>}
                        </td>
                        <td className="px-5 py-4 text-center">
                          {reg.statusVerifikasi === 'menunggu' ? (
                            <div className="flex justify-center gap-2">
                              <button onClick={() => handleVerify(reg.id, 'disetujui')} className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                Setujui
                              </button>
                              <button onClick={() => handleTolak(reg.id)} className="flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                Tolak
                              </button>
                            </div>
                          ) : isDisetujui && !hasActiveSchedule ? (
                            <div className="flex flex-col items-center gap-1.5">
                              {rejectedSchedule && (
                                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1 cursor-help" title={`Alasan Penolakan: ${rejectedSchedule.catatanKaprodi}`}>
                                  ⚠️ Jadwal Ditolak
                                </span>
                              )}
                              <Link to="/admin/penjadwalan" className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {rejectedSchedule ? 'Jadwalkan Ulang' : 'Jadwalkan'}
                              </Link>
                            </div>
                          ) : isDisetujui && hasActiveSchedule ? (
                            <span className="text-xs font-bold text-slate-400">✓ Dijadwalkan</span>
                          ) : (
                            <span className="text-xs text-slate-400">Selesai</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRegs.length === 0 && (
                    <tr><td colSpan="7" className="text-center py-8 text-slate-400 text-sm">Tidak ada pendaftaran ditemukan.</td></tr>
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

// ─── Modal Verifikasi Berkas ──────────────────────────
function BerkasModal({ modal, onClose, onSetujui, onTolak }) {
  if (!modal.open || !modal.reg) return null;
  const reg = modal.reg;
  const student = SidanusDB.getStudent(reg.nim);
  const requirements = SidanusDB.getBerkasRequirements(reg.jenisUjian);
  const isMenunggu = reg.statusVerifikasi === 'menunggu';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Verifikasi Berkas Pendaftaran</h3>
            <p className="text-xs text-slate-500 mt-0.5">{SidanusDB.getExamLabel(reg.jenisUjian)} · {reg.id}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">✕</button>
        </div>

        {/* Info Mahasiswa */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-medium">Nama Mahasiswa</p>
              <p className="font-bold text-slate-800">{student?.nama}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">NIM</p>
              <p className="font-bold text-slate-800">{student?.nim}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-slate-400 font-medium">Judul Skripsi</p>
              <p className="font-semibold text-slate-700 text-xs leading-relaxed">{student?.judul}</p>
            </div>
          </div>
        </div>

        {/* Daftar Berkas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Daftar Berkas ({requirements.filter(r => reg.berkas?.[r.key] && typeof reg.berkas[r.key] === 'object').length}/{requirements.length} diupload)</p>
          {requirements.map((req, idx) => {
            const file = reg.berkas?.[req.key];
            const isUploaded = file && typeof file === 'object' && file.base64;
            return (
              <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${isUploaded ? 'border-emerald-200 bg-emerald-50/50' : 'border-rose-200 bg-rose-50/30'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isUploaded ? 'bg-emerald-500' : 'bg-rose-400'}`}>
                    {isUploaded
                      ? <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                      : <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{req.label}</p>
                    {isUploaded && <p className="text-[10px] text-slate-400">{file.name} · {(file.size / 1024).toFixed(1)} KB</p>}
                    {!isUploaded && <p className="text-[10px] text-rose-500 font-medium">Belum diupload</p>}
                  </div>
                </div>
                {isUploaded && (
                  <a
                    href={file.base64}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 flex-shrink-0 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Buka PDF
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        {isMenunggu && (
          <div className="p-6 border-t border-slate-100 flex gap-3">
            <button
              onClick={() => onTolak(reg.id)}
              className="flex-1 border border-rose-200 text-rose-600 font-bold py-2.5 rounded-xl text-sm hover:bg-rose-50 transition-colors"
            >
              ✕ Tolak & Kembalikan
            </button>
            <button
              onClick={() => onSetujui(reg.id)}
              className="flex-1 bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-emerald-700 transition-colors"
            >
              ✓ Setujui Berkas
            </button>
          </div>
        )}
        {!isMenunggu && (
          <div className="p-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">Status: <span className="font-bold">{reg.statusVerifikasi}</span>. Tidak dapat diubah lagi.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Modal Penolakan ──────────────────────────────────
function RejectModal({ modal, setModal, onSubmit }) {
  if (!modal.open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <h3 className="font-bold text-slate-800 mb-1">Tolak & Kembalikan Berkas</h3>
        <p className="text-xs text-slate-500 mb-4">Berikan catatan agar mahasiswa tahu apa yang perlu diperbaiki.</p>
        <textarea
          rows={4}
          value={modal.catatan}
          onChange={e => setModal(prev => ({ ...prev, catatan: e.target.value }))}
          placeholder="Contoh: Kartu bimbingan belum ditandatangani pembimbing 2. Harap unggah ulang..."
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
        <div className="flex gap-3 mt-4">
          <button onClick={() => setModal({ open: false, regId: null, catatan: '' })} className="flex-1 border border-slate-200 text-slate-600 font-semibold rounded-xl py-2.5 text-sm hover:bg-slate-50">Batal</button>
          <button onClick={onSubmit} className="flex-1 bg-rose-600 text-white font-bold rounded-xl py-2.5 text-sm hover:bg-rose-700">Kirim Penolakan</button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, desc, color }) {
  const colorMap = { blue: 'text-blue-600', amber: 'text-amber-600', emerald: 'text-emerald-600', rose: 'text-rose-600' };
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <p className={`text-3xl font-extrabold ${colorMap[color]}`}>{value}</p>
      <p className="text-xs text-slate-500 font-medium mt-1">{label}</p>
      <p className={`text-[10px] ${colorMap[color]} mt-1`}>{desc}</p>
    </div>
  );
}
