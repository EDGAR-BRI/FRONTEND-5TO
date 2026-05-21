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

export default function ProductividadComposedChart({ data }) {
  const cleanData = data.map(item => ({
    name: item.name,
    Atenciones: item.attended,
    Ingresos: parseFloat(String(item.revenue).replace(/[^0-9.-]/g, '')) || 0,
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
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
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
