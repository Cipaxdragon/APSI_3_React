import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, FileText, Calendar, Bell, FileBadge, User, LogOut } from 'lucide-react';
import { SidanusDB } from '../../db/sidanusDB';

export default function MahasiswaSidebar() {
  const { session, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const student = SidanusDB.getStudent(session?.identifier);
  if (!student) return null;

  const initials = student.nama.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // Hitung notifikasi belum dibaca (dikembalikan) - sekedar contoh
  const regs = SidanusDB.getRegistrationsByNim(student.nim);
  const notifCount = regs.filter(r => r.statusVerifikasi === 'dikembalikan').length;

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', path: '/mahasiswa/dashboard', icon: Home },
    { label: 'Daftar Ujian', path: '/mahasiswa/daftar-ujian', icon: FileText },
    { label: 'INFORMASI', isHeader: true },
    { label: 'Jadwal Publik', path: '/jadwal-publik', icon: Calendar },
    { label: 'Notifikasi', path: '/mahasiswa/notifikasi', icon: Bell, badge: notifCount },
    { label: 'SK Kelulusan', path: '/mahasiswa/sk-kelulusan', icon: FileBadge },
    { label: 'Profil & Keamanan', path: '/mahasiswa/profil', icon: User },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col fixed inset-y-0 left-0 z-50 h-screen">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 flex-shrink-0">
        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mr-3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-800 leading-tight">SIDANUS</h1>
          <p className="text-[10px] text-slate-500 font-medium">Portal Mahasiswa</p>
        </div>
      </div>

      {/* User Info */}
      <div className="px-5 py-5 bg-emerald-50/50 flex-shrink-0">
        <p className="text-[10px] font-bold text-emerald-600 mb-2 uppercase tracking-wider">Masuk Sebagai</p>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 text-sm truncate">{student.nama}</p>
            <p className="text-xs text-slate-500 truncate">{student.nim} • Angkatan {student.angkatan}</p>
          </div>
        </div>
      </div>

      {/* Nav — scrollable */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto space-y-1 min-h-0">
        {navItems.map((item, idx) => {
          if (item.isHeader) {
            return (
              <div key={idx} className="px-3 pt-4 pb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
              </div>
            );
          }
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              to={item.path}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                {item.label}
              </div>
              {item.badge > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-100">
        <button onClick={handleLogout} className="flex items-center w-full gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 rounded-xl hover:bg-rose-50 transition-colors">
          <LogOut className="w-5 h-5 text-rose-500" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
