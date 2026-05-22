import React, { useMemo, useState, useEffect } from 'react';
import { FaPrint, FaCalendarCheck, FaXmark, FaCalendar, FaSpinner } from "react-icons/fa6";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StatsCard } from '@/components/react/primary/StatsCard';
import  StaticCard  from '@/components/react/primary/StaticCard';
import { Modal } from '@/components/react/primary/Modal';
import { getDoctorAppointmentsReport } from '@/lib/services/report/doctorAppointments.service';
import { Alert } from '@/utils/alerts';

type AppointmentsReportProps = {
  userId?: number;
};

export default function AppointmentsReport({ userId }: AppointmentsReportProps) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [quickRange, setQuickRange] = useState<null | 'week' | 'month' | 'year'>(null);
  const [reportData, setReportData] = useState({
    stats: {
      total: 0,
      completed: 0,
      cancelled: 0,
      scheduled: 0
    },
    dailyData: [] as Array<{ date: string; total: number; completed: number; cancelled: number }>,
    topPatients: [] as Array<{
      patientId: number;
      patientName: string;
      totalAppointments: number;
      completedAppointments: number;
      cancelledAppointments: number;
      lastAppointmentDate: string;
    }>
  });
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const currentYear = new Date().getFullYear();
  const [filters, setFilters] = useState({
    from: `${currentYear}-01-01`,
    to: `${currentYear}-12-31`
  });

  const isWithinRange = (dateStr: string, from?: string, to?: string) => {
    if (from && dateStr < from) return false;
    if (to && dateStr > to) return false;
    return true;
  };

  const fromDate = filters.from ?? undefined;
  const toDate = filters.to ?? undefined;
  const rangeDays = fromDate && toDate
    ? Math.floor((new Date(toDate).getTime() - new Date(fromDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : null;
  const chartGranularity = quickRange === 'week'
    ? 'day'
    : quickRange === 'month'
      ? 'day'
      : quickRange === 'year'
        ? 'month'
        : rangeDays !== null
          ? rangeDays <= 31
            ? 'day'
            : 'month'
          : 'day';

  const filteredDailyData = useMemo(() => {
    return reportData.dailyData.filter((item) => isWithinRange(item.date, fromDate, toDate));
  }, [reportData.dailyData, fromDate, toDate]);

  
  const filteredTopPatients = useMemo(() => {
    return reportData.topPatients.filter((patient) => {
      return isWithinRange(patient.lastAppointmentDate, fromDate, toDate);
    });
  }, [reportData.topPatients, fromDate, toDate]);

  const statsFromPatients = useMemo(() => {
    return filteredTopPatients.reduce((acc, patient) => {
      acc.total += patient.totalAppointments;
      acc.completed += patient.completedAppointments;
      acc.cancelled += patient.cancelledAppointments;
      return acc;
    }, { total: 0, completed: 0, cancelled: 0, scheduled: 0 });
  }, [filteredTopPatients]);

  const statsWithScheduled = useMemo(() => {
    if (rangeDays === null || rangeDays > 31) {
      return reportData.stats;
    }
    const baseStats = statsFromPatients;
    const scheduled = Math.max(baseStats.total - baseStats.completed - baseStats.cancelled, 0);
    return { ...baseStats, scheduled };
  }, [rangeDays, reportData.stats, statsFromPatients]);

  const statusData = useMemo(() => {
    return [
      { name: 'Completadas', value: statsWithScheduled.completed, color: '#10b981' },
      { name: 'Canceladas', value: statsWithScheduled.cancelled, color: '#ef4444' },
      { name: 'Programadas', value: statsWithScheduled.scheduled, color: '#3b82f6' },
    ];
  }, [statsWithScheduled]);

  const chartData = useMemo(() => {
    if (chartGranularity === 'day') {
      if (!fromDate || !toDate) return [];
      const days: {
        period: string;
        total: number;
        completed: number;
        cancelled: number;
        scheduled: number;
      }[] = [];

      const startDate = new Date(fromDate + 'T00:00:00.000Z');
      const endDate = new Date(toDate + 'T00:00:00.000Z');
      const cursor = new Date(startDate);
      while (cursor <= endDate) {
        const y = cursor.getUTCFullYear();
        const m = String(cursor.getUTCMonth() + 1).padStart(2, '0');
        const d = String(cursor.getUTCDate()).padStart(2, '0');
        const label = `${d}/${m}`;
        days.push({ period: label, total: 0, completed: 0, cancelled: 0, scheduled: 0 });
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }

      const indexMap = new Map(days.map((item, index) => [item.period, index]));
      filteredDailyData.forEach((item) => {
        const parts = item.date.split('-');
        const label = `${parts[2]}/${parts[1]}`;
        const targetIndex = indexMap.get(label);
        if (targetIndex === undefined) return;
        days[targetIndex].total += item.total;
        days[targetIndex].completed += item.completed;
        days[targetIndex].cancelled += item.cancelled;
        days[targetIndex].scheduled = Math.max(
          days[targetIndex].total - days[targetIndex].completed - days[targetIndex].cancelled,
          0,
        );
      });

      return days;
    }

    if (!fromDate) {
      return [];
    }

    const year = parseInt(fromDate.split('-')[0], 10);
    const months: {
      key: string;
      period: string;
      total: number;
      completed: number;
      cancelled: number;
      scheduled: number;
    }[] = [];

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
      const key = `${year}-${monthIndex}`;
      const period = monthNames[monthIndex];
      months.push({ key, period, total: 0, completed: 0, cancelled: 0, scheduled: 0 });
    }

    const monthMap = new Map(months.map((item) => [item.key, item]));
    filteredDailyData.forEach((item) => {
      const parts = item.date.split('-');
      const monthIndex = parseInt(parts[1], 10) - 1;
      const key = `${year}-${monthIndex}`;
      const bucket = monthMap.get(key);
      if (!bucket) return;
      bucket.total += item.total;
      bucket.completed += item.completed;
      bucket.cancelled += item.cancelled;
      bucket.scheduled = Math.max(bucket.total - bucket.completed - bucket.cancelled, 0);
    });

    return months.map(({ key, ...rest }) => rest);
  }, [chartGranularity, filteredDailyData, fromDate, toDate, currentYear]);

  const applyQuickRange = (range: 'week' | 'month' | 'year') => {
    const today = new Date();
    const end = today.toISOString().slice(0, 10);
    let startDate = new Date(today);

    if (range === 'week') {
      startDate.setDate(startDate.getDate() - 6);
    }

    if (range === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    if (range === 'year') {
      startDate = new Date(today.getFullYear(), 0, 1);
    }

    const start = startDate.toISOString().slice(0, 10);
    setFilters({ from: start, to: end });
    setQuickRange(range);
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setIsExportModalOpen(false);
    }, 2000);
  };

  useEffect(() => {
    const fetchReport = async () => {
      if (!userId || Number.isNaN(userId)) {
        console.warn('[AppointmentsReport] userId no válido:', userId);
        return;
      }
      setIsLoadingReport(true);
      try {
        console.log('[AppointmentsReport] Fetching report...', { userId, from: filters.from, to: filters.to });
        const response = await getDoctorAppointmentsReport({
          userId,
          from: filters.from || undefined,
          to: filters.to || undefined,
        });
        console.log('[AppointmentsReport] Report data received:', response.data);
        setReportData({
          stats: response.data.stats,
          dailyData: response.data.dailyData,
          topPatients: response.data.topPatients,
        });
      } catch (error: any) {
        console.error('[AppointmentsReport] Error fetching report:', error);
        Alert.error(error.message ?? 'No se pudo cargar el reporte de citas');
      } finally {
        setIsLoadingReport(false);
      }
    };

    fetchReport();
  }, [userId, filters.from, filters.to]);

  return (
    <div className="flex flex-col gap-8">
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
              onClick={() => {
                setFilters({ from: `${currentYear}-01-01`, to: `${currentYear}-12-31` });
                setQuickRange(null);
              }}
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
                max={filters.to}
                onChange={(event) => {
                  setFilters((prev) => ({ ...prev, from: event.target.value }));
                  setQuickRange(null);
                }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>
            <label className="text-xs font-semibold text-slate-600 flex flex-col gap-2">
              Hasta
              <input
                type="date"
                value={filters.to}
                min={filters.from}
                onChange={(event) => {
                  setFilters((prev) => ({ ...prev, to: event.target.value }));
                  setQuickRange(null);
                }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
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
            <button
              type="button"
              onClick={() => applyQuickRange('year')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Año
            </button>
          </div>
        </div>
      </StaticCard>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StaticCard className="p-8">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest mb-6">Evolución Diaria</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="period" 
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
                  dataKey="completed" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="cancelled" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="scheduled" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
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
