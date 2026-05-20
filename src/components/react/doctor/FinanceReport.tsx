import React, { useState } from 'react';
import { FaPrint, FaDollarSign, FaArrowTrendUp, FaArrowTrendDown, FaMoneyBillWave, FaSpinner } from "react-icons/fa6";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { StatsCard } from '@/components/react/primary/StatsCard';
import StaticCard from '@/components/react/primary/StaticCard';
import { Modal } from '@/components/react/primary/Modal';

export default function FinanceReport() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const mockData = {
    stats: {
      totalRevenue: 125000,
      totalExpenses: 45000,
      netProfit: 80000,
      profitMargin: 64,
      growthRate: 12
    },
    monthlyData: [
      { month: 'Ene', revenue: 95000, expenses: 35000, profit: 60000 },
      { month: 'Feb', revenue: 102000, expenses: 38000, profit: 64000 },
      { month: 'Mar', revenue: 108000, expenses: 40000, profit: 68000 },
      { month: 'Abr', revenue: 115000, expenses: 42000, profit: 73000 },
      { month: 'May', revenue: 125000, expenses: 45000, profit: 80000 },
    ],
    revenueSources: [
      { source: 'Consultas', amount: 75000 },
      { source: 'Procedimientos', amount: 30000 },
      { source: 'Laboratorio', amount: 15000 },
      { source: 'Otros', amount: 5000 },
    ],
    recentTransactions: [
      { id: 1, description: 'Consulta - María González', category: 'Consultas', type: 'income', amount: 2500, date: '2026-05-15' },
      { id: 2, description: 'Pago de suministros', category: 'Gastos', type: 'expense', amount: 3500, date: '2026-05-14' },
      { id: 3, description: 'Procedimiento - Carlos R.', category: 'Procedimientos', type: 'income', amount: 4500, date: '2026-05-14' },
      { id: 4, description: 'Laboratorio - Ana M.', category: 'Laboratorio', type: 'income', amount: 1800, date: '2026-05-13' },
      { id: 5, description: 'Mantenimiento equipo', category: 'Gastos', type: 'expense', amount: 2200, date: '2026-05-12' },
    ]
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setIsExportModalOpen(false);
    }, 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES'
    }).format(amount);
  };

  const revenueSourcesColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="flex flex-col gap-8">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Reporte Financiero</h1>
          <p className="text-slate-500 font-medium">Análisis detallado de los ingresos y gastos.</p>
        </div>
        <button 
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-700 transition shadow-lg shadow-slate-200"
        >
          <FaPrint />
          Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 data-nums-compact">
        <StatsCard 
          title="Ingresos Totales" 
          value={formatCurrency(mockData.stats.totalRevenue)} 
          color="primary" 
          icon={<FaDollarSign size={18} />} 
          trend={`+${Math.abs(mockData.stats.growthRate)}%`}
          trendUp={mockData.stats.growthRate >= 0}
          variant="compact" 
        />
        <StatsCard 
          title="Gastos Totales" 
          value={formatCurrency(mockData.stats.totalExpenses)} 
          color="danger" 
          icon={<FaMoneyBillWave size={18} />} 
          variant="compact" 
        />
        <StatsCard 
          title="Ganancia Neta" 
          value={formatCurrency(mockData.stats.netProfit)} 
          color="success" 
          icon={<FaDollarSign size={18} />} 
          variant="compact" 
        />
        <StatsCard 
          title="Margen de Ganancia" 
          value={`${mockData.stats.profitMargin}%`} 
          color="primary" 
          icon={<FaArrowTrendUp size={18} />} 
          variant="compact" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <StaticCard className="p-8">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest mb-6">Evolución Mensual</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData.monthlyData}>
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
        </StaticCard>

        <StaticCard className="p-8">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest mb-6">Tendencia de Ganancias</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData.monthlyData}>
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
        </StaticCard>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <StaticCard className="p-8">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest mb-6">Fuentes de Ingresos</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockData.revenueSources}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="amount"
                >
                  {mockData.revenueSources.map((entry: any, index: number) => (
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
            {mockData.revenueSources.map((source, index) => (
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
        </StaticCard>

        <StaticCard className="p-8">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest mb-6">Transacciones Recientes</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {mockData.recentTransactions.map((transaction) => (
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
        </StaticCard>

      </div>

      <Modal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)}
        title="Exportar Reporte Financiero"
      >
        <div className="space-y-4">
          <p className="text-slate-700">
            ¿Desea exportar el reporte financiero en formato PDF?
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

      <style dangerouslySetInnerHTML={{__html: `
        .data-nums-compact h3, 
        .data-nums-compact [class*="text-2xl"], 
        .data-nums-compact span {
          font-size: 1.125rem !important;
          line-height: 1.75rem !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          max-width: 100% !important;
        }
        .data-nums-compact div[class*="relative"] {
          overflow: hidden !important;
        }
      `}} />

    </div>
  );
}