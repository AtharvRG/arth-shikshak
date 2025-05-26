// src/components/charts/DonutChart.tsx
"use client";
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Text } from 'recharts';
import { cn } from '@/lib/utils';

interface DonutChartData {
  name: string;
  value: number;
  color: string; // Color for this slice
}

interface DonutChartProps {
  data: DonutChartData[];
  title?: string; // Optional title inside the donut
}

const DonutChart: React.FC<DonutChartProps> = ({ data, title }) => {
  if (!data || data.length === 0 || data.every(d => d.value === 0)) {
    // Render a placeholder or empty state if no data
    return (
      <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs italic">
        Enter values to see chart
      </div>
    );
  }

  // Calculate total for center text if needed, or just show title
  const totalValue = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="60%" // Makes it a donut
          outerRadius="85%"
          fill="#8884d8" // Default fill, overridden by Cells
          paddingAngle={data.length > 1 ? 2 : 0} // Add padding between slices if more than one
          dataKey="value"
          // labelLine={false} // No labels on slices by default
          // label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke={cn(entry.color === 'transparent' ? 'transparent' : '#262626')} strokeWidth={entry.color === 'transparent' ? 0 : 1} /> // Border around slices
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [`₹ ${value.toLocaleString('en-IN')}`, name]}
          contentStyle={{ backgroundColor: 'rgba(25, 25, 25, 0.85)', border: '1px solid #404040', borderRadius: '5px', fontSize: '12px' }}
          itemStyle={{ color: '#e5e5e5' }}
        />
        {/* Optional: Center Text/Title */}
        {title && (
            <Text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-neutral-300 text-sm font-medium"
            >
              {title}
            </Text>
        )}
         <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize: '10px', paddingTop: '10px'}}/>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DonutChart;