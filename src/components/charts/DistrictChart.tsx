'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface DistrictChartProps {
  data: { district: string; sales: number }[];
}

export default function DistrictChart({ data }: DistrictChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="district" 
            type="category" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 500 }}
          />
          <Tooltip 
            cursor={{ fill: '#f9fafb' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="sales" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#0047FF" fillOpacity={1 - (index * 0.15)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
