// src/components/calculators/CalculatorResultDisplay.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface CalculatorResultDisplayProps {
  results: { label: string; value: string | number; isTotal?: boolean; className?: string }[];
  className?: string;
}

export const CalculatorResultDisplay: React.FC<CalculatorResultDisplayProps> = ({ results, className }) => {
  return (
    <div className={cn("mt-6 pt-6 border-t border-neutral-700/70 space-y-2 text-sm", className)}>
      {results.map((result, index) => (
        <div key={index} className={cn("flex justify-between items-center", result.className)}>
          <span className={cn("text-neutral-400", result.isTotal && "font-semibold text-neutral-200")}>
            {result.label}:
          </span>
          <span className={cn("font-medium text-neutral-100", result.isTotal && "text-xl text-blue-400")}>
            {typeof result.value === 'number' ? `₹ ${result.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : result.value}
          </span>
        </div>
      ))}
    </div>
  );
};