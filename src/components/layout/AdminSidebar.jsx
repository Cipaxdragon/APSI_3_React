import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, ClipboardList, Calendar, Users, Settings, LogOut } from 'lucide-react';

export default function AdminSidebar() {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    if(window.confirm('Yakin ingin keluar?')) {
      logout();
      navigate('/');
    }
  };

  const navItems = [
    { label: 'Dashboard Verifikasi', path: '/admin/dashboard', icon: Home },
    { label: 'Antrian Penjadwalan', path: '/admin/penjadwalan', icon: Calendar },
    { label: 'Data Mahasiswa', path: '#', icon: Users },
    { label: 'Laporan', path: '#', icon: ClipboardList },
    { label: 'Pengaturan', path: '#', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col fixed inset-y-0 left-0 z-50">
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mr-3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-800 leading-tight">SIDANUS</h1>
          <p className="text-[10px] text-slate-500 font-medium">Portal Admin Prodi</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
        {navItems.map((item, idx) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={idx} to={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button onClick={handleLogout} className="flex items-center w-full gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 rounded-xl hover:bg-rose-50 transition-colors">
          <LogOut className="w-5 h-5 text-rose-500" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
