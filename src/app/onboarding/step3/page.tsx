// src/app/onboarding/step3/page.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button as MovingBorderButton } from "@/components/ui/moving-border";
import { motion } from "framer-motion";
import { FiPlus, FiTrash2, FiCheckCircle, FiArrowLeft } from 'react-icons/fi'; // Added/updated icons
import { cn } from '@/lib/utils';

export default function OnboardingStep3() {
  const router = useRouter();
  const {
      onboardingData,
      addDebt,
      removeDebt,
      updateDebt,
      addInvestment,
      removeInvestment,
      updateInvestment
  } = useOnboarding();
  const [isLoading, setIsLoading] = React.useState(false); // State for final submission loading

  // Handler for debt inputs
  const handleDebtInputChange = (id: string, field: 'type' | 'amount' | 'emi', value: string) => {
      // Convert amount/emi to number or empty string, keep type as string
      const processedValue = (field === 'amount' || field === 'emi')
                                ? (value === '' ? '' : parseFloat(value))
                                : value;
      updateDebt(id, field, processedValue);
  };

  // Handler for investment inputs
   const handleInvestmentInputChange = (id: string, field: 'type' | 'amount', value: string) => {
      const processedValue = field === 'amount' ? (value === '' ? '' : parseFloat(value)) : value;
      updateInvestment(id, field, processedValue);
  };

  // Handle final submission
  const finishOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Final Onboarding Data:", onboardingData);

    // **TODO: Implement API Call**
    // 1. Create an API endpoint (e.g., /api/user/complete-onboarding)
    // 2. Send the complete 'onboardingData' object to the endpoint.
    // 3. The API should:
    //    - Validate the data.
    //    - Get the authenticated user's ID (e.g., using getServerSession).
    //    - Update the user document in MongoDB with the onboarding data
    //      (name, dob, salary, expenses, debts, investments) and set
    //      'onboardingComplete = true'.
    //    - Handle potential errors.

    try {
        // Example fetch (replace with actual implementation)
        const response = await fetch('/api/user/complete-onboarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(onboardingData),
        });

        if (!response.ok) {
             const errorData = await response.json();
             throw new Error(errorData.message || 'Failed to save onboarding data.');
        }

        console.log("Onboarding data saved successfully!");
        // Redirect to the main dashboard after successful onboarding
        router.push('/dashboard'); // Or your main app page
        router.refresh(); // Refresh needed for session update potentially

    } catch (error) {
        console.error("Failed to finish onboarding:", error);
        // TODO: Show user-friendly error message on the UI
        alert(`Error finishing onboarding: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsLoading(false); // Stop loading on error
    }
    // Remove setIsLoading(false) from here if redirecting on success
  };

  const goBack = () => {
    router.push('/onboarding/step2');
  };

  return (
     <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.8, ease: "easeInOut" }}
        // Wider card for potentially longer lists
        className="w-full max-w-3xl p-8 space-y-8 bg-black/60 backdrop-blur-sm rounded-lg shadow-xl border border-neutral-800"
    >
        <div className="text-center">
            <h2 className="text-2xl font-bold text-white">Debts & Investments</h2>
            <p className="text-neutral-400 text-sm mt-1">List any significant outstanding debts or existing investments (Optional).</p>
        </div>

        <form onSubmit={finishOnboarding} className="space-y-8"> {/* Increased spacing */}

            {/* Debts Section */}
            <fieldset>
                 <legend className="text-lg font-semibold text-neutral-200 mb-1">Outstanding Debts</legend>
                 <p className="text-xs text-neutral-400 mb-4">Loans (Home, Car, Personal), Credit Card balances, EMIs, etc.</p>
                 <div className="space-y-3 max-h-60 overflow-y-auto pr-2"> {/* Scrollable list */}
                    {onboardingData.debts.map((debt) => (
                        <div key={debt.id} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center bg-neutral-900/40 p-3 rounded-lg border border-neutral-700/80">
                            {/* Debt Type Input */}
                            <div className="sm:col-span-1">
                                <Label htmlFor={`debt-type-${debt.id}`} className="sr-only">Debt Type</Label>
                                <Input id={`debt-type-${debt.id}`} type="text" placeholder="Debt Type (e.g., Home Loan)"
                                    value={debt.type || ''} onChange={(e) => handleDebtInputChange(debt.id, 'type', e.target.value)}
                                    className="text-sm h-9 bg-neutral-950 border-neutral-700" />
                            </div>
                            {/* Amount Input */}
                            <div className="sm:col-span-1 grid grid-cols-2 gap-2">
                                <div>
                                    <Label htmlFor={`debt-amt-${debt.id}`} className="sr-only">Total Amount</Label>
                                     <Input id={`debt-amt-${debt.id}`} type="number" placeholder="Amount (INR)" min="0" 
                                        value={debt.amount} onChange={(e) => handleDebtInputChange(debt.id, 'amount', e.target.value)}
                                        className="text-sm h-9 bg-neutral-950 border-neutral-700" />
                                 </div>
                                 {/* Optional EMI Input */}
                                 <div>
                                     <Label htmlFor={`debt-emi-${debt.id}`} className="sr-only">EMI (Optional)</Label>
                                     <Input id={`debt-emi-${debt.id}`} type="number" placeholder="EMI (INR)" min="0" 
                                        value={debt.emi ?? ''} onChange={(e) => handleDebtInputChange(debt.id, 'emi', e.target.value)}
                                        className="text-sm h-9 bg-neutral-950 border-neutral-700" />
                                 </div>
                            </div>
                            {/* Remove Button */}
                            <div className="sm:col-span-1 flex justify-end">
                                <button type="button" onClick={() => removeDebt(debt.id)}
                                    className="p-1.5 text-neutral-500 hover:text-red-500 hover:bg-neutral-700/50 rounded-md transition-colors"
                                    aria-label="Remove debt">
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {onboardingData.debts.length === 0 && (
                        <p className="text-sm text-neutral-500 text-center py-2">No debts added yet.</p>
                    )}
                 </div>
                 <button type="button" onClick={addDebt}
                   className="mt-4 flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors py-1 px-1">
                    <FiPlus className="w-4 h-4" /> Add Debt / Loan
                 </button>
            </fieldset>

            {/* Investments Section */}
             <fieldset>
                 <legend className="text-lg font-semibold text-neutral-200 mb-1">Existing Investments</legend>
                 <p className="text-xs text-neutral-400 mb-4">Mutual Funds, Stocks, FDs, Real Estate, Gold, etc.</p>
                 <div className="space-y-3 max-h-60 overflow-y-auto pr-2"> {/* Scrollable list */}
                    {onboardingData.investments.map((inv) => (
                         <div key={inv.id} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center bg-neutral-900/40 p-3 rounded-lg border border-neutral-700/80">
                            {/* Investment Type Input */}
                            <div className="sm:col-span-2"> {/* Wider type field */}
                                <Label htmlFor={`inv-type-${inv.id}`} className="sr-only">Investment Type</Label>
                                <Input id={`inv-type-${inv.id}`} type="text" placeholder="Investment Type (e.g., Index Fund)"
                                    value={inv.type || ''} onChange={(e) => handleInvestmentInputChange(inv.id, 'type', e.target.value)}
                                    className="text-sm h-9 bg-neutral-950 border-neutral-700" />
                            </div>
                            {/* Amount Input */}
                             <div className="sm:col-span-1 grid grid-cols-5 gap-2"> {/* Use grid to align amount and button */}
                                <div className="col-span-4">
                                    <Label htmlFor={`inv-amt-${inv.id}`} className="sr-only">Current Value</Label>
                                     <Input id={`inv-amt-${inv.id}`} type="number" placeholder="Value (INR)" min="0" 
                                        value={inv.amount} onChange={(e) => handleInvestmentInputChange(inv.id, 'amount', e.target.value)}
                                        className="text-sm h-9 bg-neutral-950 border-neutral-700" />
                                </div>
                                {/* Remove Button */}
                                <div className="col-span-1 flex justify-end items-center">
                                    <button type="button" onClick={() => removeInvestment(inv.id)}
                                        className="p-1.5 text-neutral-500 hover:text-red-500 hover:bg-neutral-700/50 rounded-md transition-colors"
                                        aria-label="Remove investment">
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>
                             </div>
                         </div>
                    ))}
                     {onboardingData.investments.length === 0 && (
                        <p className="text-sm text-neutral-500 text-center py-2">No investments added yet.</p>
                    )}
                 </div>
                 <button type="button" onClick={addInvestment}
                   className="mt-4 flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors py-1 px-1">
                    <FiPlus className="w-4 h-4" /> Add Investment
                 </button>
            </fieldset>

            {/* Navigation Buttons */}
             <div className="pt-6 flex justify-between items-center border-t border-neutral-700/50">
                  <button type="button" onClick={goBack} disabled={isLoading}
                     className="px-4 py-2 text-sm text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed" >
                       <FiArrowLeft className="inline-block mr-1 h-4 w-4" /> Back
                  </button>
                 <MovingBorderButton
                   type="submit" borderRadius="1.75rem" containerClassName="h-12 w-auto"
                   className={`bg-green-600 border-slate-800 text-white text-base font-semibold flex items-center justify-center gap-2 transition-colors duration-300 px-6 ${
                       isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
                   }`}
                   disabled={isLoading}
                 >
                    {isLoading ? 'Saving...' : (
                       <>
                         <span>Finish Onboarding</span>
                         <FiCheckCircle className="w-5 h-5" />
                       </>
                    )}
                 </MovingBorderButton>
             </div>
        </form>
     </motion.div>
  );
}