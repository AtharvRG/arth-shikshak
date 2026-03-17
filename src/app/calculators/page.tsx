// src/app/calculators/page.tsx
"use client";

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { cn } from '@/lib/utils';
import { FiBarChart2, FiPercent, FiTrendingUp, FiRepeat, FiShield, FiHome, FiTarget, FiBriefcase, FiDollarSign, FiArchive, FiUmbrella, FiLink, FiDisc } from 'react-icons/fi'; // Added more icons

// Import individual calculator components
import EMICalculator from '@/components/calculators/EMICalculator';
import SIPCalculator from '@/components/calculators/SIPCalculator';
import LumpsumCalculator from '@/components/calculators/LumpsumCalculator';
import CompoundInterestCalculator from '@/components/calculators/CompoundInterestCalculator';
import SavingsGoalCalculator from '@/components/calculators/SavingsGoalCalculator';
import FixedDepositCalculator from '@/components/calculators/FixedDepositCalculator';
// Import other calculator components as they are built
// import NetWorthCalculator from '@/components/calculators/NetWorthCalculator';
// import EmergencyFundCalculator from '@/components/calculators/EmergencyFundCalculator';
// import CAGRCalculator from '@/components/calculators/CAGRCalculator';

type CalculatorType =
  | "emi" | "sip" | "lumpsum" | "compound" | "savingsGoal"
  | "fd" | "netWorth" | "emergencyFund" | "cagr";

interface CalculatorInfo {
  id: CalculatorType;
  name: string;
  icon: React.ElementType;
  component: React.ElementType;
}

// Updated list of calculators
const calculators: CalculatorInfo[] = [
  { id: "emi", name: "EMI", icon: FiHome, component: EMICalculator },
  { id: "sip", name: "SIP", icon: FiRepeat, component: SIPCalculator },
  { id: "lumpsum", name: "Lump Sum", icon: FiDollarSign, component: LumpsumCalculator },
  { id: "compound", name: "Compound Interest", icon: FiTrendingUp, component: CompoundInterestCalculator },
  { id: "savingsGoal", name: "Savings Goal", icon: FiDisc, component: SavingsGoalCalculator },
  { id: "fd", name: "Fixed Deposit (FD)", icon: FiArchive, component: FixedDepositCalculator },
  // Add NetWorth, EmergencyFund, CAGR when components are ready
];

export default function CalculatorsPage() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>(calculators[0].id);

  const ActiveCalculatorComponent = calculators.find(calc => calc.id === activeCalculator)?.component;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Navbar />
      <main className="flex-1 p-4 md:p-6 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-100 mb-6 md:mb-8 flex items-center gap-2">
            <FiBriefcase className="w-8 h-8 text-blue-400"/> Financial Calculators
          </h1>

          {/* --- Tab Navigation - Revamped Styling --- */}
          <div className="mb-8 border-b border-neutral-800"> {/* Bottom border for the tab container */}
            <div className="flex flex-wrap -mb-px gap-x-2 sm:gap-x-3 md:gap-x-4" role="tablist" aria-orientation="horizontal">
                {calculators.map((calc) => (
                <button
                    key={calc.id}
                    onClick={() => setActiveCalculator(calc.id)}
                    role="tab"
                    aria-selected={activeCalculator === calc.id}
                    aria-controls={`calculator-panel-${calc.id}`} // For accessibility
                    id={`calculator-tab-${calc.id}`}
                    className={cn(
                        "flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-150 ease-in-out",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black", // Focus style
                        activeCalculator === calc.id
                            ? "border-x border-t border-neutral-700 bg-neutral-900 text-blue-400 shadow-inner" // Active tab style
                            : "text-neutral-400 border border-transparent hover:bg-neutral-800/70 hover:text-neutral-100" // Inactive tab style
                    )}
                >
                    <calc.icon className="w-4 h-4 shrink-0" />
                    {calc.name}
                </button>
                ))}
                {/* Placeholder for future tabs */}
                <div className="px-3 py-2.5 text-sm font-medium text-neutral-600 italic flex items-center">
                    (More coming soon...)
                </div>
            </div>
          </div>
          {/* --- End Tab Navigation --- */}


          {/* Render Active Calculator Content */}
          {/* Added role="tabpanel" and aria-labelledby for accessibility */}
          <div
            id={`calculator-panel-${activeCalculator}`}
            role="tabpanel"
            aria-labelledby={`calculator-tab-${activeCalculator}`}
            className="bg-neutral-900 border border-neutral-800/60 rounded-xl shadow-xl p-6 md:p-8 min-h-[500px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black" // Consistent card styling
            tabIndex={0} // Make it focusable
          >
            {ActiveCalculatorComponent ? (
              <ActiveCalculatorComponent />
            ) : (
              // This case should ideally not be reached if activeCalculator is always valid
              <p className="text-center text-neutral-500">Select a calculator to get started.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}