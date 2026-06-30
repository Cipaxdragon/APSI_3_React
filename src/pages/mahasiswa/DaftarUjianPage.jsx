import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MahasiswaSidebar from '../../components/layout/MahasiswaSidebar';
import PageHeader from '../../components/layout/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { SidanusDB } from '../../db/sidanusDB';
import { useRegistrations } from '../../hooks/useRegistrations';

// Konversi file ke base64
const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export default function DaftarUjianPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const student = SidanusDB.getStudent(session?.identifier);
  const { addRegistration, registrations } = useRegistrations(student?.nim);
  
  const nextExamType = SidanusDB.getNextExamType(student?.nim);
  const [jenisUjian] = useState(nextExamType || '');
  const [judul, setJudul] = useState(student?.judul || '');
  const [agreed1, setAgreed1] = useState(false);
  const [agreed2, setAgreed2] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [uploading, setUploading] = useState({});
  const [openUploadIndex, setOpenUploadIndex] = useState(0);
  const [dragActive, setDragActive] = useState(null);

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

  // Guard: ada pendaftaran aktif
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

  if (!nextExamType) {
    return (
      <div className="flex bg-slate-50 min-h-screen">
        <MahasiswaSidebar />
        <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
          <PageHeader title="Pendaftaran Ujian" />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Semua Tahap Selesai</h2>
              <p className="text-slate-500 text-sm mb-6">Tidak ada ujian berikutnya yang tersedia.</p>
              <button onClick={() => navigate('/mahasiswa/dashboard')} className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-700">Kembali ke Dashboard</button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const requirements = SidanusDB.getBerkasRequirements(jenisUjian);
  const uploadedCount = Object.keys(uploadedFiles).length;
  const allUploaded = requirements.every(r => uploadedFiles[r.key]);

  const handleFileChange = async (key, file) => {
    if (!file) return;
    
    // Validasi tipe
    if (file.type !== 'application/pdf') {
      alert('Hanya file PDF yang diperbolehkan.');
      return;
    }
    // Validasi ukuran: maks 1MB
    if (file.size > 1 * 1024 * 1024) {
      alert(`Ukuran file "${file.name}" melebihi batas 1MB.\nUkuran sekarang: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      return;
    }

    setUploading(prev => ({ ...prev, [key]: true }));
    try {
      const base64 = await fileToBase64(file);
      setUploadedFiles(prev => ({
        ...prev,
        [key]: { name: file.name, base64, size: file.size, uploadedAt: new Date().toISOString() }
      }));
    } catch {
      alert('Gagal membaca file. Silakan coba lagi.');
    } finally {
      setUploading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleRemoveFile = (key) => {
    setUploadedFiles(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const handleAutoFill = () => {
    const dummyBase64 = 'data:application/pdf;base64,JVBERi0xLjEKJcKlwrHDqwoKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSCiAgPj4KZW5kb2JqCgoyIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2VzCiAgICAgL0tpZHMgWzMgMCBSXQogICAgIC9Db3VudCAxCiAgICAgL01lZGlhQm94IFswIDAgMzAwIDE0NF0KICA+PgplbmRvYmoKCjMgMCBvYmoKICA8PCAgL1R5cGUgL1BhZ2UKICAgICAgL1BhcmVudCAyIDAgUgogICAgICAvUmVzb3VyY2VzCiAgICAgICA8PCAvRm9udAogICAgICAgICAgIDw8IC9GMQogICAgICAgICAgICAgICA8PCAvVHlwZSAvRm9udAogICAgICAgICAgICAgICAgICAvU3VidHlwZSAvVHlwZTEKICAgICAgICAgICAgICAgICAgL0Jhc2VGb250IC9UaW1lcy1Sb21hbgogICAgICAgICAgICAgICA+PgogICAgICAgICAgID4+CiAgICAgICA+PgogICAgICAvQ29udGVudHMgNCAwIFIKICA+PgplbmRvYmoKCjQgMCBvYmoKICA8PCAvTGVuZ3RoIDU1ID4+CnN0cmVhbQogIEJUCiAgICAvRjEgMTggVGYKICAgIDAgMCBUZAogICAgKER1bW15IFBERiBGaWxlKSBUagogIEVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE4IDAwMDAwIG4gCjAwMDAwMDAwNzcgMDAwMDAgbiAKMDAwMDAwMDE3OCAwMDAwMCBuIAowMDAwMDAwNDU3IDAwMDAwIG4gCnRyYWlsZXIKICA8PCAgL1Jvb3QgMSAwIFIKICAgICAgL1NpemUgNQogID4+CnN0YXJ0eHJlZgo1NjUKJSVFT0YK';
    
    const filledFiles = {};
    requirements.forEach(req => {
      filledFiles[req.key] = {
        name: `dummy_${req.key}.pdf`,
        base64: dummyBase64,
        size: 15360, // 15 KB
        uploadedAt: new Date().toISOString()
      };
    });
    setUploadedFiles(filledFiles);
    setOpenUploadIndex(null); // Tutup semua accordion
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!jenisUjian) return alert('Tidak ada ujian yang bisa didaftarkan.');
    if (!allUploaded) return alert(`Harap upload semua berkas terlebih dahulu. (${uploadedCount}/${requirements.length} sudah diupload)`);
    if (!agreed1 || !agreed2) return alert('Silakan centang semua pernyataan konfirmasi.');

    // Buat objek berkas dari uploadedFiles (simpan base64 untuk ditampilkan admin)
    const berkasData = {};
    requirements.forEach(req => {
      if (uploadedFiles[req.key]) {
        berkasData[req.key] = uploadedFiles[req.key];
      }
    });

    addRegistration({ nim: student.nim, jenisUjian, berkas: berkasData });

    if (judul !== student.judul) {
      SidanusDB.updateStudent(student.nim, { judul });
    }

    alert('✅ Pendaftaran berhasil dikirim! Admin akan segera memverifikasi berkas Anda.');
    navigate('/mahasiswa/dashboard');
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <MahasiswaSidebar />
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <PageHeader title="Pendaftaran Ujian" />
        
        <main className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full">
          {/* Progress indicator */}
          <div className="mb-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Progress Upload Berkas</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{uploadedCount} dari {requirements.length} berkas diupload</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${requirements.length ? (uploadedCount / requirements.length) * 100 : 0}%` }}
                />
              </div>
              {allUploaded && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">✓ Lengkap</span>
              )}
            </div>
          </div>

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
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Pembimbing 1</label>
                  <input type="text" value={student.pembimbing1} readOnly className="input-style bg-slate-50 text-slate-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Pembimbing 2</label>
                  <input type="text" value={student.pembimbing2} readOnly className="input-style bg-slate-50 text-slate-500" />
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
                    <label key={type} className={`flex items-center gap-3 p-4 rounded-xl border ${isTarget ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20' : 'border-slate-200 opacity-50'} cursor-default`}>
                      <input type="radio" name="jenis" value={type} checked={isTarget} readOnly disabled={!isTarget} className="accent-emerald-600 w-5 h-5" />
                      <div>
                        <span className="text-sm font-bold text-slate-800">{SidanusDB.getExamLabel(type)}</span>
                        {isTarget && <span className="mt-1 block text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold w-fit">Aktif</span>}
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>

            {/* Seksi 3: Judul */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
              <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs font-extrabold">3</span>
                Judul Penelitian <span className="text-emerald-600 text-[10px] ml-2 px-2 py-0.5 bg-emerald-100 rounded-full">Terkunci (Sah)</span>
              </h2>
              <textarea rows="3" value={judul} readOnly disabled className="input-style resize-none w-full bg-slate-100 text-slate-600 cursor-not-allowed border-slate-200 shadow-none" placeholder="Masukkan judul penelitian Anda..." />
              <p className="text-xs text-slate-400 mt-2 font-medium">Pastikan judul sudah sesuai dengan yang disetujui pembimbing.</p>
            </section>

            {/* Seksi 4: Upload Berkas */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs font-extrabold">4</span>
                  Upload Berkas Syarat — {SidanusDB.getExamLabel(jenisUjian)}
                </h2>
                <button 
                  type="button" 
                  onClick={handleAutoFill}
                  className="text-[10px] font-bold text-brand-700 bg-brand-100 hover:bg-brand-200 px-3 py-1.5 rounded-lg transition-colors border border-brand-200"
                >
                  ⚡ Auto-Fill (Demo)
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-5 ml-9">Format: PDF · Maks. 1 MB per berkas · Semua berkas wajib diisi</p>

              <div className="space-y-3">
                {requirements.map((req, idx) => {
                  const uploaded = uploadedFiles[req.key];
                  const isLoading = uploading[req.key];
                  const isOpen = openUploadIndex === idx;
                  const isDragActive = dragActive === req.key;

                  return (
                    <div key={idx} className={`rounded-xl border transition-all overflow-hidden ${uploaded ? 'border-emerald-200' : isOpen ? 'border-brand-300 ring-4 ring-brand-500/10' : 'border-slate-200'} bg-white`}>
                      {/* Header Accordion */}
                      <div 
                        onClick={() => setOpenUploadIndex(isOpen ? null : idx)}
                        className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${uploaded ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${uploaded ? 'bg-emerald-500' : 'bg-amber-400'}`}>
                            {uploaded ? (
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                            ) : (
                              <span className="text-white text-xs font-bold">{idx + 1}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm font-semibold truncate ${uploaded ? 'text-emerald-800' : 'text-slate-700'}`}>{req.label}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                          {uploaded ? (
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full hidden sm:inline-block">Sudah Upload</span>
                          ) : (
                            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full hidden sm:inline-block">Belum Upload</span>
                          )}
                          <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* Konten Dropzone */}
                      {isOpen && (
                        <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50">
                          {uploaded ? (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                              <div>
                                <p className="text-sm font-bold text-slate-800 break-all">{uploaded.name}</p>
                                <p className="text-xs text-slate-500 font-medium mt-1">Ukuran: {(uploaded.size / 1024).toFixed(1)} KB</p>
                              </div>
                              <div className="flex gap-2 w-full sm:w-auto">
                                <a href={uploaded.base64} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none text-center text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors">👁️ Lihat File</a>
                                <button type="button" onClick={() => handleRemoveFile(req.key)} className="flex-1 sm:flex-none text-center text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-lg transition-colors">✕ Hapus</button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className={`relative p-8 rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center text-center ${
                                isDragActive ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:border-brand-400 hover:bg-brand-50/30'
                              } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                              onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(req.key); }}
                              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(null); }}
                              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDragActive(null);
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                  handleFileChange(req.key, e.dataTransfer.files[0]);
                                }
                              }}
                            >
                              <svg className={`w-10 h-10 mb-3 transition-colors ${isDragActive ? 'text-brand-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <p className="text-sm font-semibold text-slate-700 mb-1">{isLoading ? 'Mengunggah...' : 'Tarik & lepas file PDF di sini'}</p>
                              <p className="text-xs text-slate-500 mb-4">atau klik tombol di bawah</p>
                              <label className="btn-primary px-5 py-2 rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-2">
                                {isLoading ? '⏳ Memproses...' : 'Pilih File PDF'}
                                <input
                                  type="file"
                                  accept=".pdf,application/pdf"
                                  className="hidden"
                                  disabled={isLoading}
                                  onChange={e => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleFileChange(req.key, e.target.files[0]);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!allUploaded && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" /></svg>
                  <p className="text-xs text-amber-700 font-medium">Harap upload semua berkas sebelum mengirim pendaftaran.</p>
                </div>
              )}
            </section>

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
                <button
                  type="submit"
                  disabled={!allUploaded || !agreed1 || !agreed2}
                  className="flex-1 text-white bg-emerald-600 font-bold rounded-xl py-3.5 text-sm shadow-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  Kirim Pendaftaran
                </button>
              </div>
            </section>
          </form>
        </main>
      </div>
    </div>
  );
}
