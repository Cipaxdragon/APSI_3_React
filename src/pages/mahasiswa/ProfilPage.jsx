import React, { useState } from 'react';
import MahasiswaSidebar from '../../components/layout/MahasiswaSidebar';
import PageHeader from '../../components/layout/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { SidanusDB } from '../../db/sidanusDB';

export default function ProfilPage() {
  const { session } = useAuth();
  const student = SidanusDB.getStudent(session?.identifier);
  
  const [formData, setFormData] = useState({
    email: student?.email || '',
    hp: student?.hp || '',
    passwordOld: '',
    passwordNew: '',
  });

  if (!student) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    SidanusDB.updateStudent(student.nim, {
      email: formData.email,
      hp: formData.hp
    });
    alert('Profil berhasil diperbarui!');
    setFormData(prev => ({ ...prev, passwordOld: '', passwordNew: '' }));
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <MahasiswaSidebar />
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <PageHeader title="Profil & Keamanan" />
        
        <main className="flex-1 p-4 sm:p-6 max-w-3xl">
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-8">
            <div className="flex items-start gap-6 mb-8 pb-8 border-b border-slate-100 flex-col sm:flex-row">
              <div className="w-24 h-24 rounded-full bg-emerald-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shrink-0">
                {student.nama.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800">{student.nama}</h2>
                <p className="text-slate-500 font-medium">{student.nim} • {student.prodi}</p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">Angkatan {student.angkatan}</span>
                  <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Semester {student.semester}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-800 mb-4">Informasi Kontak</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Alamat Email</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-style" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Nomor HP / WhatsApp</label>
                    <input type="tel" value={formData.hp} onChange={e => setFormData({...formData, hp: e.target.value})} className="input-style" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">Ubah Kata Sandi</h3>
                <div className="grid grid-cols-1 gap-4 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Kata Sandi Lama</label>
                    <input type="password" value={formData.passwordOld} onChange={e => setFormData({...formData, passwordOld: e.target.value})} placeholder="••••••••" className="input-style" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Kata Sandi Baru</label>
                    <input type="password" value={formData.passwordNew} onChange={e => setFormData({...formData, passwordNew: e.target.value})} placeholder="••••••••" className="input-style" />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
