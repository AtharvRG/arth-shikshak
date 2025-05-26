// src/components/calculators/CalculatorInputRow.tsx
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input, InputProps } from '@/components/ui/input'; // Assuming your Input component
import { cn } from '@/lib/utils';

interface CalculatorInputRowProps extends InputProps {
  label: string;
  id: string;
  unit?: string; // e.g., "₹", "%", "Years"
}

export const CalculatorInputRow: React.FC<CalculatorInputRowProps> = ({ label, id, unit, className, ...inputProps }) => {
  return (
    <div className={cn("mb-4", className)}>
      <Label htmlFor={id} className="text-sm font-medium text-neutral-300 block mb-1.5">
        {label} {unit && `(${unit})`}
      </Label>
      <Input
        id={id}
        className="bg-neutral-800 border-neutral-700 h-10 text-sm placeholder:text-neutral-500"
        {...inputProps}
      />
    </div>
  );
};

