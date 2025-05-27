// src/components/calculators/LumpsumCalculator.tsx
"use client";
import React, { useState, useMemo } from 'react';
import { CalculatorInputRow } from './CalculatorInputRow';
import { CalculatorResultDisplay } from './CalculatorResultDisplay';
import DonutChart from '../charts/DonutChart';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button'; // Assuming you have this

export default function LumpsumCalculator() {
  const [totalInvestment, setTotalInvestment] = useState<string>("100000"); // e.g., 1 Lakh
  const [expectedReturnRate, setExpectedReturnRate] = useState<string>("12"); // Annual rate
  const [timePeriod, setTimePeriod] = useState<string>("10"); // Years

  const calculateLumpsum = () => {
    const P = parseFloat(totalInvestment); // Principal investment
    const r = parseFloat(expectedReturnRate) / 100; // Annual interest rate decimal
    const t = parseFloat(timePeriod); // Time in years

    // For annual compounding: A = P * (1 + r)^t
    // For more frequent compounding (e.g., monthly, n=12): A = P * (1 + r/n)^(n*t)
    // Assuming annual compounding for simplicity here.
    if (isNaN(P) || isNaN(r) || isNaN(t) || P <= 0 || t <= 0) {
       // Note: r (rate) can be 0
      return { investedAmount: 0, estimatedReturns: 0, totalValue: 0 };
    }

    const totalValue = P * Math.pow(1 + r, t);
    const investedAmount = P;
    const estimatedReturns = totalValue - investedAmount;

    return {
      investedAmount: Math.round(investedAmount),
      estimatedReturns: Math.round(estimatedReturns),
      totalValue: Math.round(totalValue),
    };
  };

  const results = calculateLumpsum();

  const chartData = [
    { name: 'Invested Amount', value: results.investedAmount, color: '#60a5fa' }, // Blue-400
    { name: 'Est. Returns', value: results.estimatedReturns > 0 ? results.estimatedReturns : 0, color: '#a78bfa' }, // Purple-400
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
      {/* Inputs Column */}
      <div className="md:col-span-1 space-y-3">
        <h2 className="text-xl font-semibold text-white mb-4">Lump Sum Calculator</h2>
        <CalculatorInputRow label="Total Investment" id="totalInvestmentLumpsum" unit="₹" type="number" value={totalInvestment} onChange={(e) => setTotalInvestment(e.target.value)} placeholder="e.g., 100000" />
        <CalculatorInputRow label="Expected Return Rate (p.a)" id="returnRateLumpsum" unit="%" type="number" value={expectedReturnRate} onChange={(e) => setExpectedReturnRate(e.target.value)} placeholder="e.g., 12" step="0.1" />
        <CalculatorInputRow label="Time Period" id="timePeriodLumpsum" unit="Years" type="number" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} placeholder="e.g., 10" />
      </div>

      {/* Results and Chart Column */}
      <div className="md:col-span-2 flex flex-col md:flex-row gap-6 items-center">
        {/* Donut Chart */}
        <div className="w-full md:w-1/2 h-64 md:h-72 flex-shrink-0">
          <DonutChart data={chartData} title="Investment Growth"/>
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