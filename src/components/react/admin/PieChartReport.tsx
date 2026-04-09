import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  data: { metodo: string; monto: number; percentage: number; color: string }[];
}

export const PieChartReport = ({ data }: Props) => {
  const chartData = data.map(item => ({
    name: item.metodo,
    value: item.monto,
    color: item.color
  }));

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
            animationBegin={0}
            animationDuration={1500}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Recaudado']}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};