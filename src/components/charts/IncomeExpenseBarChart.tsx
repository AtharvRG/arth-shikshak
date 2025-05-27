// src/components/charts/IncomeExpenseBarChart.tsx
"use client";

import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, Cell // Added Cell import
} from 'recharts';
import { cn } from '@/lib/utils'; // Import class name utility

// Define props for the component
interface IncomeExpenseChartProps {
    annualSalary?: number | null;
    totalMonthlyExpenses?: number | null;
}

// Define colors for consistency
const INCOME_COLOR = "#22c55e"; // Tailwind Green-500
const EXPENSE_COLOR = "#ef4444"; // Tailwind Red-500
const GRID_COLOR = "#404040"; // Tailwind Neutral-700 (darker gray)
const TEXT_COLOR_LIGHT = "#d4d4d4"; // Tailwind Neutral-300
const TEXT_COLOR_MUTED = "#a3a3a3"; // Tailwind Neutral-400

// The main chart component
const IncomeExpenseBarChart: React.FC<IncomeExpenseChartProps> = ({
    annualSalary,
    totalMonthlyExpenses
}) => {
    // Calculate monthly income, expenses, and difference using useMemo for optimization
    const chartData = useMemo(() => {
        // Calculate monthly income safely (default to 0 if salary invalid/missing)
        const monthlyIncome = (annualSalary && annualSalary > 0) ? Math.round(annualSalary / 12) : 0;
        // Get expenses safely (default to 0)
        const expenses = totalMonthlyExpenses ?? 0;
        // Calculate the difference (surplus/deficit)
        const difference = monthlyIncome - expenses;

        // Return data structured for Recharts and additional calculated values
        return {
            data: [{ name: 'Monthly Flow', Income: monthlyIncome, Expenses: expenses, Difference: difference }],
            monthlyIncome,
            expenses,
            difference
        };
    }, [annualSalary, totalMonthlyExpenses]); // Recalculate only if props change

    // Determine the color for the difference text based on surplus/deficit
    const differenceColor = chartData.difference >= 0 ? 'text-green-400' : 'text-red-400';

    // Handle case where there's no data to display
    if (chartData.monthlyIncome === 0 && chartData.expenses === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-neutral-500 text-sm p-4 text-center">
                 Provide Annual Salary and Expenses during onboarding to see your estimated monthly cash flow.
             </div>
         );
    }

    // --- Formatting Functions ---
    // Formats numbers as Indian Rupees currency string (₹x,xx,xxx)
    const formatCurrency = (value: number): string => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

    // Formats Y-axis ticks into Lakhs (L) or Crores (Cr) for large numbers
    const formatAxisTick = (value: number): string => {
        if (Math.abs(value) >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
        if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
        if (Math.abs(value) >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
        return `₹${value}`;
    };
    // --- End Formatting Functions ---


    // --- Custom Tooltip Component ---
    // Provides a styled tooltip box on hover
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const income = payload.find((p: any) => p.dataKey === 'Income')?.value || 0;
            const expenses = payload.find((p: any) => p.dataKey === 'Expenses')?.value || 0;
            const difference = income - expenses;
            const diffColor = difference >= 0 ? 'text-green-400' : 'text-red-400';

            return (
                <div className="bg-neutral-800/90 backdrop-blur-sm text-neutral-200 p-3 rounded-md shadow-lg border border-neutral-700 text-xs">
                    <p className="font-semibold mb-1">Monthly Cash Flow</p>
                    <p className="text-green-400">{`Income: ${formatCurrency(income)}`}</p>
                    <p className="text-red-400">{`Expenses: ${formatCurrency(expenses)}`}</p>
                    <p className={cn("mt-1 font-medium", diffColor)}>
                        {difference >= 0 ? 'Surplus: ' : 'Deficit: '} {formatCurrency(Math.abs(difference))}
                    </p>
                </div>
            );
        }
        return null; // Return null if tooltip is not active
    };
    // --- End Custom Tooltip Component ---


    // --- Manually define Legend Payload ---
    // This ensures the legend colors match the bar colors explicitly
    const legendPayload = [
        { value: 'Income', type: 'square', id: 'id-income', color: INCOME_COLOR },
        { value: 'Expenses', type: 'square', id: 'id-expenses', color: EXPENSE_COLOR },
    ];
    // --- End Legend Payload ---

    // --- Render Chart ---
    return (
        // Container div for the entire chart section including title and summary text
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4 pt-10"> {/* Padding top for title */}
            {/* Chart Title */}
            <h3 className="text-lg font-semibold text-white absolute top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                Estimated Monthly Cash Flow
            </h3>
            {/* Recharts Responsive Container - ensures chart fills available space */}
            <ResponsiveContainer width="100%" height="85%"> 
                <BarChart
                    data={chartData.data} // The single data object in an array
                    margin={{ top: 5, right: 100, left: 50, bottom: 25 }} // Margins around the chart plot area
                    barCategoryGap="30%" // Gap between bars (relevant if more categories existed)
                    layout="vertical" // Bars drawn horizontally
                >
                    {/* Grid Lines */}
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} horizontal={true}/>

                    {/* X Axis (Value Axis for vertical layout) */}
                    <XAxis
                        type="number"
                        tickFormatter={formatAxisTick} // Format ticks as L/Cr
                        tick={{ fontSize: 10, fill: TEXT_COLOR_MUTED }} // Tick text style
                        axisLine={false} // Hide axis line
                        tickLine={{ stroke: GRID_COLOR }} // Style tick lines
                        domain={[0, 'dataMax + 10000']} // Set value domain (0 to slightly above max value)
                        allowDecimals={false} // No decimals on axis
                    />
                    {/* Y Axis (Category Axis for vertical layout) */}
                    <YAxis
                        type="category"
                        dataKey="name" // Corresponds to 'Monthly Flow' in data
                        tickLine={false} // Hide tick lines
                        axisLine={false} // Hide axis line
                        tick={false} // Hide the category label ("Monthly Flow")
                        width={10} // Minimal width
                    />
                    {/* Tooltip on Hover */}
                    <Tooltip
                        cursor={{ fill: 'rgba(150, 150, 150, 0.1)' }} // Hover background color
                        content={<CustomTooltip />} // Use the custom styled tooltip
                    />
                    {/* Legend */}
                    <Legend
                        iconType="square" iconSize={10} // Style legend markers
                        verticalAlign="bottom" // Position legend below chart
                        wrapperStyle={{ fontSize: '11px', color: TEXT_COLOR_LIGHT, paddingTop: '15px' }} // Style legend text and spacing
                        payload={[
                            { value: 'Income', type: 'square' as const, id: 'id-income', color: INCOME_COLOR },
                            { value: 'Expenses', type: 'square' as const, id: 'id-expenses', color: EXPENSE_COLOR },
                        ]}
                    />
                    {/* Income Bar */}
                    <Bar dataKey="Income" radius={[0, 4, 4, 0]} minPointSize={3}>
                         {/* Label inside the bar */}
                         <LabelList dataKey="Income" position="insideRight" fill="#ffffff" fontSize={10} formatter={formatCurrency} offset={5}/>
                         {/* Use Cell to explicitly set fill color */}
                         <Cell fill={INCOME_COLOR} />
                    </Bar>
                    {/* Expenses Bar */}
                    <Bar dataKey="Expenses" radius={[0, 4, 4, 0]} minPointSize={3}>
                         {/* Label inside the bar */}
                         <LabelList dataKey="Expenses" position="insideRight" fill="#ffffff" fontSize={10} formatter={formatCurrency} offset={5}/>
                         {/* Use Cell to explicitly set fill color */}
                         <Cell fill={EXPENSE_COLOR} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            {/* Display Surplus/Deficit Text Below Chart */}
             <div className="mt-2 text-center absolute bottom-2 left-1/2 -translate-x-1/2">
                 <p className="text-xs text-neutral-400">
                     Estimated Monthly {chartData.difference >= 0 ? 'Surplus' : 'Deficit'}:
                 </p>
                 {/* Use dynamic color for the value */}
                 <p className={cn("text-lg font-semibold", differenceColor)}>
                      {formatCurrency(Math.abs(chartData.difference))}
                 </p>
             </div>
        </div>
    );
};

export default IncomeExpenseBarChart;