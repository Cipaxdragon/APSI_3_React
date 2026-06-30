import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import PageHeader from '../../components/layout/PageHeader';
import { SidanusDB } from '../../db/sidanusDB';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminKalenderPage() {
  const [schedules, setSchedules] = useState([]);
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date('2026-06-01')); // Using June 2026 for demo context

  useEffect(() => {
    // Only fetch active (approved/completed) schedules
    const activeSchedules = SidanusDB.getSchedules().filter(s => 
      s.statusKaprodi === 'disetujui' || s.statusKaprodi === 'selesai'
    );
    setSchedules(activeSchedules);
    setEvents(SidanusDB.getAcademicEvents());
  }, []);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const getSchedulesForDay = (day) => {
    const targetDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return schedules.filter(s => s.tanggal === dateString);
  };

  const getEventsForDay = (day) => {
    const targetDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.tanggal === dateString);
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <AdminSidebar />
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <PageHeader title="Kalender Akademik" />
        
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
            
            {/* Header Kalender */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 text-lg">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
                  <p className="text-xs text-slate-500">Jadwal Ujian yang Telah Disetujui</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={nextMonth} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Grid Kalender */}
            <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden">
              {/* Nama Hari */}
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                <div key={day} className="bg-slate-50 p-2 text-center text-xs font-bold text-slate-500">
                  {day}
                </div>
              ))}
              
              {/* Kotak Kosong Awal Bulan */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-white min-h-[100px] p-2 opacity-30"></div>
              ))}

              {/* Tanggal */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const daySchedules = getSchedulesForDay(day);
                const dayEvents = getEventsForDay(day);
                const isToday = day === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear();

                return (
                  <div key={day} className={`bg-white min-h-[120px] p-2 transition-colors hover:bg-slate-50 group`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}>
                        {day}
                      </span>
                      {daySchedules.length > 0 && (
                        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                          {daySchedules.length} Ujian
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1.5 overflow-y-auto max-h-[80px] pr-1 custom-scrollbar">
                      {dayEvents.map(evt => (
                        <div key={'evt-'+evt.id} className={`text-[10px] p-1.5 rounded border transition-colors ${
                          evt.tipe === 'libur' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                          evt.tipe === 'kegiatan' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                          'bg-sky-50 border-sky-100 text-sky-700'
                        }`}>
                          <p className="font-bold truncate">{evt.nama}</p>
                        </div>
                      ))}
                      {daySchedules.map(sch => {
                        const student = SidanusDB.getStudent(sch.nim);
                        return (
                          <div key={sch.id} className="text-[10px] p-1.5 rounded bg-slate-50 border border-slate-100 group-hover:border-indigo-100 transition-colors">
                            <p className="font-bold text-slate-800 truncate">{student?.nama || sch.nim}</p>
                            <p className="text-slate-500 truncate">{sch.jamMulai} • {SidanusDB.getExamLabel(sch.jenisUjian)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
