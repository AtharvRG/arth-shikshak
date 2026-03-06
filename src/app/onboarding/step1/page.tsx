// src/app/onboarding/step1/page.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker'; // Correct import
import { Button as MovingBorderButton } from "@/components/ui/moving-border";
import { motion } from "framer-motion";
import { FiArrowRight } from 'react-icons/fi';
import { parseISO, isValid, format } from 'date-fns'; // Add format

export default function OnboardingStep1() {
  const router = useRouter();
  const { onboardingData, updateOnboardingData } = useOnboarding();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    updateOnboardingData({
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value,
    });
  };

  // Date change handler - expects Date object from DatePicker
  const handleDateChange = (date: Date | undefined) => {
    // Store consistently as YYYY-MM-DD string internally
    updateOnboardingData({
      dob: date ? format(date, 'yyyy-MM-dd') : '',
    });
  };

  const goToNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardingData.name || !onboardingData.dob || onboardingData.annualSalary === '') {
        alert("Please fill in required fields (Name, DOB, Salary)."); return;
    }
    const dobDate = onboardingData.dob ? parseISO(onboardingData.dob) : null;
    if (!dobDate || !isValid(dobDate)){
         alert("Please enter a valid Date of Birth in DD/MM/YYYY format."); return;
     }
    console.log("Step 1 Data:", onboardingData);
    router.push('/onboarding/step2');
  };

  return (
     <motion.div
        // ... (motion div props remain same) ...
         initial={{ opacity: 0.0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.8, ease: "easeInOut" }}
        className="w-full max-w-xl p-8 space-y-6 bg-black/60 backdrop-blur-sm rounded-lg shadow-xl border border-neutral-800"
    >
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Tell us about yourself</h2>
            <p className="text-neutral-400 text-sm">Let&apos;s start with the basics.</p>
        </div>

        <form onSubmit={goToNextStep} className="space-y-5">
            {/* Name Input (remains same) */}
             <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" type="text" placeholder="e.g., Ada Lovelace" required className="mt-1" value={onboardingData.name} onChange={handleInputChange} />
            </div>

            {/* *** UPDATED Date of Birth Section *** */}
            <div>
                {/* *** Update Label *** */}
                <Label htmlFor="dob">Date of Birth (DD/MM/YYYY)</Label>
                <DatePicker
                   id="dob"
                   name="dob"
                   // Parse internal YYYY-MM-DD string to Date object for picker
                   value={onboardingData.dob && isValid(parseISO(onboardingData.dob)) ? parseISO(onboardingData.dob) : undefined}
                   onChange={handleDateChange}
                   placeholder="DD/MM/YYYY" // Use correct format
                   inputClassName="mt-1"
                   required
                />
            </div>
            {/* *** END UPDATED Date of Birth Section *** */}


            {/* Salary Input (remains same) */}
             <div>
                <Label htmlFor="annualSalary">Estimated Annual Salary (INR)</Label>
                <Input id="annualSalary" name="annualSalary" type="number" placeholder="e.g., 1200000" required min="0" className="mt-1" value={onboardingData.annualSalary} onChange={handleInputChange} />
            </div>

            {/* Occupation Input (remains same) */}
             <div>
                <Label htmlFor="occupation">Occupation (Optional)</Label>
                <Input id="occupation" name="occupation" type="text" placeholder="e.g., Software Engineer" className="mt-1" value={onboardingData.occupation} onChange={handleInputChange} />
            </div>

            {/* Submit Button (remains same) */}
             <div className="pt-4">
                 <MovingBorderButton type="submit" borderRadius="1.75rem" containerClassName="w-full h-12" className="bg-blue-600 hover:bg-blue-700 border-slate-800 text-white text-base font-semibold flex items-center justify-center gap-2 transition-colors duration-300">
                   <span>Next: Expenses</span>
                   <FiArrowRight className="w-5 h-5" />
                 </MovingBorderButton>
             </div>
        </form>
     </motion.div>
  );
}