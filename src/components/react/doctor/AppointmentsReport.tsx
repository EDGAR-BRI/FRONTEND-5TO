import React, { useMemo, useState } from 'react';
import { FaPrint, FaCalendarCheck, FaXmark, FaCalendar, FaSpinner } from "react-icons/fa6";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StatsCard } from '@/components/react/primary/StatsCard';
import  StaticCard  from '@/components/react/primary/StaticCard';
import { Modal } from '@/components/react/primary/Modal';

export default function AppointmentsReport() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState({
    from: '',
    to: ''
  });
  const mockData = {
    stats: {
      total: 156,
      completed: 98,
      cancelled: 23,
      scheduled: 35
    },
    dailyData: [
      { date: '01/05', total: 12, completed: 8, cancelled: 2 },
      { date: '02/05', total: 15, completed: 10, cancelled: 3 },
      { date: '03/05', total: 18, completed: 12, cancelled: 2 },
      { date: '04/05', total: 14, completed: 9, cancelled: 3 },
      { date: '05/05', total: 20, completed: 14, cancelled: 2 },
      { date: '06/05', total: 16, completed: 11, cancelled: 3 },
      { date: '07/05', total: 22, completed: 16, cancelled: 2 },
      { date: '08/05', total: 19, completed: 13, cancelled: 3 },
      { date: '09/05', total: 17, completed: 12, cancelled: 2 },
      { date: '10/05', total: 23, completed: 17, cancelled: 3 },
    ],
    topPatients: [
      { patientId: 1, patientName: 'María González', totalAppointments: 12, completedAppointments: 10, cancelledAppointments: 2, lastAppointmentDate: '2026-05-15' },
      { patientId: 2, patientName: 'Carlos Rodríguez', totalAppointments: 10, completedAppointments: 8, cancelledAppointments: 2, lastAppointmentDate: '2026-05-14' },
      { patientId: 3, patientName: 'Ana Martínez', totalAppointments: 8, completedAppointments: 7, cancelledAppointments: 1, lastAppointmentDate: '2026-05-13' },
      { patientId: 4, patientName: 'Pedro Sánchez', totalAppointments: 7, completedAppointments: 6, cancelledAppointments: 1, lastAppointmentDate: '2026-05-12' },
      { patientId: 5, patientName: 'Laura López', totalAppointments: 6, completedAppointments: 5, cancelledAppointments: 1, lastAppointmentDate: '2026-05-11' },
    ]
  };

  const currentYear = new Date().getFullYear();
  const parseDayMonth = (value: string) => {
    const [day, month] = value.split('/').map(Number);
    return new Date(currentYear, (month || 1) - 1, day || 1);
  };

  const isWithinRange = (date: Date, from?: Date, to?: Date) => {
    if (from && date < from) return false;
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      if (date > end) return false;
    }
    return true;
  };

  const fromDate = filters.from ? new Date(filters.from) : undefined;
  const toDate = filters.to ? new Date(filters.to) : undefined;

  const filteredDailyData = useMemo(() => {
    return mockData.dailyData.filter((item) => isWithinRange(parseDayMonth(item.date), fromDate, toDate));
  }, [mockData.dailyData, fromDate, toDate]);

  const computedStats = useMemo(() => {
    return filteredDailyData.reduce((acc, item) => {
      acc.total += item.total;
      acc.completed += item.completed;
      acc.cancelled += item.cancelled;
      return acc;
    }, { total: 0, completed: 0, cancelled: 0, scheduled: 0 });
  }, [filteredDailyData]);

  const statsWithScheduled = useMemo(() => {
    const scheduled = Math.max(computedStats.total - computedStats.completed - computedStats.cancelled, 0);
    return { ...computedStats, scheduled };
  }, [computedStats]);

  const statusData = useMemo(() => {
    return [
      { name: 'Completadas', value: statsWithScheduled.completed, color: '#10b981' },
      { name: 'Canceladas', value: statsWithScheduled.cancelled, color: '#ef4444' },
      { name: 'Programadas', value: statsWithScheduled.scheduled, color: '#3b82f6' },
    ];
  }, [statsWithScheduled]);

  const filteredTopPatients = useMemo(() => {
    return mockData.topPatients.filter((patient) => {
      const lastDate = new Date(patient.lastAppointmentDate);
      return isWithinRange(lastDate, fromDate, toDate);
    });
  }, [mockData.topPatients, fromDate, toDate]);

  const applyQuickRange = (range: 'day' | 'week' | 'month') => {
    const today = new Date();
    const end = today.toISOString().slice(0, 10);
    let startDate = new Date(today);

    if (range === 'week') {
      startDate.setDate(startDate.getDate() - 6);
    }

    if (range === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    if (range === 'day') {
      startDate = today;
    }

    const start = startDate.toISOString().slice(0, 10);
    setFilters({ from: start, to: end });
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setIsExportModalOpen(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Reporte de Citas</h1>
          <p className="text-slate-500 font-medium">Análisis detallado de las citas médicas.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-700 transition shadow-lg shadow-slate-200"
          >
            <FaPrint />
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Citas" value={statsWithScheduled.total} color="primary" icon={<FaCalendar size={18} />} variant="compact" />
        <StatsCard title="Completadas" value={statsWithScheduled.completed} color="success" icon={<FaCalendarCheck size={18} />} variant="compact" />
        <StatsCard title="Canceladas" value={statsWithScheduled.cancelled} color="danger" icon={<FaXmark size={18} />} variant="compact" />
        <StatsCard title="Programadas" value={statsWithScheduled.scheduled} color="primary" icon={<FaCalendar size={18} />} variant="compact" />
      </div>

            <StaticCard className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Filtros</h3>
            <button
              type="button"
              onClick={() => setFilters({ from: '', to: '' })}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition"
            >
              Limpiar filtros
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-xs font-semibold text-slate-600 flex flex-col gap-2">
              Desde
              <input
                type="date"
                value={filters.from}
                onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>
            <label className="text-xs font-semibold text-slate-600 flex flex-col gap-2">
              Hasta
              <input
                type="date"
                value={filters.to}
                onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyQuickRange('day')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => applyQuickRange('week')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Semana
            </button>
            <button
              type="button"
              onClick={() => applyQuickRange('month')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Mes
            </button>
          </div>
        </div>
      </StaticCard>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StaticCard className="p-8">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest mb-6">Evolución Diaria</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredDailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </StaticCard>
        <StaticCard className="p-8">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest mb-6">Distribución por Estado</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </StaticCard>

      </div>
      <StaticCard className="p-8">
        <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest mb-6">Pacientes Más Frecuentes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-700">Paciente</th>
                <th className="text-center py-3 px-4 font-medium text-slate-700">Total Citas</th>
                <th className="text-center py-3 px-4 font-medium text-slate-700">Completadas</th>
                <th className="text-center py-3 px-4 font-medium text-slate-700">Canceladas</th>
                <th className="text-center py-3 px-4 font-medium text-slate-700">Última Cita</th>
              </tr>
            </thead>
            <tbody>
            {filteredTopPatients.map((patient, index) => (
              <tr key={patient.patientId} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                      {index + 1}
                    </div>
                      <span className="font-medium text-slate-800">{patient.patientName}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4 text-slate-600">{patient.totalAppointments}</td>
                  <td className="text-center py-3 px-4 text-green-600">{patient.completedAppointments}</td>
                  <td className="text-center py-3 px-4 text-red-600">{patient.cancelledAppointments}</td>
                  <td className="text-center py-3 px-4 text-slate-600">{new Date(patient.lastAppointmentDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StaticCard>

      <Modal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)}
        title="Exportar Reporte de Citas"
      >
        <div className="space-y-4">
          <p className="text-slate-700">
            ¿Desea exportar el reporte de citas en formato PDF?
          </p>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">El reporte incluirá:</p>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Estadísticas de citas (total, completadas, canceladas, programadas)</li>
              <li>• Gráfica de evolución diaria</li>
              <li>• Distribución por estado</li>
              <li>• Lista de pacientes más frecuentes</li>
            </ul>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsExportModalOpen(false)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? <><FaSpinner className="animate-spin" /> Exportando...</> : <><FaPrint /> Exportar</>}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
