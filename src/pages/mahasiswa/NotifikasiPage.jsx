import React from 'react';
import MahasiswaSidebar from '../../components/layout/MahasiswaSidebar';
import PageHeader from '../../components/layout/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { SidanusDB } from '../../db/sidanusDB';
import { useRegistrations } from '../../hooks/useRegistrations';

export default function NotifikasiPage() {
  const { session } = useAuth();
  const student = SidanusDB.getStudent(session?.identifier);
  const { registrations } = useRegistrations(student?.nim);

  if (!student) return null;

  // Generate notifications based on registration status
  let notifications = [];
  
  registrations.forEach(reg => {
    const examLabel = SidanusDB.getExamLabel(reg.jenisUjian);
    
    if (reg.statusVerifikasi === 'menunggu') {
      notifications.push({
        id: `notif-${reg.id}-1`,
        title: `Pendaftaran ${examLabel} Terkirim`,
        desc: `Berkas pendaftaran ${examLabel} Anda telah terkirim dan sedang menunggu verifikasi admin.`,
        type: 'info',
        date: reg.tanggalDaftar
      });
    }

    if (reg.statusVerifikasi === 'disetujui') {
      notifications.push({
        id: `notif-${reg.id}-2`,
        title: `Berkas ${examLabel} Disetujui`,
        desc: `Berkas pendaftaran ${examLabel} Anda telah disetujui. Silakan tunggu informasi jadwal ujian.`,
        type: 'success',
        date: reg.tanggalDaftar // in a real app, we'd have verification date
      });
    }

    if (reg.statusVerifikasi === 'dikembalikan') {
      notifications.push({
        id: `notif-${reg.id}-3`,
        title: `Berkas ${examLabel} Dikembalikan`,
        desc: `Pendaftaran ${examLabel} Anda dikembalikan. Catatan: ${reg.catatanAdmin || 'Berkas tidak lengkap.'}`,
        type: 'warning',
        date: reg.tanggalDaftar
      });
    }
    
    const schedule = SidanusDB.getSchedules().find(s => s.registrationId === reg.id);
    if (schedule) {
      if (schedule.statusKaprodi === 'disetujui' || schedule.statusKaprodi === 'selesai') {
        notifications.push({
          id: `notif-sch-${schedule.id}`,
          title: `Jadwal ${examLabel} Ditetapkan`,
          desc: `Jadwal ujian Anda telah ditetapkan pada ${SidanusDB.formatDate(schedule.tanggal)}.`,
          type: 'success',
          date: schedule.tanggal
        });
      }
      if (schedule.statusKaprodi === 'selesai') {
        if (schedule.perluRevisi) {
          notifications.push({
            id: `notif-rev-${schedule.id}`,
            title: `Revisi Ujian ${examLabel}`,
            desc: `Terdapat catatan revisi dari penguji: "${schedule.catatanPenguji}".`,
            type: 'warning',
            date: schedule.tanggalSelesai || schedule.tanggal
          });
        } else {
          notifications.push({
            id: `notif-pass-${schedule.id}`,
            title: `Lulus Ujian ${examLabel} 🎉`,
            desc: `Selamat! Anda telah dinyatakan lulus untuk ujian ini.`,
            type: 'success',
            date: schedule.tanggalSelesai || schedule.tanggal
          });
        }
      }
    }
  });

  // Urutkan berdasarkan ID atau Date secara menurun (terbaru di atas)
  notifications.sort((a, b) => b.id.localeCompare(a.id));

  const getIcon = (type) => {
    if(type === 'success') return <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    if(type === 'warning') return <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
    return <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  };

  const getBg = (type) => {
    if(type === 'success') return 'bg-emerald-100';
    if(type === 'warning') return 'bg-rose-100';
    return 'bg-blue-100';
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <MahasiswaSidebar />
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <PageHeader title="Pusat Notifikasi" />
        
        <main className="flex-1 p-4 sm:p-6 max-w-3xl mx-auto w-full">
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Notifikasi Terbaru</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {notifications.map(notif => (
                <div key={notif.id} className="p-4 hover:bg-slate-50 transition-colors flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getBg(notif.type)}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{notif.title}</h3>
                    <p className="text-slate-600 text-sm mt-1">{notif.desc}</p>
                    <p className="text-xs text-slate-400 mt-2 font-medium">{SidanusDB.formatDate(notif.date)}</p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  <p>Tidak ada notifikasi.</p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
