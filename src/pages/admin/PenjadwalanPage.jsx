import React, { useState } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import PageHeader from '../../components/layout/PageHeader';
import { SidanusDB } from '../../db/sidanusDB';
import { useRegistrations } from '../../hooks/useRegistrations';

export default function PenjadwalanPage() {
  const { registrations } = useRegistrations();
  
  const [schedules, setSchedules] = useState(SidanusDB.getSchedules());
  
  const antrian = registrations.filter(reg => 
    reg.statusVerifikasi === 'disetujui' && 
    !schedules.some(s => s.registrationId === reg.id)
  );

  const [selectedRegId, setSelectedRegId] = useState('');
  const [formData, setFormData] = useState({
    tanggal: '',
    jamMulai: '',
    jamSelesai: '',
    ruangan: '',
    ketuaSidang: '',
    sekretaris: '',
    penguji1: '',
    penguji2: '',
    catatan: ''
  });

  const selectedReg = antrian.find(r => r.id === selectedRegId);
  const selectedStudent = selectedReg ? SidanusDB.getStudent(selectedReg.nim) : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedReg) return alert('Pilih mahasiswa terlebih dahulu');
    if (!formData.tanggal || !formData.jamMulai || !formData.jamSelesai) return alert('Lengkapi tanggal dan waktu ujian');

    SidanusDB.addSchedule({
      registrationId: selectedReg.id,
      nim: selectedReg.nim,
      jenisUjian: selectedReg.jenisUjian,
      ...formData
    });

    alert('Jadwal berhasil diajukan ke Kaprodi!');
    setSelectedRegId('');
    setFormData({ tanggal: '', jamMulai: '', jamSelesai: '', ruangan: '', ketuaSidang: '', sekretaris: '', penguji1: '', penguji2: '', catatan: '' });
    // Refresh schedules from localStorage without page reload
    setSchedules(SidanusDB.getSchedules());
  };

  const handleSelectStudent = (regId) => {
    setSelectedRegId(regId);
    // Autofill with some logical defaults based on the student
    const reg = antrian.find(r => r.id === regId);
    const stu = SidanusDB.getStudent(reg.nim);
    setFormData(prev => ({
      ...prev,
      ketuaSidang: stu.pembimbing1,
      sekretaris: stu.pembimbing2,
    }));
    
    // Scroll to form (setTimeout to wait for render)
    setTimeout(() => {
      document.getElementById('form-penjadwalan')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <AdminSidebar />
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <PageHeader title="Antrian Penjadwalan" />
        
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="font-bold text-slate-800 mb-4">Mahasiswa Menunggu Jadwal</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">MAHASISWA</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">JENIS UJIAN</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {antrian.map(reg => {
                    const student = SidanusDB.getStudent(reg.nim);
                    return (
                      <tr key={reg.id} className={`hover:bg-slate-50 transition-colors ${selectedRegId === reg.id ? 'bg-blue-50/50' : ''}`}>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-800 text-sm">{student.nama}</p>
                          <p className="text-xs text-slate-500">{student.nim}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                            {SidanusDB.getExamLabel(reg.jenisUjian)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button 
                            onClick={() => handleSelectStudent(reg.id)}
                            className="text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
                            Pilih
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {antrian.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center py-6 text-slate-400 text-sm">Tidak ada antrian penjadwalan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section id="form-penjadwalan" className={`bg-white rounded-2xl border transition-colors shadow-sm p-5 sm:p-6 ${selectedRegId ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-100 opacity-60'}`}>
            <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              Form Input Jadwal
              {selectedStudent && (
                <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  Untuk: {selectedStudent.nama}
                </span>
              )}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Tanggal Ujian</label>
                  <input type="date" required disabled={!selectedRegId} value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} className="input-style" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Ruangan</label>
                  <input type="text" required disabled={!selectedRegId} value={formData.ruangan} onChange={e => setFormData({...formData, ruangan: e.target.value})} placeholder="Contoh: Ruang Seminar LT.3" className="input-style" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Jam Mulai</label>
                  <input type="time" required disabled={!selectedRegId} value={formData.jamMulai} onChange={e => setFormData({...formData, jamMulai: e.target.value})} className="input-style" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Jam Selesai</label>
                  <input type="time" required disabled={!selectedRegId} value={formData.jamSelesai} onChange={e => setFormData({...formData, jamSelesai: e.target.value})} className="input-style" />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Ketua Sidang / Pembimbing 1</label>
                  <input type="text" required disabled={!selectedRegId} value={formData.ketuaSidang} onChange={e => setFormData({...formData, ketuaSidang: e.target.value})} className="input-style" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Sekretaris / Pembimbing 2</label>
                  <input type="text" required disabled={!selectedRegId} value={formData.sekretaris} onChange={e => setFormData({...formData, sekretaris: e.target.value})} className="input-style" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Penguji 1</label>
                  <input type="text" required disabled={!selectedRegId} value={formData.penguji1} onChange={e => setFormData({...formData, penguji1: e.target.value})} className="input-style" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Penguji 2</label>
                  <input type="text" required disabled={!selectedRegId} value={formData.penguji2} onChange={e => setFormData({...formData, penguji2: e.target.value})} className="input-style" />
                </div>
              </div>

              <button type="submit" disabled={!selectedRegId} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition-colors">
                Ajukan ke Kaprodi
              </button>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
