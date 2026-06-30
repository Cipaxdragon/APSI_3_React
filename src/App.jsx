import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import MahasiswaDashboard from './pages/mahasiswa/DashboardPage';
import DaftarUjianPage from './pages/mahasiswa/DaftarUjianPage';
import NotifikasiPage from './pages/mahasiswa/NotifikasiPage';
import ProfilPage from './pages/mahasiswa/ProfilPage';
import SKKelulusanPage from './pages/mahasiswa/SKKelulusanPage';
import AdminDashboard from './pages/admin/DashboardPage';
import AdminPenjadwalan from './pages/admin/PenjadwalanPage';
import AdminDatabase from './pages/admin/DatabasePage';
import AdminKalender from './pages/admin/KalenderPage';
import KaprodiDashboard from './pages/kaprodi/DashboardPage';
import KaprodiRiwayat from './pages/kaprodi/RiwayatPage';
import KaprodiKalender from './pages/kaprodi/KalenderPage';
import PengujiDashboard from './pages/penguji/DashboardPage';
import PengujiRiwayat from './pages/penguji/RiwayatPage';
import JadwalPublik from './pages/JadwalPublikPage';

// Guard: cek apakah user sudah login dengan role yang benar
const AuthGuard = ({ role }) => {
  const { session } = useAuth();
  if (!session || session.role !== role) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

// Guard: jika sudah login, redirect langsung ke dashboard-nya
const GuestGuard = () => {
  const { session } = useAuth();
  if (session?.role) {
    return <Navigate to={`/${session.role}/dashboard`} replace />;
  }
  return <LoginPage />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GuestGuard />} />
        <Route path="/jadwal-publik" element={<JadwalPublik />} />

        {/* Mahasiswa Routes */}
        <Route element={<AuthGuard role="mahasiswa" />}>
          <Route path="/mahasiswa/dashboard" element={<MahasiswaDashboard />} />
          <Route path="/mahasiswa/daftar-ujian" element={<DaftarUjianPage />} />
          <Route path="/mahasiswa/notifikasi" element={<NotifikasiPage />} />
          <Route path="/mahasiswa/profil" element={<ProfilPage />} />
          <Route path="/mahasiswa/sk-kelulusan" element={<SKKelulusanPage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AuthGuard role="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/penjadwalan" element={<AdminPenjadwalan />} />
          <Route path="/admin/kalender" element={<AdminKalender />} />
          <Route path="/admin/database" element={<AdminDatabase />} />
        </Route>

        {/* Kaprodi Routes */}
        <Route element={<AuthGuard role="kaprodi" />}>
          <Route path="/kaprodi/dashboard" element={<KaprodiDashboard />} />
          <Route path="/kaprodi/riwayat" element={<KaprodiRiwayat />} />
          <Route path="/kaprodi/kalender" element={<KaprodiKalender />} />
        </Route>

        {/* Penguji Routes */}
        <Route element={<AuthGuard role="penguji" />}>
          <Route path="/penguji/dashboard" element={<PengujiDashboard />} />
          <Route path="/penguji/riwayat" element={<PengujiRiwayat />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
