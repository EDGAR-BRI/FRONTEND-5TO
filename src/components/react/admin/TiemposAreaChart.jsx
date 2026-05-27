import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  const duration = payload.find((entry) => entry.dataKey === 'durationMinutes')?.value ?? 0;
  const consultations = payload.find((entry) => entry.dataKey === 'consultationCount')?.value ?? 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <div className="mb-2 text-sm font-bold text-slate-800">{label}</div>
      <div className="space-y-1 text-sm text-slate-600">
        <div className="flex items-center justify-between gap-4">
          <span>Duración promedio</span>
          <span className="font-semibold text-blue-600">{Number(duration).toFixed(1)} min</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Consultas realizadas</span>
          <span className="font-semibold text-red-500">{Number(consultations)}</span>
        </div>
      </div>
    </div>
  );
};

export default function TiemposAreaChart({ data }) {
  const cleanData = data ? data.map(item => ({
    name: item.area,
    durationMinutes: parseFloat(String(item.consult)) || 0,
    consultationCount: Number(item.consultations) || 0
  })) : [];

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={cleanData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>

          <defs>
            <linearGradient id="colorConsulta" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorEspera" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: '600' }} 
          />
          
          <YAxis 
            yAxisId="left"
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 11 }} 
            unit=" min" 
          />

          <YAxis
            yAxisId="right"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            allowDecimals={false}
          />
          
          <Tooltip 
            content={<CustomTooltip />}
          />

          <Legend 
            wrapperStyle={{ paddingTop: '12px' }}
            formatter={(value) => <span style={{ color: '#475569', fontWeight: 600, fontSize: '12px', marginLeft: '6px' }}>{value}</span>}
          />
          
          <Area 
            type="monotone" 
            yAxisId="left"
            dataKey="durationMinutes" 
            name="Duración promedio" 
            stroke="#3b82f6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorConsulta)" 
            animationDuration={1500}
          />
          
          <Area 
            type="monotone" 
            yAxisId="right"
            dataKey="consultationCount" 
            name="Consultas realizadas" 
            stroke="#f87171" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorEspera)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
