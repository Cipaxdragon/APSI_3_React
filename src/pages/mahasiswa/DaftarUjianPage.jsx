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
  const { addRegistration, registrations } = useRegistrations(student?.nim);
  
  const nextExamType = SidanusDB.getNextExamType(student?.nim);
  const [jenisUjian, setJenisUjian] = useState(nextExamType || '');
  const [judul, setJudul] = useState(student?.judul || '');
  const [agreed1, setAgreed1] = useState(false);
  const [agreed2, setAgreed2] = useState(false);

  // Auto set jenis ujian
  React.useEffect(() => {
    if (nextExamType && !jenisUjian) {
      setJenisUjian(nextExamType);
    }
  }, [nextExamType, jenisUjian]);

  if (!student) return null;

  // Guard: sudah lulus semua ujian
  if (student.statusUjian === 'lulus') {
    return (
      <div className="flex bg-slate-50 min-h-screen">
        <MahasiswaSidebar />
        <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
          <PageHeader title="Pendaftaran Ujian" />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-4">🎓</div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Selamat! Anda Telah Lulus</h2>
              <p className="text-slate-500 text-sm mb-6">Seluruh tahap ujian akademik Anda telah selesai.</p>
              <button onClick={() => navigate('/mahasiswa/dashboard')} className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-700">Kembali ke Dashboard</button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Guard: ada pendaftaran aktif yang sedang diproses
  const activeReg = registrations.find(r => r.statusVerifikasi !== 'lulus' && r.statusVerifikasi !== 'dikembalikan');
  if (activeReg) {
    return (
      <div className="flex bg-slate-50 min-h-screen">
        <MahasiswaSidebar />
        <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
          <PageHeader title="Pendaftaran Ujian" />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="text-5xl mb-4">⏳</div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Pendaftaran Sedang Diproses</h2>
              <p className="text-slate-500 text-sm mb-2">Anda masih memiliki pendaftaran <strong>{SidanusDB.getExamLabel(activeReg.jenisUjian)}</strong> yang sedang berjalan.</p>
              <p className="text-slate-400 text-xs mb-6">Pendaftaran baru tidak bisa dibuat hingga proses saat ini selesai.</p>
              <button onClick={() => navigate('/mahasiswa/dashboard')} className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-700">Cek Status di Dashboard</button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!jenisUjian) return alert('Tidak ada ujian yang bisa didaftarkan.');
    if (!agreed1 || !agreed2) return alert('Silakan centang semua konfirmasi');

    addRegistration({
      nim: student.nim,
      jenisUjian,
      berkas: { dummy_file: true }
    });

    if (judul !== student.judul) {
      SidanusDB.updateStudent(student.nim, { judul });
    }

    alert('Pendaftaran berhasil dikirim!');
    navigate('/mahasiswa/dashboard');
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <MahasiswaSidebar />
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <PageHeader title="Pendaftaran Ujian" />
        
        <main className="flex-1 p-4 sm:p-6 max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Seksi 1: Data Mahasiswa */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
              <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs font-extrabold">1</span>
                Data Mahasiswa
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Lengkap</label>
                  <input type="text" value={student.nama} readOnly className="input-style bg-slate-50 text-slate-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">NIM</label>
                  <input type="text" value={student.nim} readOnly className="input-style bg-slate-50 text-slate-500" />
                </div>
              </div>
            </section>

            {/* Seksi 2: Jenis Ujian */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
              <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs font-extrabold">2</span>
                Jenis Ujian (Otomatis)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['proposal', 'hasil', 'munaqasyah'].map(type => {
                  const isTarget = nextExamType === type;
                  return (
                    <label key={type} className={`flex items-center gap-3 p-4 rounded-xl border ${isTarget ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20' : 'border-slate-200 opacity-60'} cursor-default`}>
                      <input 
                        type="radio" 
                        name="jenis" 
                        value={type} 
                        checked={isTarget} 
                        readOnly
                        disabled={!isTarget}
                        className="accent-emerald-600 w-5 h-5" 
                      />
                      <div>
                        <span className="text-sm font-bold text-slate-800">{SidanusDB.getExamLabel(type)}</span>
                        {isTarget && <span className="mt-1 block text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold w-fit">Aktif</span>}
                      </div>
                    </label>
                  );
                })}
              </div>
              {!nextExamType && (
                <p className="text-sm text-rose-500 mt-4 font-semibold">Anda tidak memiliki jadwal ujian berikutnya atau seluruh ujian telah selesai.</p>
              )}
            </section>

            {/* Seksi 3: Judul */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
              <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs font-extrabold">3</span>
                Judul Penelitian
              </h2>
              <div>
                <textarea rows="3" value={judul} onChange={e => setJudul(e.target.value)} className="input-style resize-none" placeholder="Masukkan judul penelitian Anda..."></textarea>
                <p className="text-xs text-slate-400 mt-2 font-medium">Pastikan judul sudah sesuai dengan yang disetujui pembimbing.</p>
              </div>
            </section>

            {/* Seksi 4: Berkas */}
            {jenisUjian && (
              <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
                <h2 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                  <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs font-extrabold">4</span>
                  Upload Berkas Syarat — {SidanusDB.getExamLabel(jenisUjian)}
                </h2>
                <p className="text-xs text-slate-500 mb-5 ml-9">Format: PDF · Maks. 5 MB per berkas</p>

                <div className="space-y-3">
                  {SidanusDB.getBerkasRequirements(jenisUjian).map((req, idx) => (
                    <details key={idx} className="border border-slate-100 rounded-xl overflow-hidden group">
                      <summary className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer list-none">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3" />
                            </svg>
                          </span>
                          <span className="text-sm font-semibold text-slate-700">{req.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Belum Upload</span>
                          <svg className="w-4 h-4 text-slate-400 transform group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </summary>
                      <div className="p-4 border-t border-slate-100">
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center bg-white hover:bg-slate-50 transition-colors">
                          <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-xs text-slate-500 mb-3">Belum ada file dipilih</p>
                          <label className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-4 py-2.5 rounded-lg cursor-pointer transition-colors shadow-sm">
                            Pilih File PDF
                            <input type="file" accept=".pdf" className="hidden" />
                          </label>
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* Konfirmasi */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs font-extrabold">5</span>
                Konfirmasi & Pengiriman
              </h2>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-sm text-slate-700 mb-5">
                <label className="flex gap-3 cursor-pointer items-start">
                  <input type="checkbox" checked={agreed1} onChange={e => setAgreed1(e.target.checked)} className="mt-1 accent-emerald-600 w-4 h-4" />
                  <span className="text-xs leading-relaxed font-medium">Saya menyatakan bahwa semua data dan berkas yang saya lampirkan adalah benar dan dapat dipertanggungjawabkan.</span>
                </label>
                <label className="flex gap-3 cursor-pointer items-start">
                  <input type="checkbox" checked={agreed2} onChange={e => setAgreed2(e.target.checked)} className="mt-1 accent-emerald-600 w-4 h-4" />
                  <span className="text-xs leading-relaxed font-medium">Saya memahami bahwa pendaftaran yang telah dikirim tidak dapat diubah dan akan diproses oleh Admin Program Studi.</span>
                </label>
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button type="button" onClick={() => navigate('/mahasiswa/dashboard')} className="flex-1 text-center border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl py-3.5 text-sm transition-colors">Batal</button>
                <button type="submit" disabled={!jenisUjian} className="flex-1 text-white bg-emerald-600 font-bold rounded-xl py-3.5 text-sm shadow-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Kirim Pendaftaran</button>
              </div>
            </section>
          </form>
        </main>
      </div>
    </div>
  );
}
