// src/context/OnboardingContext.tsx
"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the structure for dynamic fields (expenses, debts, etc.)
interface DynamicField {
  id: string; // For unique key prop during rendering
  category?: string; // Custom category name (for expenses/debts)
  type?: string; // Custom type name (for investments)
  amount: number | string; // Amount (use string initially for easier input handling)
  emi?: number | string; // Optional EMI for debts
}

// Define the shape of the onboarding data
interface OnboardingData {
  name: string;
  dob: string; // Store as string YYYY-MM-DD for input compatibility
  occupation: string;
  annualSalary: number | string; // Store as string initially
  // Expenses
  foodExpense: number | string;
  transportExpense: number | string;
  utilitiesExpense: number | string;
  customExpenses: DynamicField[];
  // Debts/Investments
  debts: DynamicField[];
  investments: DynamicField[];
}

// Define the shape of the context value
interface OnboardingContextType {
  onboardingData: OnboardingData;
  updateOnboardingData: (updates: Partial<OnboardingData>) => void;
  addCustomExpense: () => void;
  removeCustomExpense: (id: string) => void;
  updateCustomExpense: (id: string, field: keyof DynamicField, value: any) => void;
  addDebt: () => void;
  removeDebt: (id: string) => void;
  updateDebt: (id: string, field: keyof DynamicField, value: any) => void;
  addInvestment: () => void;
  removeInvestment: (id: string) => void;
  updateInvestment: (id: string, field: keyof DynamicField, value: any) => void;
}

// Create the context with a default value (can be undefined initially)
const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Define the provider component
export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    name: '',
    dob: '',
    occupation: '',
    annualSalary: '',
    foodExpense: '',
    transportExpense: '',
    utilitiesExpense: '',
    customExpenses: [],
    debts: [],
    investments: [],
  });

  // --- General Update Function ---
  const updateOnboardingData = (updates: Partial<OnboardingData>) => {
    setOnboardingData((prevData) => ({ ...prevData, ...updates }));
  };

  // --- Custom Expense Functions ---
  const addCustomExpense = () => {
    setOnboardingData((prev) => ({
      ...prev,
      customExpenses: [...prev.customExpenses, { id: crypto.randomUUID(), category: '', amount: '' }],
    }));
  };

  const removeCustomExpense = (id: string) => {
    setOnboardingData((prev) => ({
      ...prev,
      customExpenses: prev.customExpenses.filter((exp) => exp.id !== id),
    }));
  };

  const updateCustomExpense = (id: string, field: keyof DynamicField, value: any) => {
     setOnboardingData((prev) => ({
      ...prev,
      customExpenses: prev.customExpenses.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  }

  // --- Debt Functions ---
   const addDebt = () => {
    setOnboardingData((prev) => ({
      ...prev,
      debts: [...prev.debts, { id: crypto.randomUUID(), type: '', amount: '', emi: '' }],
    }));
  };

  const removeDebt = (id: string) => {
    setOnboardingData((prev) => ({
      ...prev,
      debts: prev.debts.filter((d) => d.id !== id),
    }));
  };

   const updateDebt = (id: string, field: keyof DynamicField, value: any) => {
     setOnboardingData((prev) => ({
      ...prev,
      debts: prev.debts.map((d) =>
        d.id === id ? { ...d, [field]: value } : d
      ),
    }));
  }

  // --- Investment Functions ---
   const addInvestment = () => {
    setOnboardingData((prev) => ({
      ...prev,
      investments: [...prev.investments, { id: crypto.randomUUID(), type: '', amount: '' }],
    }));
  };

   const removeInvestment = (id: string) => {
    setOnboardingData((prev) => ({
      ...prev,
      investments: prev.investments.filter((inv) => inv.id !== id),
    }));
  };

   const updateInvestment = (id: string, field: keyof DynamicField, value: any) => {
     setOnboardingData((prev) => ({
      ...prev,
      investments: prev.investments.map((inv) =>
        inv.id === id ? { ...inv, [field]: value } : inv
      ),
    }));
  }


  // Provide the state and update functions to children
  const value = {
      onboardingData,
      updateOnboardingData,
      addCustomExpense,
      removeCustomExpense,
      updateCustomExpense,
      addDebt,
      removeDebt,
      updateDebt,
      addInvestment,
      removeInvestment,
      updateInvestment
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

// Custom hook to use the onboarding context easily
export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};