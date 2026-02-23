// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const safeParseFloat = (value: any): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

// Helper to format numbers in Indian currency format (without symbol)
export const formatNumberIndian = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  // Convert to string and remove existing commas for parsing
  const numStr = String(value).replace(/,/g, '');
  const num = parseFloat(numStr);

  if (isNaN(num)) {
    return String(value); // Return original if not a valid number part
  }

  // Use Intl.NumberFormat for Indian formatting
  // Specify maximumFractionDigits: 0 to avoid decimals for now
  return num.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    useGrouping: true,
  });
};


export const formatCurrencyDisplay = (value: string | number | null | undefined, currency = 'INR'): string => {
    const num = Number(value);
    if (isNaN(num) || value === '' || value === null || value === undefined) return '-'; // Use dash for empty/invalid

    // Use Intl.NumberFormat for robust currency formatting
    try {
      // Adjust options as needed (e.g., minimumFractionDigits)
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0, // No decimals for INR usually
        maximumFractionDigits: 0
      }).format(num);
    } catch (e) {
        // Fallback for invalid currency code or other errors
        console.error("Currency formatting error:", e);
        return `₹ ${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    }
};