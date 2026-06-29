
// Since I haven't written the components yet, I will use placeholder elements.

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Placeholders for now
import LoginPage from './pages/LoginPage';
import MahasiswaDashboard from './pages/mahasiswa/DashboardPage';
import DaftarUjianPage from './pages/mahasiswa/DaftarUjianPage';
import NotifikasiPage from './pages/mahasiswa/NotifikasiPage';
import ProfilPage from './pages/mahasiswa/ProfilPage';
import SKKelulusanPage from './pages/mahasiswa/SKKelulusanPage';
import AdminDashboard from './pages/admin/DashboardPage';
import AdminPenjadwalan from './pages/admin/PenjadwalanPage';
import KaprodiDashboard from './pages/kaprodi/DashboardPage';
import PengujiDashboard from './pages/penguji/DashboardPage';
import JadwalPublik from './pages/JadwalPublikPage';

const AuthGuard = ({ role }) => {
  const { session } = useAuth();
  if (!session || session.role !== role) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />`n        <Route path="/jadwal-publik" element={<JadwalPublik />} />
        
        {/* Mahasiswa Routes */}
        <Route element={<AuthGuard role="mahasiswa" />}>
          <Route path="/mahasiswa/dashboard" element={<MahasiswaDashboard />} />`n          <Route path="/mahasiswa/daftar-ujian" element={<DaftarUjianPage />} />`n          <Route path="/mahasiswa/notifikasi" element={<NotifikasiPage />} />`n          <Route path="/mahasiswa/profil" element={<ProfilPage />} />`n          <Route path="/mahasiswa/sk-kelulusan" element={<SKKelulusanPage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AuthGuard role="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />`n          <Route path="/admin/penjadwalan" element={<AdminPenjadwalan />} />
        </Route>

        {/* Kaprodi Routes */}
        <Route element={<AuthGuard role="kaprodi" />}>
          <Route path="/kaprodi/dashboard" element={<KaprodiDashboard />} />
        </Route>

        {/* Penguji Routes */}
        <Route element={<AuthGuard role="penguji" />}>
          <Route path="/penguji/dashboard" element={<PengujiDashboard />} />
        </Route>

        {/* Other Routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;












