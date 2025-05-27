// src/components/calculators/CompoundInterestCalculator.tsx
"use client";
import React, { useState, useMemo } from 'react';
import { CalculatorInputRow } from './CalculatorInputRow';
import { CalculatorResultDisplay } from './CalculatorResultDisplay';
import DonutChart from '../charts/DonutChart';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button'; // Assuming you have this
import { Label } from '../ui/label'; // For select label
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Assuming you have a Select component

export default function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState<string>("100000"); // Initial investment
  const [rate, setRate] = useState<string>("10"); // Annual interest rate
  const [timePeriod, setTimePeriod] = useState<string>("5"); // Years
  const [compoundingFrequency, setCompoundingFrequency] = useState<string>("12"); // Monthly = 12, Quarterly = 4, Half-Yearly = 2, Annually = 1

  const calculateCompoundInterest = () => {
    const P = parseFloat(principal);
    const r = parseFloat(rate) / 100; // Annual interest rate decimal
    const t = parseFloat(timePeriod); // Time in years
    const n = parseInt(compoundingFrequency); // Number of times interest applied per time period

    if (isNaN(P) || isNaN(r) || isNaN(t) || isNaN(n) || P <= 0 || t <= 0 || n <= 0) {
      return { investedAmount: 0, estimatedReturns: 0, totalValue: 0 };
    }

    // Formula: A = P * (1 + r/n)^(n*t)
    const totalValue = P * Math.pow(1 + (r / n), n * t);
    const investedAmount = P;
    const estimatedReturns = totalValue - investedAmount;

    return {
      investedAmount: Math.round(investedAmount),
      estimatedReturns: Math.round(estimatedReturns),
      totalValue: Math.round(totalValue),
    };
  };

  const results = useMemo(calculateCompoundInterest, [principal, rate, timePeriod, compoundingFrequency, calculateCompoundInterest]);

  const chartData = [
    { name: 'Principal Amount', value: results.investedAmount, color: '#60a5fa' }, // Blue-400
    { name: 'Total Interest', value: results.estimatedReturns > 0 ? results.estimatedReturns : 0, color: '#8b5cf6' }, // Violet-500
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
      {/* Inputs Column */}
      <div className="md:col-span-1 space-y-3">
        <h2 className="text-xl font-semibold text-white mb-4">Compound Interest Calculator</h2>
        <CalculatorInputRow label="Principal Amount" id="principalCompound" unit="₹" type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="e.g., 100000" />
        <CalculatorInputRow label="Annual Interest Rate" id="rateCompound" unit="%" type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="e.g., 10" step="0.1" />
        <CalculatorInputRow label="Time Period" id="timePeriodCompound" unit="Years" type="number" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} placeholder="e.g., 5" />
        {/* Compounding Frequency Dropdown */}
        <div className="mb-4">
            <Label htmlFor="compoundingFrequency" className="text-sm font-medium text-neutral-300 block mb-1.5">Compounding Frequency</Label>
            <Select value={compoundingFrequency} onValueChange={(value) => setCompoundingFrequency(value)}>
                <SelectTrigger id="compoundingFrequency" className="w-full bg-neutral-800 border-neutral-700 h-10 text-sm">
                    <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
                    <SelectItem value="12">Monthly</SelectItem>
                    <SelectItem value="4">Quarterly</SelectItem>
                    <SelectItem value="2">Half-Yearly</SelectItem>
                    <SelectItem value="1">Annually</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      {/* Results and Chart Column */}
      <div className="md:col-span-2 flex flex-col md:flex-row gap-6 items-center">
        {/* Donut Chart */}
        <div className="w-full md:w-1/2 h-64 md:h-72 flex-shrink-0">
          <DonutChart data={chartData} title="Growth Details"/>
        </div>
        {/* Result Display */}
        <div className="w-full md:w-1/2">
          <CalculatorResultDisplay
            results={[
              { label: 'Principal Amount', value: results.investedAmount },
              { label: 'Total Interest Earned', value: results.estimatedReturns },
              { label: 'Total Value', value: results.totalValue, isTotal: true },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
