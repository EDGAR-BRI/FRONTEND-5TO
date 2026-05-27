import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  const row = payload[0]?.payload ?? {};
  const attended = payload.find((entry) => entry.dataKey === 'attended')?.value ?? 0;
  const cancelled = payload.find((entry) => entry.dataKey === 'cancelled')?.value ?? 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white/98 p-3 shadow-lg backdrop-blur-sm">
      <div className="mb-1 text-sm font-bold text-slate-800">{label}</div>
      {row.date ? <div className="mb-2 text-xs text-slate-500">{row.date}</div> : null}
      <div className="space-y-1 text-sm text-slate-600">
        <div className="flex items-center justify-between gap-4">
          <span>Atendidas</span>
          <span className="font-semibold text-emerald-600">{attended}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Canceladas</span>
          <span className="font-semibold text-slate-500">{cancelled}</span>
        </div>
      </div>
    </div>
  );
};

const CitasBarChart = ({ data }) => {
  return (
    <div className="w-full h-[380px]"> 
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid 
            strokeDasharray="4 4" 
            vertical={false} 
            stroke="#e2e8f0" 
            opacity={0.3} 
          />
          
          <XAxis 
            dataKey="label" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 13, fontWeight: 'bold' }}
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            dx={-10} 
          />
          
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
          />
          
          <Legend 
            iconType="circle" 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => <span style={{ color: '#475569', fontWeight: 600, fontSize: '12px', marginLeft: '6px' }}>{value}</span>}
          />
          
          <Bar 
            dataKey="attended" 
            name="Atendidas" 
            fill="#2dd4bf" 
            barSize={38}
          />
          <Bar 
            dataKey="cancelled" 
            name="Canceladas" 
            fill="#e2e8f0" 
            radius={[6, 6, 0, 0]} 
            barSize={38}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CitasBarChart;
