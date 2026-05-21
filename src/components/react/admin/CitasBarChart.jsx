import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
            dataKey="day" 
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
            cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
            contentStyle={{ 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)',
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(5px)',
              padding: '12px'
            }}
            labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#1e293b' }}
          />
          
          <Legend 
            iconType="circle" 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => <span style={{ color: '#475569', fontWeight: 600, fontSize: '12px', marginLeft: '6px' }}>{value}</span>}
          />
          
          <Bar 
            dataKey="attended" 
            name="Atendidas" 
            stackId="a" 
            fill="#2dd4bf" 
            barSize={38}
          />
          <Bar 
            dataKey="noShow" 
            name="Canceladas" 
            stackId="a" 
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
