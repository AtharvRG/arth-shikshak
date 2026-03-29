// src/components/snapshot/SnapshotClientContent.tsx
"use client";

import React from 'react';
import { User as CustomUserType } from '@/models/User'; // Use type for props
import { FocusCards } from '@/components/ui/focus-cards'; // Import FocusCards component
import { FiDollarSign, FiTrendingUp, FiActivity, FiGrid } from 'react-icons/fi'; // Icons
import { cn } from '@/lib/utils'; // Class name utility
import { FocusEffectProvider, useFocusEffect } from '@/context/FocusEffectContext'; // Context for blur toggle
import { Checkbox } from "@/components/ui/checkbox"; // Checkbox component
import { Label } from "@/components/ui/label"; // Label component

// Chart Imports (These must also be Client Components)
import ExpenseBreakdownPie from '@/components/charts/ExpenseBreakdownPie';
import DebtInvestmentComparisonBar from '@/components/charts/DebtInvestmentComparisonBar';
import IncomeExpenseBarChart from '@/components/charts/IncomeExpenseBarChart';

// --- Helper Components for Card Content (Defined within or imported) ---
const InfoCardContent = ({ title, value, icon: Icon, unit = "INR" }: { title: string; value: number | string | null | undefined; icon: React.ElementType; unit?: string; }) => {
    const displayValue = (value === null || value === undefined || value === '') ? 'N/A' : `${typeof value === 'number' ? value.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : value} ${unit}`;
    return ( <div className="flex flex-col justify-between h-full text-white p-5 md:p-6"> <div> <Icon className="w-7 h-7 text-neutral-400 mb-3" /> <h3 className="text-sm font-medium text-neutral-200 uppercase tracking-wider">{title}</h3> </div> <p className="text-3xl lg:text-4xl font-bold mt-3">{displayValue}</p> </div> );
};
const HealthScoreContent = ({ score }: { score: number }) => {
     const scoreColor = cn( score > 75 ? "text-green-400" : score > 50 ? "text-yellow-400" : "text-red-400" );
     return ( <div className="flex flex-col justify-between h-full text-white p-5 md:p-6"> <div> <FiActivity className="w-7 h-7 text-neutral-400 mb-3" /> <h3 className="text-sm font-medium text-neutral-200 uppercase tracking-wider">Financial Health</h3> </div> <p className={cn("text-5xl lg:text-6xl font-bold mt-2", scoreColor)}> {score}<span className="text-2xl text-neutral-400">/100</span> </p> </div> );
};
const ChartCardContent = ({ title, children }: { title: string, children: React.ReactNode }) => {
    return ( <div className="flex flex-col h-full w-full p-4 md:p-6 text-white"> {title && <h3 className="text-base md:text-lg font-semibold mb-3 text-center flex-shrink-0 pt-2 px-2">{title}</h3>} <div className="w-full flex-1 min-h-0 px-1 pb-1"> {children} </div> </div> );
};
// --- End Helper Components ---

// Props for the client page content component
interface SnapshotClientContentProps {
    userData: Partial<CustomUserType>; // Receive potentially partial, serialized user data
}

// --- Internal Component using the Context ---
function SnapshotDisplay({ userData }: SnapshotClientContentProps) {
    // Get blur state and setter from context
    const { isBlurEnabled, setIsBlurEnabled } = useFocusEffect();

    // Perform calculations based on received userData
    const totalMonthlyExpenses = userData.expenses?.map(exp => Number(exp.amount) || 0).reduce((sum, amount) => sum + amount, 0) ?? 0;
    const totalDebt = userData.debts?.map(debt => Number(debt.amount) || 0).reduce((sum, amount) => sum + amount, 0) ?? 0;
    const totalInvestments = userData.investments?.map(inv => Number(inv.amount) || 0).reduce((sum, amount) => sum + amount, 0) ?? 0;
    const safeAnnualSalary = Number(userData.annualSalary ?? 0);
    const calculateHealthScore = (): number => { /* ... calculation logic ... */ let score=50; const s=safeAnnualSalary; if(s>0){const r=(s-(totalMonthlyExpenses*12))/s; if(r>0.25)score+=25; else if(r>0.15)score+=15; else if(r>0.05)score+=5; else if(r<=0)score-=15;}else{score-=10;} if(totalInvestments>totalDebt&&totalDebt>0)score+=15; else if(totalInvestments>totalDebt*0.5&&totalDebt>0)score+=5; if(totalDebt===0&&totalInvestments>0)score+=20; else if(s>0&&totalDebt>s*0.6)score-=15; return Math.max(0,Math.min(100,Math.round(score))); };
    const healthScore = calculateHealthScore();

    // Prepare data array for FocusCards
    const snapshotCards = [
        { title: "Annual Salary", src: "/noise.webp", className: "md:col-span-1", content: <InfoCardContent title="Annual Salary" value={userData.annualSalary} icon={FiDollarSign} unit="INR" /> },
        { title: "Monthly Spending", src: "/noise.webp", className: "md:col-span-1", content: <InfoCardContent title="Avg. Monthly Spending" value={totalMonthlyExpenses} icon={FiTrendingUp} unit="INR" /> },
        { title: "Financial Health", src: "/noise.webp", className: "md:col-span-1", content: <HealthScoreContent score={healthScore} /> },
        { title: "Expense Breakdown", src: "/noise.webp", className: "md:col-span-2 !h-[400px] lg:!h-[420px]", content: <ChartCardContent title="Monthly Expense Breakdown"><ExpenseBreakdownPie expenses={userData.expenses} /></ChartCardContent> },
        { title: "Debt vs. Investments", src: "/noise.webp", className: "md:col-span-1 !h-[400px] lg:!h-[420px]", content: <ChartCardContent title="Debt vs. Investments"><DebtInvestmentComparisonBar debts={userData.debts} investments={userData.investments} /></ChartCardContent> },
        { title: "Monthly Cash Flow", src: "/noise.webp", className: "md:col-span-3 !h-[300px] lg:!h-[320px]", content: <ChartCardContent title=""><IncomeExpenseBarChart annualSalary={safeAnnualSalary} totalMonthlyExpenses={totalMonthlyExpenses}/></ChartCardContent> },
    ];

    return (
        // Main content area within the layout
        <main className="flex-1 p-4 md:p-6 lg:p-10">
            {/* Header Row with Title and Toggle */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6 md:mb-8">
                <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2"><FiGrid/>Financial Snapshot</h1>
                {/* Blur Toggle Checkbox */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                    <Checkbox
                        id="blur-toggle-snapshot" // Unique ID
                        checked={isBlurEnabled}
                        // Update context state when checkbox changes
                        onCheckedChange={(checked) => setIsBlurEnabled(Boolean(checked))}
                        aria-labelledby="blur-toggle-label-snapshot"
                    />
                    <Label
                        id="blur-toggle-label-snapshot"
                        htmlFor="blur-toggle-snapshot"
                        className="text-xs text-neutral-400 cursor-pointer select-none"
                    >
                        Enable Focus Effect
                    </Label>
                </div>
            </div>

            {/* Render FocusCards Grid */}
            <FocusCards cards={snapshotCards} />
        </main>
    );
}

// Main Exported Component: Wraps the display component with the Context Provider
export default function SnapshotClientContent(props: SnapshotClientContentProps) {
    return (
        <FocusEffectProvider> {/* Provide the context */}
            <SnapshotDisplay {...props} /> {/* Render the content that uses the context */}
        </FocusEffectProvider>
    );
}