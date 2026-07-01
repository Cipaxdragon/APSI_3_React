import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import PageHeader from '../../components/layout/PageHeader';
import { SidanusDB } from '../../db/sidanusDB';

export default function DatabasePage() {
  const [activeTab, setActiveTab] = useState('dosen'); // 'dosen', 'ruangan', 'mahasiswa'
  const [dosenList, setDosenList] = useState([]);
  const [ruanganList, setRuanganList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  
  const [modal, setModal] = useState({ open: false, type: '', mode: 'add', data: null });
  const [selectedP1, setSelectedP1] = useState('');
  const [selectedP2, setSelectedP2] = useState('');

  const loadData = () => {
    setDosenList(SidanusDB.getDosenList());
    setRuanganList(SidanusDB.getRuanganList());
    setStudentsList(SidanusDB.getStudents());
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (type, mode, data = null) => {
    setModal({ open: true, type, mode, data });
    setSelectedP1(data?.pembimbing1 || '');
    setSelectedP2(data?.pembimbing2 || '');
  };
  const closeModal = () => {
    setModal({ open: false, type: '', mode: 'add', data: null });
  };

  const handleDelete = (type, id, nama) => {
    if (!window.confirm(`Hapus data ${nama}?`)) return;
    
    if (type === 'dosen') SidanusDB.deleteDosen(id);
    if (type === 'ruangan') SidanusDB.deleteRuangan(id);
    if (type === 'mahasiswa') SidanusDB.deleteStudent(id);
    
    loadData();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    if (modal.type === 'dosen') {
      if (modal.mode === 'add') SidanusDB.addDosen(data);
      else SidanusDB.updateDosen(modal.data.id, data);
    } else if (modal.type === 'ruangan') {
      if (modal.mode === 'add') SidanusDB.addRuangan(data);
      else SidanusDB.updateRuangan(modal.data.id, data);
    } else if (modal.type === 'mahasiswa') {
      if (data.pembimbing1 && data.pembimbing2 && data.pembimbing1 === data.pembimbing2) {
        alert('⚠️ Validasi Gagal: Pembimbing 1 dan Pembimbing 2 tidak boleh orang yang sama.');
        return;
      }

      if (modal.mode === 'add') {
        const success = SidanusDB.addStudent(data);
        if (!success) {
          alert('Gagal! NIM sudah terdaftar.');
          return;
        }
      } else {
        SidanusDB.updateStudent(modal.data.nim, data);
      }
    }

    closeModal();
    loadData();
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <AdminSidebar />
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <PageHeader title="Master Database" />
        
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar">
            {['dosen', 'ruangan', 'mahasiswa'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-bold capitalize whitespace-nowrap transition-colors border-b-2 ${activeTab === tab ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Data {tab}
              </button>
            ))}
          </div>

          {/* Dosen Tab */}
          {activeTab === 'dosen' && (
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h2 className="font-bold text-slate-800">Manajemen Dosen</h2>
                <button onClick={() => openModal('dosen', 'add')} className="btn-primary px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Tambah Dosen
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase">NAMA & GELAR</th>
                      <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase">JABATAN</th>
                      <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dosenList.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-bold text-slate-700 text-sm">{d.nama}</td>
                        <td className="px-5 py-3 text-sm text-slate-600">{d.jabatan}</td>
                        <td className="px-5 py-3 text-center flex justify-center gap-2">
                          <button onClick={() => openModal('dosen', 'edit', d)} className="text-xs font-bold text-blue-600 hover:underline">Edit</button>
                          <button onClick={() => handleDelete('dosen', d.id, d.nama)} className="text-xs font-bold text-rose-600 hover:underline">Hapus</button>
                        </td>
                      </tr>
                    ))}
                    {dosenList.length === 0 && (
                      <tr><td colSpan="3" className="text-center py-6 text-slate-400">Tidak ada data dosen.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Ruangan Tab */}
          {activeTab === 'ruangan' && (
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h2 className="font-bold text-slate-800">Manajemen Ruangan</h2>
                <button onClick={() => openModal('ruangan', 'add')} className="btn-primary px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Tambah Ruangan
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase">NAMA RUANGAN</th>
                      <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase">KAPASITAS</th>
                      <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ruanganList.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-bold text-slate-700 text-sm">{r.nama}</td>
                        <td className="px-5 py-3 text-sm text-slate-600">{r.kapasitas} orang</td>
                        <td className="px-5 py-3 text-center flex justify-center gap-2">
                          <button onClick={() => openModal('ruangan', 'edit', r)} className="text-xs font-bold text-blue-600 hover:underline">Edit</button>
                          <button onClick={() => handleDelete('ruangan', r.id, r.nama)} className="text-xs font-bold text-rose-600 hover:underline">Hapus</button>
                        </td>
                      </tr>
                    ))}
                    {ruanganList.length === 0 && (
                      <tr><td colSpan="3" className="text-center py-6 text-slate-400">Tidak ada data ruangan.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Mahasiswa Tab */}
          {activeTab === 'mahasiswa' && (
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h2 className="font-bold text-slate-800">Manajemen Mahasiswa</h2>
                <button onClick={() => openModal('mahasiswa', 'add')} className="btn-primary px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Tambah Mahasiswa
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase">MAHASISWA</th>
                      <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase">INFO AKADEMIK</th>
                      <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentsList.map(s => (
                      <tr key={s.nim} className="hover:bg-slate-50">
                        <td className="px-5 py-3">
                          <p className="font-bold text-slate-700 text-sm">{s.nama}</p>
                          <p className="text-xs text-slate-500">{s.nim}</p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-xs text-slate-700 font-medium">{s.prodi} · Sem {s.semester}</p>
                          <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] truncate" title={s.judul}>"{s.judul}"</p>
                        </td>
                        <td className="px-5 py-3 text-center flex justify-center items-center h-full gap-2 mt-2">
                          <button onClick={() => openModal('mahasiswa', 'edit', s)} className="text-xs font-bold text-blue-600 hover:underline">Edit</button>
                          <button onClick={() => handleDelete('mahasiswa', s.nim, s.nama)} className="text-xs font-bold text-rose-600 hover:underline">Hapus</button>
                        </td>
                      </tr>
                    ))}
                    {studentsList.length === 0 && (
                      <tr><td colSpan="3" className="text-center py-6 text-slate-400">Tidak ada data mahasiswa.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Reusable Modal Form */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg">
                {modal.mode === 'add' ? 'Tambah' : 'Edit'} Data <span className="capitalize">{modal.type}</span>
              </h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modal.type === 'dosen' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Lengkap & Gelar</label>
                    <input name="nama" type="text" required defaultValue={modal.data?.nama || ''} className="input-style" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Jabatan Akademik</label>
                    <input name="jabatan" type="text" required defaultValue={modal.data?.jabatan || ''} className="input-style" />
                  </div>
                </>
              )}

              {modal.type === 'ruangan' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Ruangan</label>
                    <input name="nama" type="text" required defaultValue={modal.data?.nama || ''} className="input-style" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Kapasitas (Orang)</label>
                    <input name="kapasitas" type="number" required defaultValue={modal.data?.kapasitas || ''} className="input-style" />
                  </div>
                </>
              )}

              {modal.type === 'mahasiswa' && (
                <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">NIM</label>
                    <input name="nim" type="text" required readOnly={modal.mode === 'edit'} defaultValue={modal.data?.nim || ''} className="input-style" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Mahasiswa</label>
                    <input name="nama" type="text" required defaultValue={modal.data?.nama || ''} className="input-style" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Program Studi</label>
                    <input name="prodi" type="text" required defaultValue={modal.data?.prodi || 'Sistem Informasi'} className="input-style" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Semester</label>
                    <input name="semester" type="number" required defaultValue={modal.data?.semester || 8} className="input-style" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Judul Penelitian</label>
                    <textarea name="judul" rows="2" required defaultValue={modal.data?.judul || ''} className="input-style resize-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Pembimbing 1</label>
                    <select name="pembimbing1" required value={selectedP1} onChange={e => setSelectedP1(e.target.value)} className="input-style">
                      <option value="">-- Pilih --</option>
                      {dosenList.filter(d => d.nama !== selectedP2).map(d => <option key={d.id} value={d.nama}>{d.nama}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Pembimbing 2</label>
                    <select name="pembimbing2" required value={selectedP2} onChange={e => setSelectedP2(e.target.value)} className="input-style">
                      <option value="">-- Pilih --</option>
                      {dosenList.filter(d => d.nama !== selectedP1).map(d => <option key={d.id} value={d.nama}>{d.nama}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="flex-1 border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl text-sm hover:bg-slate-50">Batal</button>
                <button type="submit" className="flex-1 btn-primary font-bold py-3 rounded-xl text-sm">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
