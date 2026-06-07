import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LossChartProps {
  data: { epoch: number; trainLoss: number; testLoss: number }[];
}

export const LossChart: React.FC<LossChartProps> = ({ data }) => {
  const displayData = data.length > 100 
    ? data.filter((_, i) => i % Math.ceil(data.length / 100) === 0 || i === data.length - 1)
    : data;

  return (
    <div style={{ width: '100%', height: 180, background: '#f8fafc', borderRadius: 8, padding: 8 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={displayData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="epoch" 
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            domain={[0, 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              fontSize: 11, 
              background: '#ffffff', 
              border: '1px solid #e2e8f0',
              borderRadius: 6,
            }} 
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line 
            type="monotone" 
            dataKey="trainLoss" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={false}
            name="训练 Loss"
          />
          <Line 
            type="monotone" 
            dataKey="testLoss" 
            stroke="#f59e0b" 
            strokeWidth={2}
            dot={false}
            name="测试 Loss"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
