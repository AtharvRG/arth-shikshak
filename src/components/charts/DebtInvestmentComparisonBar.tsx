// src/components/charts/DebtInvestmentComparisonBar.tsx
"use client";

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { User } from '@/models/User';

interface DebtInvestmentData {
    name: string;
    Debts: number;
    Investments: number;
}

interface DebtInvestmentComparisonProps {
    debts: User['debts'];
    investments: User['investments'];
}

const DebtInvestmentComparisonBar: React.FC<DebtInvestmentComparisonProps> = ({ debts, investments }) => {
    const data: DebtInvestmentData[] = useMemo(() => {
        const totalDebt = debts?.reduce((sum, debt) => sum + (debt.amount || 0), 0) || 0;
        const totalInvestments = investments?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;
        return [{ name: 'Total Value', Debts: totalDebt, Investments: totalInvestments }];
    }, [debts, investments]);

     if (data[0].Debts === 0 && data[0].Investments === 0) {
        return <div className="flex items-center justify-center h-full text-neutral-500 text-sm">No debt or investment data.</div>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }} // Adjust margins
                barGap={10} // Gap between bars if multiple categories existed
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#555" /> {/* Subtle grid lines */}
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#aaa' }} />
                <YAxis tickFormatter={(value) => `₹${(value / 1000).toLocaleString('en-IN')}k`} tick={{ fontSize: 10, fill: '#aaa' }} /> {/* Format Y-axis ticks */}
                <Tooltip
                    formatter={(value: number, name: string) => [`₹${value.toLocaleString('en-IN')}`, name]}
                    contentStyle={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', border: 'none', borderRadius: '5px', fontSize: '12px' }}
                    itemStyle={{ color: '#eee' }}
                    cursor={{ fill: 'rgba(100, 100, 100, 0.2)' }}
                 />
                <Legend wrapperStyle={{fontSize: '11px'}} />
                <Bar dataKey="Debts" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={50} /> {/* Red for Debts */}
                <Bar dataKey="Investments" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={50}/> {/* Green for Investments */}
            </BarChart>
        </ResponsiveContainer>
    );
};

export default DebtInvestmentComparisonBar;