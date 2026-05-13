import React, { useState, useEffect } from 'react';
import { FaPrint, FaSpinner, FaDollarSign, FaArrowTrendUp, FaArrowTrendDown, FaMoneyBillWave } from "react-icons/fa6";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import StatCard from './StatCard';
import { getFinanceReport, exportFinanceReportPDF, type FinanceReportResponse } from '@/lib/services/report/financeReport.service';
import { getToken, getDoctorId } from '@/lib/api';

export default function FinanceReport() {
  const doctorId = getDoctorId();
  const token = getToken();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FinanceReportResponse | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const reportData = await getFinanceReport({ 
          doctorId: doctorId ? parseInt(doctorId) : undefined 
        });
        setData(reportData);
      } catch (error) {
        console.error('Error fetching finance report:', error);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId && token) {
      fetchReport();
    }
  }, [doctorId, token]);

  // Función para exportar PDF
  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const blob = await exportFinanceReportPDF({ 
        doctorId: doctorId ? parseInt(doctorId) : undefined 
      });
      
      // Crear URL y descargar el archivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-financiero-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-slate-500">No hay datos disponibles para el reporte financiero.</p>
      </div>
    );
  }

  // Formatear valores monetarios
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES'
    }).format(amount);
  };

  // Datos para el gráfico de fuentes de ingresos
  const revenueSourcesColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="flex flex-col gap-8">
      
      {/* 1. Encabezado de la pantalla */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Reporte Financiero</h1>
          <p className="text-slate-500 font-medium">Análisis detallado de los ingresos y gastos.</p>
        </div>
        <button 
          onClick={handleExportPDF}
          disabled={exporting}
          className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-700 transition shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? <FaSpinner className="animate-spin" /> : <FaPrint />}
          {exporting ? 'Exportando...' : 'Exportar PDF'}
        </button>
      </div>

      {/* 2. Fila de Tarjetas de Estadísticas Financieras */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow-sm rounded-xl p-5 border border-slate-100 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 rounded-lg bg-green-50 text-green-500">
              <FaDollarSign size={20} />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-bold ${data.data.stats.growthRate >= 0 ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'} px-2 py-0.5 rounded-full`}>
              {data.data.stats.growthRate >= 0 ? <FaArrowTrendUp size={10} /> : <FaArrowTrendDown size={10} />}
              {Math.abs(data.data.stats.growthRate)}%
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(data.data.stats.totalRevenue)}</h3>
            <p className="text-xs text-slate-400 font-medium">Ingresos Totales</p>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-xl p-5 border border-slate-100 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 rounded-lg bg-red-50 text-red-500">
              <FaMoneyBillWave size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(data.data.stats.totalExpenses)}</h3>
            <p className="text-xs text-slate-400 font-medium">Gastos Totales</p>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-xl p-5 border border-slate-100 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-500">
              <FaDollarSign size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(data.data.stats.netProfit)}</h3>
            <p className="text-xs text-slate-400 font-medium">Ganancia Neta</p>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-xl p-5 border border-slate-100 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-500">
              <FaArrowTrendUp size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{data.data.stats.profitMargin}%</h3>
            <p className="text-xs text-slate-400 font-medium">Margen de Ganancia</p>
          </div>
        </div>
      </div>

      {/* 3. Panel de Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfica de Barras - Ingresos Mensuales */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest mb-6">Evolución Mensual</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica de Líneas - Tendencia */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest mb-6">Tendencia de Ganancias</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 4. Fuentes de Ingresos y Transacciones Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfica de Pastel - Fuentes de Ingresos */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest mb-6">Fuentes de Ingresos</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.data.revenueSources}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="amount"
                >
                  {data.data.revenueSources.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={revenueSourcesColors[index % revenueSourcesColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                  formatter={(value: any) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {data.data.revenueSources.map((source, index) => (
              <div key={source.source} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: revenueSourcesColors[index % revenueSourcesColors.length] }}
                  ></div>
                  <span className="text-slate-700">{source.source}</span>
                </div>
                <span className="font-medium text-slate-800">{formatCurrency(source.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transacciones Recientes */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest mb-6">Transacciones Recientes</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {data.data.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    transaction.type === 'income' 
                      ? 'bg-green-50 text-green-600' 
                      : 'bg-red-50 text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{transaction.description}</p>
                    <p className="text-xs text-slate-500">{transaction.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-slate-500">{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
