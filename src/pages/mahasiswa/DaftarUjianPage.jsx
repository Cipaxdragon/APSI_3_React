import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MahasiswaSidebar from '../../components/layout/MahasiswaSidebar';
import PageHeader from '../../components/layout/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { SidanusDB } from '../../db/sidanusDB';
import { useRegistrations } from '../../hooks/useRegistrations';

export default function DaftarUjianPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const student = SidanusDB.getStudent(session?.identifier);
  const { addRegistration } = useRegistrations(student?.nim);
  
  const [jenisUjian, setJenisUjian] = useState('');
  const [judul, setJudul] = useState(student?.judul || '');
  const [agreed1, setAgreed1] = useState(false);
  const [agreed2, setAgreed2] = useState(false);

  if (!student) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!jenisUjian) return alert('Pilih jenis ujian terlebih dahulu');
    if (!agreed1 || !agreed2) return alert('Silakan centang semua konfirmasi');

    // Buat data pendaftaran dummy
    addRegistration({
      nim: student.nim,
      jenisUjian,
      berkas: {
        dummy_file: true
      }
    });

    // Update judul mahasiswa
    if (judul !== student.judul) {
      SidanusDB.updateStudent(student.nim, { judul });
    }

    alert('Pendaftaran berhasil dikirim!');
    navigate('/mahasiswa/dashboard');
  };

  const nextExamType = SidanusDB.getNextExamType(student.nim);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <MahasiswaSidebar />
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <PageHeader title="Pendaftaran Ujian" />
        
        <main className="flex-1 p-4 sm:p-6 max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Seksi 1: Data Mahasiswa */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs font-extrabold">1</span>
                Data Mahasiswa
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Lengkap</label>
                  <input type="text" value={student.nama} readOnly className="input-style" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">NIM</label>
                  <input type="text" value={student.nim} readOnly className="input-style" />
                </div>
              </div>
            </section>

            {/* Seksi 2: Jenis Ujian */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs font-extrabold">2</span>
                Jenis Ujian
              </h2>
              <div className="space-y-3">
                {['proposal', 'hasil', 'munaqasyah'].map(type => (
                  <label key={type} className={`flex items-center gap-3 p-3 rounded-xl border ${jenisUjian === type ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'} cursor-pointer`}>
                    <input type="radio" name="jenis" value={type} checked={jenisUjian === type} onChange={(e) => setJenisUjian(e.target.value)} className="accent-emerald-600" />
                    <div>
                      <span className="text-sm font-bold text-slate-800">{SidanusDB.getExamLabel(type)}</span>
                      {nextExamType === type && <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Direkomendasikan</span>}
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* Seksi 3: Judul */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs font-extrabold">3</span>
                Judul Penelitian
              </h2>
              <div>
                <textarea rows="3" value={judul} onChange={e => setJudul(e.target.value)} className="input-style resize-none" placeholder="Masukkan judul penelitian Anda..."></textarea>
                <p className="text-xs text-slate-400 mt-2">Pastikan judul sudah sesuai dengan yang disetujui pembimbing.</p>
              </div>
            </section>

            {/* Seksi 4: Berkas */}
            {jenisUjian && (
              <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs font-extrabold">4</span>
                  Upload Berkas Syarat
                </h2>
                <div className="space-y-3">
                  {SidanusDB.getBerkasRequirements(jenisUjian).map((req, idx) => (
                    <details key={idx} className="border border-slate-100 rounded-xl overflow-hidden">
                      <summary className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                        <span className="text-sm font-semibold text-slate-700">{req.label}</span>
                        <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full">Belum Upload</span>
                      </summary>
                      <div className="p-4 border-t border-slate-100">
                        <input type="file" className="text-sm" accept=".pdf" />
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* Konfirmasi */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs font-extrabold">5</span>
                Konfirmasi & Pengiriman
              </h2>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-sm text-slate-700 mb-5">
                <div className="flex gap-2">
                  <input type="checkbox" id="k1" checked={agreed1} onChange={e => setAgreed1(e.target.checked)} className="mt-0.5 accent-emerald-600" />
                  <label htmlFor="k1" className="text-xs leading-relaxed">Saya menyatakan bahwa semua data dan berkas yang saya lampirkan adalah benar dan dapat dipertanggungjawabkan.</label>
                </div>
                <div className="flex gap-2">
                  <input type="checkbox" id="k2" checked={agreed2} onChange={e => setAgreed2(e.target.checked)} className="mt-0.5 accent-emerald-600" />
                  <label htmlFor="k2" className="text-xs leading-relaxed">Saya memahami bahwa pendaftaran yang telah dikirim tidak dapat diubah dan akan diproses oleh Admin Program Studi.</label>
                </div>
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button type="button" onClick={() => navigate('/mahasiswa/dashboard')} className="flex-1 text-center border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl py-3 text-sm transition-colors">Batal</button>
                <button type="submit" className="flex-1 text-white bg-emerald-600 font-semibold rounded-xl py-3 text-sm shadow-lg hover:bg-emerald-700 transition-colors">Kirim Pendaftaran</button>
              </div>
            </section>
          </form>
        </main>
      </div>
    </div>
  );
}
