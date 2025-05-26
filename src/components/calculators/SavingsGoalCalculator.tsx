// src/components/calculators/SavingsGoalCalculator.tsx
"use client";
import React, { useState, useMemo } from 'react';
import { CalculatorInputRow } from './CalculatorInputRow';
import { CalculatorResultDisplay } from './CalculatorResultDisplay';
import DonutChart from '../charts/DonutChart'; // Or a different chart type if more suitable
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

export default function SavingsGoalCalculator() {
  const [targetAmount, setTargetAmount] = useState<string>("500000"); // e.g., 5 Lakhs
  const [initialSavings, setInitialSavings] = useState<string>("50000"); // e.g., 50k
  const [timePeriod, setTimePeriod] = useState<string>("5"); // Years
  const [expectedReturnRate, setExpectedReturnRate] = useState<string>("8"); // p.a. on investments

  const calculateSavingsGoal = () => {
    const F = parseFloat(targetAmount);        // Future value (target amount)
    const P = parseFloat(initialSavings);      // Present value (initial savings)
    const t = parseFloat(timePeriod);          // Years
    const r = parseFloat(expectedReturnRate) / 100; // Annual return rate decimal

    if (isNaN(F) || F <= 0 || isNaN(t) || t <= 0) {
      return { monthlyInvestmentNeeded: 0, totalInvested: 0, totalReturns: 0, targetAmount: 0, initialSavings:0 };
    }
    const n = 12; // Assuming monthly contributions and compounding for returns

    // If initial savings P meet or exceed target F, no monthly investment needed
    if ( P >= F && t > 0 ) { // if t is 0 or less it will result in NaN or Infinity for monthlyInvestmentNeeded
        return { monthlyInvestmentNeeded: 0, totalInvested: P, totalReturns: 0, targetAmount: F, initialSavings: P};
    }
    if ( t <= 0 && P < F) { // If no time and initial savings are less than target
        return { monthlyInvestmentNeeded: F-P, totalInvested: P+(F-P), totalReturns: 0, targetAmount: F, initialSavings: P};
    }


    // Monthly investment (PMT) needed:
    // PMT = [F - P * (1 + r/n)^(n*t)] * [(r/n) / ((1 + r/n)^(n*t) - 1)]
    // If r = 0 (0% return): PMT = (F - P) / (n*t)

    let monthlyInvestmentNeeded: number;
    const nt = n * t;

    if (r === 0) {
        monthlyInvestmentNeeded = (F - P) / nt;
    } else {
        const ratePerPeriod = r / n;
        const futureValueOfP = P * Math.pow(1 + ratePerPeriod, nt);
        if (futureValueOfP >= F) { // Initial savings + growth meets target
             monthlyInvestmentNeeded = 0;
        } else {
             monthlyInvestmentNeeded = (F - futureValueOfP) * (ratePerPeriod / (Math.pow(1 + ratePerPeriod, nt) - 1));
        }
    }

    // Ensure monthlyInvestmentNeeded is not negative (if initial already covers)
    monthlyInvestmentNeeded = Math.max(0, monthlyInvestmentNeeded);

    const totalMonthlyInvestments = monthlyInvestmentNeeded * nt;
    const totalInvested = P + totalMonthlyInvestments;
    const totalReturns = F - totalInvested; // Given F is the target value

    return {
      monthlyInvestmentNeeded: Math.round(monthlyInvestmentNeeded),
      totalInvested: Math.round(totalInvested),
      totalReturns: Math.round(totalReturns),
      targetAmount: F,
      initialSavings: P
    };
  };

  const results = useMemo(() => calculateSavingsGoal(), [targetAmount, initialSavings, timePeriod, expectedReturnRate]);

  const chartData = [
    { name: 'Initial Savings', value: results.initialSavings, color: '#3b82f6' }, // Blue-500
    { name: 'Total Monthly Investments', value: results.totalInvested - results.initialSavings, color: '#60a5fa' }, // Blue-400
    { name: 'Est. Returns on Investments', value: results.totalReturns > 0 ? results.totalReturns : 0, color: '#22c55e' }, // Green-500
  ];


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
      {/* Inputs Column */}
      <div className="md:col-span-1 space-y-3">
        <h2 className="text-xl font-semibold text-white mb-4">Savings Goal Calculator</h2>
        <CalculatorInputRow label="Target Amount" id="targetAmountGoal" unit="₹" type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="e.g., 500000" />
        <CalculatorInputRow label="Initial Savings (Optional)" id="initialSavingsGoal" unit="₹" type="number" value={initialSavings} onChange={(e) => setInitialSavings(e.target.value)} placeholder="e.g., 50000" />
        <CalculatorInputRow label="Time Period" id="timePeriodGoal" unit="Years" type="number" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} placeholder="e.g., 5" />
        <CalculatorInputRow label="Expected Return Rate (p.a on SIP)" id="returnRateGoal" unit="%" type="number" value={expectedReturnRate} onChange={(e) => setExpectedReturnRate(e.target.value)} placeholder="e.g., 8" step="0.1" />
      </div>

      {/* Results and Chart Column */}
      <div className="md:col-span-2 flex flex-col md:flex-row gap-6 items-center">
        {/* Donut Chart */}
        <div className="w-full md:w-1/2 h-64 md:h-72 flex-shrink-0">
          <DonutChart data={chartData} title="Goal Funding"/>
        </div>
        {/* Result Display */}
        <div className="w-full md:w-1/2">
          <CalculatorResultDisplay
            results={[
              { label: 'Monthly Investment Needed', value: results.monthlyInvestmentNeeded, className: "!text-blue-400 !text-lg" },
              { label: 'Total Amount Invested', value: results.totalInvested },
              { label: 'Total Returns Earned', value: results.totalReturns },
              { label: 'Target Goal Amount', value: results.targetAmount, isTotal: true },
            ]}
          />
        </div>
      </div>
    </div>
  );
}