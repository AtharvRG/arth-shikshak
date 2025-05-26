// src/components/calculators/FixedDepositCalculator.tsx
"use client";
import React, { useState, useMemo } from 'react';
import { CalculatorInputRow } from './CalculatorInputRow';
import { CalculatorResultDisplay } from './CalculatorResultDisplay';
import DonutChart from '../charts/DonutChart';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function FixedDepositCalculator() {
  const [principal, setPrincipal] = useState<string>("100000"); // Amount deposited
  const [rate, setRate] = useState<string>("7"); // Annual interest rate
  const [timePeriod, setTimePeriod] = useState<string>("5"); // Years
  // Compounding frequency is crucial for FDs
  const [compoundingFrequency, setCompoundingFrequency] = useState<string>("4"); // Quarterly = 4

  const calculateFD = () => {
    const P = parseFloat(principal);
    const r = parseFloat(rate) / 100; // Annual interest rate decimal
    const t = parseFloat(timePeriod); // Time in years
    const n = parseInt(compoundingFrequency); // Compounding periods per year

    if (isNaN(P) || isNaN(r) || isNaN(t) || isNaN(n) || P <= 0 || t <= 0 || n <= 0) {
      return { principalAmount: 0, estimatedInterest: 0, maturityValue: 0 };
    }

    // Formula: A = P * (1 + r/n)^(n*t)
    const maturityValue = P * Math.pow(1 + (r / n), n * t);
    const principalAmount = P;
    const estimatedInterest = maturityValue - principalAmount;

    return {
      principalAmount: Math.round(principalAmount),
      estimatedInterest: Math.round(estimatedInterest),
      maturityValue: Math.round(maturityValue),
    };
  };

  const results = useMemo(() => calculateFD(), [principal, rate, timePeriod, compoundingFrequency]);

  const chartData = [
    { name: 'Principal Amount', value: results.principalAmount, color: '#60a5fa' }, // Blue-400
    { name: 'Total Interest Earned', value: results.estimatedInterest > 0 ? results.estimatedInterest : 0, color: '#facc15' }, // Yellow-400
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
      {/* Inputs Column */}
      <div className="md:col-span-1 space-y-3">
        <h2 className="text-xl font-semibold text-white mb-4">Fixed Deposit (FD) Calculator</h2>
        <CalculatorInputRow label="Principal Amount" id="principalFd" unit="₹" type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="e.g., 100000" />
        <CalculatorInputRow label="Annual Interest Rate" id="rateFd" unit="%" type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="e.g., 7" step="0.1" />
        <CalculatorInputRow label="Time Period" id="timePeriodFd" unit="Years" type="number" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} placeholder="e.g., 5" />
        <div className="mb-4">
            <Label htmlFor="compoundingFrequencyFd" className="text-sm font-medium text-neutral-300 block mb-1.5">Compounding Frequency</Label>
            <Select value={compoundingFrequency} onValueChange={(value) => setCompoundingFrequency(value)}>
                <SelectTrigger id="compoundingFrequencyFd" className="w-full bg-neutral-800 border-neutral-700 h-10 text-sm">
                    <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
                    <SelectItem value="1">Annually</SelectItem>
                    <SelectItem value="2">Half-Yearly</SelectItem>
                    <SelectItem value="4">Quarterly</SelectItem>
                    <SelectItem value="12">Monthly (Rare for FDs, more for RD)</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      {/* Results and Chart Column */}
      <div className="md:col-span-2 flex flex-col md:flex-row gap-6 items-center">
        {/* Donut Chart */}
        <div className="w-full md:w-1/2 h-64 md:h-72 flex-shrink-0">
          <DonutChart data={chartData} title="FD Maturity"/>
        </div>
        {/* Result Display */}
        <div className="w-full md:w-1/2">
          <CalculatorResultDisplay
            results={[
              { label: 'Principal Amount', value: results.principalAmount },
              { label: 'Total Interest Earned', value: results.estimatedInterest },
              { label: 'Maturity Value', value: results.maturityValue, isTotal: true },
            ]}
          />
        </div>
      </div>
    </div>
  );
}