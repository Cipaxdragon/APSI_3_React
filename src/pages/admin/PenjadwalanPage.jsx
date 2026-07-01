import React, { useState } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import PageHeader from '../../components/layout/PageHeader';
import { SidanusDB } from '../../db/sidanusDB';
import { useRegistrations } from '../../hooks/useRegistrations';

const EMPTY_FORM = {
  tanggal: '', jamMulai: '', jamSelesai: '', ruangan: '',
  ketuaSidang: '', sekretaris: '', penguji1: '', penguji2: '', catatan: ''
};

export default function PenjadwalanPage() {
  const { registrations } = useRegistrations();
  
  const [schedules, setSchedules] = useState(SidanusDB.getSchedules());
  const dosenList = SidanusDB.getDosenList();
  const ruanganList = SidanusDB.getRuanganList();

  const antrian = registrations.filter(reg =>
    reg.statusVerifikasi === 'disetujui' &&
    !schedules.some(s => s.registrationId === reg.id && s.statusKaprodi !== 'ditolak')
  );

  const [selectedRegId, setSelectedRegId] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isAutoSuggest, setIsAutoSuggest] = useState(false);

  const selectedReg = antrian.find(r => r.id === selectedRegId);
  const selectedStudent = selectedReg ? SidanusDB.getStudent(selectedReg.nim) : null;
  const rejectedSchedule = selectedReg ? SidanusDB.getSchedules().slice().reverse().find(s => s.registrationId === selectedReg.id && s.statusKaprodi === 'ditolak') : null;

  const handleAutoSuggest = (regId) => {
    const reg = antrian.find(r => r.id === regId);
    if (!reg) return;
    const suggestion = SidanusDB.suggestSchedule(reg.nim);
    if (suggestion) {
      setFormData(suggestion);
      setIsAutoSuggest(true);
    }
    setSelectedRegId(regId);
    setTimeout(() => document.getElementById('form-penjadwalan')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSelectStudent = (regId) => {
    setSelectedRegId(regId);
    const reg = antrian.find(r => r.id === regId);
    const stu = SidanusDB.getStudent(reg.nim);
    setFormData(prev => ({ ...prev, ketuaSidang: stu.pembimbing1, sekretaris: stu.pembimbing2 }));
    setIsAutoSuggest(false);
    setTimeout(() => document.getElementById('form-penjadwalan')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedRegId) return;

    // Validasi tidak ada dosen penguji/pembimbing yang ganda
    const selectedDosen = [
      formData.ketuaSidang, 
      formData.sekretaris, 
      formData.penguji1, 
      formData.penguji2
    ].filter(Boolean); // filter out empty strings if any
    
    const uniqueDosen = new Set(selectedDosen);
    if (uniqueDosen.size < selectedDosen.length) {
      alert("⚠️ Validasi Gagal: Dosen penguji dan pembimbing tidak boleh ada yang merangkap jabatan atau dipilih lebih dari satu kali dalam satu ujian yang sama.");
      return;
    }

    const reg = SidanusDB.getRegistration(selectedRegId);
    if (!reg) return;
    
    if (!formData.tanggal || !formData.jamMulai || !formData.jamSelesai) return alert('Lengkapi tanggal dan waktu ujian');
    if (!formData.ruangan) return alert('Pilih ruangan ujian');
    if (!formData.penguji1 || !formData.penguji2) return alert('Lengkapi nama Penguji 1 dan Penguji 2');

    SidanusDB.addSchedule({
      registrationId: selectedReg.id,
      nim: selectedReg.nim,
      jenisUjian: selectedReg.jenisUjian,
      ...formData
    });

    alert('✅ Jadwal berhasil diajukan ke Kaprodi!');
    setSelectedRegId('');
    setFormData(EMPTY_FORM);
    setIsAutoSuggest(false);
    setSchedules(SidanusDB.getSchedules());
  };

  const field = (label, value, key, type = 'text', opts = {}) => (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
      <input
        type={type}
        required
        disabled={!selectedRegId}
        value={value}
        onChange={e => { setFormData({ ...formData, [key]: e.target.value }); setIsAutoSuggest(false); }}
        className="input-style w-full disabled:bg-slate-50"
        {...opts}
      />
    </div>
  );

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <AdminSidebar />
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <PageHeader title="Antrian Penjadwalan" />
        
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          {/* Antrian */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800">Mahasiswa Menunggu Jadwal</h2>
              <span className="text-xs bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-full">{antrian.length} antrian</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">MAHASISWA</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">JENIS UJIAN</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">PEMBIMBING</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {antrian.map(reg => {
                    const student = SidanusDB.getStudent(reg.nim);
                    const isSelected = selectedRegId === reg.id;
                    return (
                      <tr key={reg.id} className={`transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-800 text-sm">{student.nama}</p>
                          <p className="text-xs text-slate-500">{student.nim}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                            {SidanusDB.getExamLabel(reg.jenisUjian)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          <p className="truncate max-w-[180px]">{student.pembimbing1}</p>
                          <p className="truncate max-w-[180px] text-slate-400">{student.pembimbing2}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleAutoSuggest(reg.id)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${isSelected && isAutoSuggest ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                            >
                              ⚡ Auto Saran
                            </button>
                            <button
                              onClick={() => handleSelectStudent(reg.id)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${isSelected && !isAutoSuggest ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                            >
                              Manual
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {antrian.length === 0 && (
                    <tr><td colSpan="4" className="text-center py-8 text-slate-400 text-sm">Tidak ada antrian penjadwalan.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Form Penjadwalan */}
          <section id="form-penjadwalan" className={`bg-white rounded-2xl border shadow-sm p-5 sm:p-6 transition-all ${selectedRegId ? 'border-blue-400 ring-4 ring-blue-400/10' : 'border-slate-100 opacity-60'}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-bold text-slate-800">Form Input Jadwal</h2>
                {selectedStudent && (
                  <p className="text-xs text-slate-500 mt-0.5">Untuk: <span className="font-bold text-blue-600">{selectedStudent.nama}</span></p>
                )}
              </div>
              {isAutoSuggest && selectedRegId && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-2 rounded-xl">
                  <span>🤖</span>
                  <span>Saran Otomatis Aktif</span>
                </div>
              )}
            </div>
            
            {isAutoSuggest && selectedRegId && (
              <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                <p className="font-bold mb-1">⚡ Auto-Suggest Aktif</p>
                <p>Sistem telah mengisi jadwal berdasarkan: data pembimbing mahasiswa, ketersediaan dosen pada tanggal yang dipilih, dan ruangan pertama yang tersedia. Anda masih dapat mengubah field secara manual.</p>
              </div>
            )}

            {rejectedSchedule && selectedRegId && (
              <div className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 shadow-sm">
                <p className="font-bold mb-1.5 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Jadwal Sebelumnya Ditolak Kaprodi
                </p>
                <p className="italic leading-relaxed mb-2 text-rose-900 bg-rose-100/50 p-2 rounded border border-rose-100/50">"{rejectedSchedule.catatanKaprodi}"</p>
                <p className="opacity-80">Harap atur ulang jadwal (waktu, penguji, atau ruangan) dengan mempertimbangkan catatan penolakan di atas.</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {field('Tanggal Ujian', formData.tanggal, 'tanggal', 'date')}
                
                {/* Ruangan dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Ruangan Ujian</label>
                  <select
                    required
                    disabled={!selectedRegId}
                    value={formData.ruangan}
                    onChange={e => { setFormData({ ...formData, ruangan: e.target.value }); setIsAutoSuggest(false); }}
                    className="input-style w-full disabled:bg-slate-50"
                  >
                    <option value="">-- Pilih Ruangan --</option>
                    {ruanganList.map(r => (
                      <option key={r.id} value={r.nama}>{r.nama} (Kap. {r.kapasitas})</option>
                    ))}
                  </select>
                </div>
                {field('Jam Mulai', formData.jamMulai, 'jamMulai', 'time')}
                {field('Jam Selesai', formData.jamSelesai, 'jamSelesai', 'time')}
              </div>

              <div className="border-t border-slate-100 pt-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Tim Penguji</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Ketua & Sekretaris dropdown */}
                  {['ketuaSidang', 'sekretaris', 'penguji1', 'penguji2'].map((key) => {
                    const labels = { ketuaSidang: 'Ketua Sidang / Pembimbing 1', sekretaris: 'Sekretaris / Pembimbing 2', penguji1: 'Penguji 1', penguji2: 'Penguji 2' };
                    
                    // Filter list dosen agar tidak menampilkan dosen yang sudah dipilih di form lain
                    const availableDosen = dosenList.filter(d => {
                      const otherSelected = ['ketuaSidang', 'sekretaris', 'penguji1', 'penguji2']
                        .filter(k => k !== key)
                        .map(k => formData[k]);
                      return !otherSelected.includes(d.nama);
                    });

                    return (
                      <div key={key}>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">{labels[key]}</label>
                        <select
                          required
                          disabled={!selectedRegId}
                          value={formData[key]}
                          onChange={e => { setFormData({ ...formData, [key]: e.target.value }); setIsAutoSuggest(false); }}
                          className="input-style w-full disabled:bg-slate-50"
                        >
                          <option value="">-- Pilih Dosen --</option>
                          {availableDosen.map(d => (
                            <option key={d.id} value={d.nama}>{d.nama} ({d.jabatan})</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Catatan untuk Mahasiswa (opsional)</label>
                <textarea
                  rows={2}
                  disabled={!selectedRegId}
                  value={formData.catatan}
                  onChange={e => setFormData({ ...formData, catatan: e.target.value })}
                  className="input-style w-full resize-none disabled:bg-slate-50"
                  placeholder="Contoh: Hadir 30 menit sebelum ujian dimulai..."
                />
              </div>

              <div className="flex gap-3">
                {selectedRegId && (
                  <button type="button" onClick={() => { setSelectedRegId(''); setFormData(EMPTY_FORM); setIsAutoSuggest(false); }} className="flex-1 border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl text-sm hover:bg-slate-50 transition-colors">
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!selectedRegId}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  Ajukan ke Kaprodi
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
