// src/app/onboarding/step2/page.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input'; // Ensure Input component hides spinners via globals.css
import { Button as MovingBorderButton } from "@/components/ui/moving-border";
import { motion } from "framer-motion";
import { FiArrowRight, FiPlus, FiTrash2 } from 'react-icons/fi';
import { cn } from '@/lib/utils'; // Import cn if needed

export default function OnboardingStep2() {
  const router = useRouter();
  const {
      onboardingData,
      updateOnboardingData,
      addCustomExpense,
      removeCustomExpense,
      updateCustomExpense
  } = useOnboarding();

  const handleFixedInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateOnboardingData({ [name]: value === '' ? '' : parseFloat(value) });
  };

  const handleCustomInputChange = (id: string, field: 'category' | 'amount', value: string) => {
      const processedValue = field === 'amount' ? (value === '' ? '' : parseFloat(value)) : value;
      updateCustomExpense(id, field, processedValue);
  };

  const goToNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Step 2 Data:", onboardingData);
    router.push('/onboarding/step3');
  };

  const goBack = () => {
    router.push('/onboarding/step1');
  };

  return (
     <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.8, ease: "easeInOut" }}
        // Use same card styling as Step 1
        className="w-full max-w-2xl p-8 space-y-8 bg-black/60 backdrop-blur-sm rounded-lg shadow-xl border border-neutral-800" // Increased main spacing to space-y-8
    >
        <div className="text-center"> {/* Reduced mb */}
            <h2 className="text-2xl font-bold text-white">Monthly Expenses</h2>
            <p className="text-neutral-400 text-sm mt-1">Estimate your average monthly spending (INR).</p> {/* Added unit hint */}
        </div>

        {/* Use form directly, remove extra div */}
        <form onSubmit={goToNextStep} className="space-y-6"> {/* Consistent spacing */}
            {/* Fixed Expenses */}
            <fieldset> {/* Group related fields */}
                 <legend className="text-lg font-semibold text-neutral-200 mb-3">Common Expenses</legend>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"> {/* Increased gap */}
                    <div className="space-y-1"> {/* Space between label and input */}
                        <Label htmlFor="foodExpense">Food / Groceries</Label>
                        <Input id="foodExpense" name="foodExpense" type="number" placeholder="e.g., 15000" min="0" 
                          value={onboardingData.foodExpense} onChange={handleFixedInputChange} />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="transportExpense">Transport / Fuel</Label>
                        <Input id="transportExpense" name="transportExpense" type="number" placeholder="e.g., 5000" min="0" 
                          value={onboardingData.transportExpense} onChange={handleFixedInputChange} />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="utilitiesExpense">Utilities (Bills)</Label>
                        <Input id="utilitiesExpense" name="utilitiesExpense" type="number" placeholder="e.g., 8000" min="0" 
                          value={onboardingData.utilitiesExpense} onChange={handleFixedInputChange} />
                    </div>
                 </div>
            </fieldset>

            {/* <div className="pt-4 border-t border-neutral-700/50"></div> Removed extra divider */}

             {/* Custom Expenses Section */}
             <fieldset>
                 <legend className="text-lg font-semibold text-neutral-200 mb-1">Other Expenses</legend>
                 <p className="text-xs text-neutral-400 mb-4">Add rent, entertainment, subscriptions, etc.</p>
                 <div className="space-y-3">
                    {onboardingData.customExpenses.map((expense) => (
                        // Slightly refined styling for custom rows
                        <div key={expense.id} className="flex items-center gap-3 bg-neutral-900/40 p-3 rounded-lg border border-neutral-700/80">
                            <div className="flex-grow"> {/* Use flex-grow */}
                                <Label htmlFor={`custom-cat-${expense.id}`} className="sr-only">Category</Label>
                                <Input id={`custom-cat-${expense.id}`} type="text" placeholder="Expense Category"
                                    value={expense.category || ''} onChange={(e) => handleCustomInputChange(expense.id, 'category', e.target.value)}
                                    className="text-sm h-9 bg-neutral-950 border-neutral-700" // Adjusted background/border
                                />
                            </div>
                            <div className="w-1/3 md:w-1/4"> {/* Adjust width */}
                                <Label htmlFor={`custom-amt-${expense.id}`} className="sr-only">Amount</Label>
                                 <Input id={`custom-amt-${expense.id}`} type="number" placeholder="Amount" min="0" 
                                    value={expense.amount} onChange={(e) => handleCustomInputChange(expense.id, 'amount', e.target.value)}
                                    className="text-sm h-9 bg-neutral-950 border-neutral-700"
                                />
                            </div>
                            <button type="button" onClick={() => removeCustomExpense(expense.id)}
                                className="p-1.5 text-neutral-500 hover:text-red-500 hover:bg-neutral-700/50 rounded-md transition-colors"
                                aria-label="Remove expense" >
                                <FiTrash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                     {/* Message if no custom expenses */}
                    {onboardingData.customExpenses.length === 0 && (
                        <p className="text-sm text-neutral-500 text-center py-2">No other expenses added yet.</p>
                    )}
                 </div>

                <button type="button" onClick={addCustomExpense}
                   className="mt-4 flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors py-1 px-1" >
                    <FiPlus className="w-4 h-4" />
                    Add Expense
                 </button>
             </fieldset>


             {/* Navigation Buttons */}
             <div className="pt-6 flex justify-between items-center border-t border-neutral-700/50">
                  <button type="button" onClick={goBack}
                     className="px-4 py-2 text-sm text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors font-medium" >
                      Back
                  </button>
                 <MovingBorderButton type="submit" borderRadius="1.75rem" containerClassName="h-12 w-auto"
                   className="bg-blue-600 hover:bg-blue-700 border-slate-800 text-white text-base font-semibold flex items-center justify-center gap-2 transition-colors duration-300 px-6" >
                   <span>Next: Debts & Investments</span>
                   <FiArrowRight className="w-5 h-5" />
                 </MovingBorderButton>
             </div>
        </form>
     </motion.div>
  );
}