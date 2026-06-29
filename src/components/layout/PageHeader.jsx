import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { SidanusDB } from '../../db/sidanusDB';

export default function PageHeader({ title }) {
  const { session } = useAuth();
  
  let name = '';
  let initials = '??';
  
  if (session?.role === 'mahasiswa') {
    const student = SidanusDB.getStudent(session.identifier);
    if (student) {
      name = student.nama;
      initials = name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
    }
  } else {
    name = session?.role === 'admin' ? 'Admin Prodi' 
         : session?.role === 'kaprodi' ? 'Kepala Program Studi' 
         : session?.role === 'penguji' ? 'Dosen Penguji' : 'User';
    initials = name.slice(0,2).toUpperCase();
  }

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
      <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      <div className="flex items-center gap-4">
        {session?.role === 'mahasiswa' && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-700">Aktif</span>
          </div>
        )}
        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm cursor-pointer hover:bg-emerald-700 transition-colors">
          {initials}
        </div>
      </div>
    </header>
  );
}
