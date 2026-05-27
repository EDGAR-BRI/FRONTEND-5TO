import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  const atenciones = payload.find((entry) => entry.dataKey === 'Atenciones')?.value ?? 0;
  const ingresos = payload.find((entry) => entry.dataKey === 'Ingresos')?.value ?? 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <div className="mb-2 text-sm font-bold text-slate-800">{label}</div>
      <div className="space-y-1 text-sm text-slate-600">
        <div className="flex items-center justify-between gap-4">
          <span>Atenciones</span>
          <span className="font-semibold text-blue-600">{Number(atenciones)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Ingresos</span>
          <span className="font-semibold text-rose-600">${Number(ingresos).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default function ProductividadComposedChart({ data }) {
  const cleanData = data.map(item => ({
    name: item.name,
    Atenciones: Number(item.attended) || 0,
    Ingresos: Number(item.revenue) || 0,
  }));

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={cleanData}
          margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} 
          />
          {/* Eje Izquierdo para Atenciones */}
          <YAxis 
            yAxisId="left"
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 11 }} 
          />
          {/* Eje Derecho para Ingresos */}
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            axisLine={false} 
            tickLine={false} 
            unit="$"
            tick={{ fill: '#94a3b8', fontSize: 11 }} 
          />
          
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: '#f8fafc' }}
          />
          <Legend iconType="circle" />

          {/* Barra de volumen*/}
          <Bar 
            yAxisId="left" 
            dataKey="Atenciones" 
            fill="#3b82f6" 
            radius={[6, 6, 0, 0]} 
            barSize={40} 
          />
          
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="Ingresos" 
            stroke="#ef4444" 
            strokeWidth={3} 
            dot={{ r: 6, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} 
            activeDot={{ r: 8 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
