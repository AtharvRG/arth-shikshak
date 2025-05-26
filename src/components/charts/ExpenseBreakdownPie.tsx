// src/components/charts/ExpenseBreakdownPie.tsx
"use client"; // This component uses hooks and needs to be client-side

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { User } from '@/models/User'; // Assuming User type includes expenses

interface ExpenseData {
    name: string;
    value: number;
}

// Define some consistent colors for categories
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f0e', '#ffbb28', '#00C49F', '#FF8042', '#d0ed57'];

interface ExpenseBreakdownPieProps {
    expenses: User['expenses']; // Expects the expenses array
}

const ExpenseBreakdownPie: React.FC<ExpenseBreakdownPieProps> = ({ expenses }) => {
    // Memoize processed data to avoid recalculation on every render
    const data: ExpenseData[] = useMemo(() => {
        if (!expenses || expenses.length === 0) return [];
        // Aggregate amounts by category
        const categoryTotals: { [key: string]: number } = {};
        expenses.forEach(exp => {
            if (exp.category && exp.amount && exp.amount > 0) {
                categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
            }
        });
        return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
    }, [expenses]);

    if (data.length === 0) {
        return <div className="flex items-center justify-center h-full text-neutral-500 text-sm">No expense data available.</div>;
    }

    return (
        // ResponsiveContainer makes the chart adapt to parent size
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%" // Center X
                    cy="50%" // Center Y
                    labelLine={false} // Don't show lines from slice to label
                    outerRadius="80%" // Size of the pie
                    fill="#8884d8" // Default fill (overridden by Cells)
                    dataKey="value" // The key in data objects representing the value
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} // Simple label
                    fontSize={10} // Adjust label font size
                    stroke="#333" // Border around slices
                >
                    {/* Assign colors to each slice */}
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} // Format tooltip value
                    contentStyle={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', border: 'none', borderRadius: '5px', fontSize: '12px' }} // Dark tooltip style
                    itemStyle={{ color: '#eee' }}
                />
                <Legend iconSize={10} wrapperStyle={{fontSize: '11px', paddingTop: '15px'}}/>
            </PieChart>
        </ResponsiveContainer>
    );
};

export default ExpenseBreakdownPie;