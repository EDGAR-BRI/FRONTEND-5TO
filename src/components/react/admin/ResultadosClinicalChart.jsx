import { 
  RadialBarChart, 
  RadialBar, 
  Legend, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';

export default function ResultadosClinicalChart() {
  // Datos basados en tus indicadores reales
  const data = [
    {
      name: 'Adherencia Protocolo',
      value: 92,
      fill: '#8b5cf6', 
    },
    {
      name: 'Seguimientos',
      value: 88,
      fill: '#10b981', 
    },
    {
      name: 'Casos Exitosos',
      value: 94,
      fill: '#3b82f6', 
    },
  ];

  const style = {
    top: '50%',
    right: 0,
    transform: 'translate(0, -50%)',
    lineHeight: '24px',
  };

  return (
    <div className="w-full h-[350px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="30%" 
          outerRadius="100%" 
          barSize={15} 
          data={data}
          startAngle={180} 
          endAngle={-180}
        >
          <RadialBar
            minAngle={15}
            label={{ position: 'insideStart', fill: '#fff', fontSize: '10px', fontWeight: 'bold' }}
            background
            clockWise
            dataKey="value"
            cornerRadius={10}
          />
          <Tooltip 
            cursor={false}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Legend 
            iconSize={10} 
            layout="vertical" 
            verticalAlign="middle" 
            wrapperStyle={style} 
            formatter={(value) => <span className="text-gray-600 font-bold text-xs uppercase">{value}</span>}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}