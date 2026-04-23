
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TiemposBarChart = ({ data }) => {

  const formatData = (rawData) => {
    return rawData.map(item => ({
      name: item.area,
      Consulta: parseInt(item.consult) || 0,
      Espera: parseInt(item.wait) || 0,
      Transferencia: parseInt(item.transfer) || 0,
    }));
  };

  const chartData = formatData(data);

  return (
    <div style={{ width: '100%', height: 350, minHeight: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            width={100}
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} 
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Legend iconType="circle" />
          <Bar dataKey="Consulta" fill="#2dd4bf" radius={[0, 4, 4, 0]} barSize={12} />
          <Bar dataKey="Espera" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={12} />
          <Bar dataKey="Transferencia" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TiemposBarChart;