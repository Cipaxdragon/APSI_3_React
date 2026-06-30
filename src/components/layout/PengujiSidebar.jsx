import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Edit3, Settings, LogOut, Menu, X, Archive } from 'lucide-react';

export default function PengujiSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Jadwal Menguji', path: '/penguji/dashboard', icon: Home },
    { label: 'Riwayat Ujian Selesai', path: '/penguji/riwayat', icon: Archive },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      {!isMobileOpen && (
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden fixed top-3.5 left-3.5 z-[60] p-2 bg-white/80 backdrop-blur-md border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition-colors focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Backdrop */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/50 z-40 transition-opacity backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-white border-r border-slate-100 flex flex-col fixed inset-y-0 left-0 z-50 h-screen transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="h-16 flex items-center px-6 border-b border-slate-100 flex-shrink-0 justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 mr-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 leading-tight">SIDANUS</h1>
            <p className="text-[10px] text-slate-500 font-medium">Portal Penguji</p>
          </div>
        </div>
        <button className="lg:hidden p-1 -mr-2 text-slate-400 hover:text-slate-600 focus:outline-none" onClick={() => setIsMobileOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 overflow-y-auto space-y-1 min-h-0">
        {navItems.map((item, idx) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={idx} to={item.path} onClick={() => setIsMobileOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-rose-50 text-rose-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <Icon className={`w-5 h-5 ${isActive ? 'text-rose-600' : 'text-slate-400'}`} />
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
    </>
  );
}
