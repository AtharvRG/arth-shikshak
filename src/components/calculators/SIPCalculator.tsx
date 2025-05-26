// src/components/calculators/SIPCalculator.tsx
"use client";
import React, { useState, useMemo } from 'react';
import { CalculatorInputRow } from './CalculatorInputRow';
import { CalculatorResultDisplay } from './CalculatorResultDisplay';
import DonutChart from '../charts/DonutChart';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button'; // Assuming you have this

export default function SIPCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState<string>("10000");
  const [expectedReturnRate, setExpectedReturnRate] = useState<string>("12"); // Annual rate
  const [timePeriod, setTimePeriod] = useState<string>("10"); // Years

  const calculateSIP = () => {
    const P = parseFloat(monthlyInvestment); // Monthly investment
    const i = parseFloat(expectedReturnRate) / 100 / 12; // Monthly interest rate
    const n = parseFloat(timePeriod) * 12; // Total number of months

    if (isNaN(P) || isNaN(i) || isNaN(n) || P <= 0 || n <= 0) {
      // Note: i can be 0 for 0% return rate
      return { investedAmount: 0, estimatedReturns: 0, totalValue: 0 };
    }

    // Future Value of a series: M = P * ({[1 + i]^n – 1} / i) * (1 + i)
    // Simpler formula if interest rate i is not 0:
    const totalValue = (i === 0)
        ? P * n // No returns, just sum of investments
        : P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);

    const investedAmount = P * n;
    const estimatedReturns = totalValue - investedAmount;

    return {
      investedAmount: Math.round(investedAmount),
      estimatedReturns: Math.round(estimatedReturns),
      totalValue: Math.round(totalValue),
    };
  };

  const results = useMemo(() => calculateSIP(), [monthlyInvestment, expectedReturnRate, timePeriod]);

  const chartData = [
    { name: 'Invested Amount', value: results.investedAmount, color: '#60a5fa' }, // Blue-400
    { name: 'Est. Returns', value: results.estimatedReturns > 0 ? results.estimatedReturns : 0, color: '#22c55e' }, // Green-500 (ensure non-negative for chart)
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
      {/* Inputs Column */}
      <div className="md:col-span-1 space-y-3">
        <h2 className="text-xl font-semibold text-white mb-4">SIP Calculator</h2>
        <CalculatorInputRow label="Monthly Investment" id="monthlyInvestmentSip" unit="₹" type="number" value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(e.target.value)} placeholder="e.g., 10000" />
        <CalculatorInputRow label="Expected Return Rate (p.a)" id="returnRateSip" unit="%" type="number" value={expectedReturnRate} onChange={(e) => setExpectedReturnRate(e.target.value)} placeholder="e.g., 12" step="0.1" />
        <CalculatorInputRow label="Time Period" id="timePeriodSip" unit="Years" type="number" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} placeholder="e.g., 10" />
      </div>

      {/* Results and Chart Column */}
      <div className="md:col-span-2 flex flex-col md:flex-row gap-6 items-center">
        {/* Donut Chart */}
        <div className="w-full md:w-1/2 h-64 md:h-72 flex-shrink-0">
          <DonutChart data={chartData} title="Wealth Gain"/>
        </div>
        {/* Result Display */}
        <div className="w-full md:w-1/2">
          <CalculatorResultDisplay
            results={[
              { label: 'Invested Amount', value: results.investedAmount },
              { label: 'Est. Returns', value: results.estimatedReturns },
              { label: 'Total Value', value: results.totalValue, isTotal: true },
            ]}
          />
        </div>
      </div>
    </div>
  );
}