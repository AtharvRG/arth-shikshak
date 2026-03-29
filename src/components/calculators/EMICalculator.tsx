// src/components/calculators/EMICalculator.tsx
"use client";
import React, { useState, useMemo } from 'react';
import { CalculatorInputRow } from './CalculatorInputRow';
import { CalculatorResultDisplay } from './CalculatorResultDisplay';
import DonutChart from '../charts/DonutChart'; // Import DonutChart
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

export default function EMICalculator() {
  const [principal, setPrincipal] = useState<string>("1000000"); // e.g., 10 Lakhs
  const [rate, setRate] = useState<string>("8.5"); // e.g., 8.5%
  const [tenure, setTenure] = useState<string>("20"); // e.g., 20 Years

  const calculateEMI = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 12 / 100; // Monthly interest rate
    const n = parseFloat(tenure) * 12; // Total number of months

    if (isNaN(p) || isNaN(r) || isNaN(n) || p <= 0 || r <= 0 || n <= 0) {
      return { emi: 0, totalInterest: 0, totalAmount: 0, principal: 0 };
    }

    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalAmount = emi * n;
    const totalInterest = totalAmount - p;

    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalAmount: Math.round(totalAmount),
      principal: p
    };
  };

  const results = useMemo(calculateEMI, [principal, rate, tenure, calculateEMI]);

  const chartData = [
    { name: 'Principal Amount', value: results.principal, color: '#60a5fa' }, // Blue-400
    { name: 'Total Interest', value: results.totalInterest, color: '#f87171' }, // Red-400
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
      {/* Inputs Column */}
      <div className="md:col-span-1 space-y-3">
        <h2 className="text-xl font-semibold text-white mb-4">EMI Calculator</h2>
        <CalculatorInputRow label="Loan Amount" id="principal" unit="₹" type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="e.g., 1000000" />
        <CalculatorInputRow label="Interest Rate (p.a)" id="rate" unit="%" type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="e.g., 8.5" step="0.1" />
        <CalculatorInputRow label="Time Period" id="tenure" unit="Years" type="number" value={tenure} onChange={(e) => setTenure(e.target.value)} placeholder="e.g., 20" />
      </div>

      {/* Results and Chart Column */}
      <div className="md:col-span-2 flex flex-col md:flex-row gap-6 items-center">
        {/* Donut Chart */}
        <div className="w-full md:w-1/2 h-64 md:h-72 flex-shrink-0">
          <DonutChart data={chartData} />
        </div>
        {/* Result Display */}
        <div className="w-full md:w-1/2">
          <CalculatorResultDisplay
            results={[
              { label: 'Monthly EMI', value: results.emi, className: "!text-blue-400 !text-lg" },
              { label: 'Principal Amount', value: results.principal },
              { label: 'Total Interest Payable', value: results.totalInterest },
              { label: 'Total Amount Payable', value: results.totalAmount, isTotal: true },
            ]}
          />
        </div>
      </div>
    </div>
  );
}