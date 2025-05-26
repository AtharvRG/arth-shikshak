// src/components/profile/ProfileForm.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray, SubmitHandler } from 'react-hook-form';
import { User as CustomUserType } from '@/models/User'; // Your data model
import { WobbleCard } from '@/components/ui/wobble-card'; // Card effect
import { Input } from '@/components/ui/input'; // Custom Input
import { Label } from '@/components/ui/label'; // Custom Label
import { DatePicker } from '@/components/ui/date-picker'; // Custom DatePicker
import { Button as MovingBorderButton } from "@/components/ui/moving-border"; // Button style
import { FiEdit, FiSave, FiXCircle, FiPlus, FiTrash2, FiLoader } from 'react-icons/fi'; // Icons
import { cn } from '@/lib/utils'; // Class name utility
import { parseISO, format, isValid } from 'date-fns'; // Date utilities
import { useLoading } from '@/context/LoadingContext'; // Loading indicator context

// Define the shape of the form data, matching editable fields
// Use string for number inputs initially for better UX with empty state
type ProfileFormData = {
  name: string;
  dob: string; // Store as YYYY-MM-DD string
  occupation: string;
  annualSalary: string; // Keep string for input flexibility
  foodExpense: string;
  transportExpense: string;
  utilitiesExpense: string;
  customExpenses: { id?: string; category: string; amount: string }[]; // Use string for amount input
  debts: { id?: string; type: string; amount: string; emi: string }[]; // Use string for amounts
  investments: { id?: string; type: string; amount: string }[]; // Use string for amount
};

// Define props for the component
interface ProfileFormProps {
  initialData: CustomUserType; // Receive fetched user data
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
    const [isEditing, setIsEditing] = useState(false); // Track edit mode
    const [isSaving, setIsSaving] = useState(false); // Track saving state
    const [error, setError] = useState<string | null>(null); // API error message
    const [successMessage, setSuccessMessage] = useState<string | null>(null); // API success message
    const { startLoading, stopLoading } = useLoading(); // Global loading indicator

    // Helper to safely convert potentially nullish number to string for input defaultValues
    const numToString = (val: number | null | undefined): string => (val === null || val === undefined) ? '' : String(val);

    // Extract fixed expenses from the full expenses array for form mapping
    const initialFixedExpenses = {
        foodExpense: initialData.expenses?.find(e => e.category === 'Food')?.amount ?? '',
        transportExpense: initialData.expenses?.find(e => e.category === 'Transport')?.amount ?? '',
        utilitiesExpense: initialData.expenses?.find(e => e.category === 'Utilities')?.amount ?? '',
    };

    // Prepare default values for react-hook-form based on initialData prop
    const defaultValues: ProfileFormData = {
        name: initialData.name || '',
        // Format incoming Date object or ISO string to YYYY-MM-DD for input
        dob: initialData.dob ? format( new Date(initialData.dob), 'yyyy-MM-dd') : '',
        occupation: initialData.occupation || '',
        annualSalary: numToString(initialData.annualSalary), // Convert number to string
        foodExpense: numToString(initialFixedExpenses.foodExpense),
        transportExpense: numToString(initialFixedExpenses.transportExpense),
        utilitiesExpense: numToString(initialFixedExpenses.utilitiesExpense),
        // Filter out fixed categories and map to form structure, convert numbers to strings
        customExpenses: initialData.expenses?.filter(e => !['Food', 'Transport', 'Utilities'].includes(e.category || ''))
                         .map(e => ({ id: (e as any)._id?.toString(), category: e.category || '', amount: numToString(e.amount) })) || [],
        debts: initialData.debts?.map(d => ({ id: (d as any)._id?.toString(), type: d.type || '', amount: numToString(d.amount), emi: numToString(d.emi) })) || [],
        investments: initialData.investments?.map(i => ({ id: (i as any)._id?.toString(), type: i.type || '', amount: numToString(i.amount) })) || [],
    };

    // Initialize react-hook-form
    const { register, handleSubmit, control, reset, formState: { errors, isDirty } } = useForm<ProfileFormData>({
        defaultValues: defaultValues
    });

    // Field array hooks for managing dynamic lists
    const { fields: customExpenseFields, append: appendCustomExpense, remove: removeCustomExpense } = useFieldArray({ control, name: "customExpenses" });
    const { fields: debtFields, append: appendDebt, remove: removeDebt } = useFieldArray({ control, name: "debts" });
    const { fields: investmentFields, append: appendInvestment, remove: removeInvestment } = useFieldArray({ control, name: "investments" });

    // Effect to reset the form if the initialData prop changes (e.g., after a save and re-fetch)
     useEffect(() => {
         // Recalculate defaults based on potentially updated initialData
          const fixedExp = {
             foodExpense: initialData.expenses?.find(e => e.category === 'Food')?.amount ?? '',
             transportExpense: initialData.expenses?.find(e => e.category === 'Transport')?.amount ?? '',
             utilitiesExpense: initialData.expenses?.find(e => e.category === 'Utilities')?.amount ?? '',
         };
         reset({ // Reset form state with new defaults
            name: initialData.name || '',
            dob: initialData.dob ? format( new Date(initialData.dob), 'yyyy-MM-dd') : '',
            occupation: initialData.occupation || '',
            annualSalary: numToString(initialData.annualSalary),
            foodExpense: numToString(fixedExp.foodExpense),
            transportExpense: numToString(fixedExp.transportExpense),
            utilitiesExpense: numToString(fixedExp.utilitiesExpense),
            customExpenses: initialData.expenses?.filter(e => !['Food', 'Transport', 'Utilities'].includes(e.category || '')).map(e => ({ id: (e as any)._id?.toString(), category: e.category || '', amount: numToString(e.amount) })) || [],
            debts: initialData.debts?.map(d => ({ id: (d as any)._id?.toString(), type: d.type || '', amount: numToString(d.amount), emi: numToString(d.emi) })) || [],
            investments: initialData.investments?.map(i => ({ id: (i as any)._id?.toString(), type: i.type || '', amount: numToString(i.amount) })) || [],
         });
     }, [initialData, reset]); // Dependency on initialData ensures reset on prop change


    // Handle form submission (saving the profile)
    const onSave: SubmitHandler<ProfileFormData> = async (data) => {
        setIsSaving(true); // Set local saving state
        setError(null); // Clear previous errors
        setSuccessMessage(null); // Clear previous success message
        startLoading('fullPage', ["Updating your profile..."]); // Trigger global loader

        // Client-side validation before sending to API
        if (data.dob && !isValid(parseISO(data.dob))) {
            setError("Invalid Date of Birth format. Please use YYYY-MM-DD.");
            setIsSaving(false);
            stopLoading();
            return;
        }

        // Prepare data for API (convert number strings back to numbers or null)
        const apiData: UpdateProfileRequestBody = {
            name: data.name,
            dob: data.dob || undefined, // Send undefined if empty
            occupation: data.occupation || undefined,
            annualSalary: data.annualSalary === '' ? undefined : Number(data.annualSalary), // Convert back to number
            foodExpense: data.foodExpense === '' ? undefined : Number(data.foodExpense),
            transportExpense: data.transportExpense === '' ? undefined : Number(data.transportExpense),
            utilitiesExpense: data.utilitiesExpense === '' ? undefined : Number(data.utilitiesExpense),
            customExpenses: data.customExpenses.map(e => ({...e, amount: Number(e.amount)})),
            debts: data.debts.map(d => ({...d, amount: Number(d.amount), emi: d.emi === '' ? undefined : Number(d.emi)})),
            investments: data.investments.map(i => ({...i, amount: Number(i.amount)})),
        };


        try {
            // Call the backend API endpoint
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update profile.');
            }

            setSuccessMessage("Profile updated successfully!"); // Show success message
            setIsEditing(false); // Exit edit mode
            // Form will be reset by useEffect when initialData updates,
            // assuming parent component re-fetches and passes new initialData.
            // If parent doesn't re-fetch, uncommenting the reset below is needed,
            // but might cause flicker if parent eventually passes new props.
            // reset(data); // Reset form state to reflect saved data

        } catch (error) {
            console.error("Error saving profile:", error);
            setError(error instanceof Error ? error.message : "Could not save profile.");
        } finally {
            setIsSaving(false); // Reset local saving state
            stopLoading(); // Stop the global loader
            // Clear success message after a delay
            setTimeout(() => setSuccessMessage(null), 4000);
        }
    };

    // Handle cancelling the edit mode
    const handleCancel = () => {
        reset(defaultValues); // Reset form fields to their initial state
        setIsEditing(false); // Exit edit mode
        setError(null); // Clear any errors
        setSuccessMessage(null); // Clear success message
    };

    // --- Helper function to render display text or input field ---
    const renderField = (label: string, fieldName: keyof ProfileFormData, config: {
        inputType?: string;
        required?: boolean;
        placeholder?: string;
        isCurrency?: boolean;
        isDisabled?: boolean; // Added disable option
    } = {}) => {
        const { inputType = 'text', required = false, placeholder, isCurrency = false, isDisabled = !isEditing } = config;
        const currentValue = defaultValues[fieldName];

        return (
            <div className="mb-4">
                <Label htmlFor={fieldName} className="text-xs font-medium text-neutral-400">{label}</Label>
                {isEditing ? (
                    <Input
                        id={fieldName}
                        type={inputType}
                        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
                        className="mt-1 text-sm bg-neutral-900 border-neutral-700 disabled:opacity-70"
                        min={inputType === 'number' ? "0" : undefined}
                        step={inputType === 'number' ? "1" : undefined} // Allow finer steps
                        // Register field with react-hook-form
                        {...register(fieldName, {
                             required: required ? 'This field is required' : false,
                             valueAsNumber: inputType === 'number' // Treat number inputs as numbers for validation
                         })}
                        disabled={isDisabled || isSaving} // Disable while saving
                    />
                ) : (
                    // Display Mode
                    <p className="text-neutral-100 text-base mt-1 truncate h-6 flex items-center"> {/* Fixed height, truncate */}
                        {/* Format display value */}
                        { isCurrency && (currentValue !== '' && currentValue !== null && currentValue !== undefined)
                          ? `₹ ${Number(currentValue).toLocaleString('en-IN', {maximumFractionDigits: 0})}`
                          : (fieldName === 'dob' && currentValue)
                          ? format(parseISO(String(currentValue)), 'PPP') // Format date: e.g., Jan 1st, 2023
                          : Array.isArray(currentValue)
                          ? <span className="text-neutral-500 text-sm italic">Not displayed</span>
                          : (currentValue || <span className="text-neutral-500 text-sm italic">Not set</span>) // Handle empty/null
                        }
                    </p>
                )}
                {/* Display validation errors */}
                {errors[fieldName] && isEditing && <span className="text-red-500 text-xs mt-1">{errors[fieldName]?.message || 'Invalid input'}</span>}
            </div>
        );
    };
     // Helper for Date Picker using Controller
     const renderDateField = (label: string, fieldName: "dob", required: boolean = false) => {
        const currentValue = defaultValues[fieldName];
        return (
          <div className="mb-4">
            <Label htmlFor={fieldName} className="text-xs font-medium text-neutral-400">{label}</Label>
            {isEditing ? (
              <Controller
                name={fieldName}
                control={control}
                rules={{ required: required ? 'This field is required' : false }}
                render={({ field }) => (
                  <DatePicker
                    id={fieldName}
                    value={field.value ? parseISO(field.value) : undefined}
                    onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                    placeholder="DD/MM/YYYY"
                    inputClassName="mt-1 text-sm bg-neutral-900 border-neutral-700 w-full"
                    disabled={isSaving} // Disable while saving
                  />
                )}
              />
            ) : (
              <p className="text-neutral-100 text-base mt-1 truncate h-6 flex items-center">
                 {currentValue ? format(parseISO(currentValue), 'PPP') : <span className="text-neutral-500 text-sm italic">Not set</span>}
              </p>
            )}
             {errors[fieldName] && isEditing && <span className="text-red-500 text-xs mt-1">{errors[fieldName]?.message}</span>}
          </div>
        );
      };
    // --- End Render Helpers ---


    // --- Main Form JSX ---
    return (
        <form onSubmit={handleSubmit(onSave)}>
            {/* Edit/Save/Cancel Buttons Area */}
             <div className="flex justify-end mb-6 gap-3 sticky top-[70px] bg-black/50 backdrop-blur-sm py-2 z-20 rounded-b-lg -mt-2"> {/* Make buttons sticky */}
                {isEditing ? (
                    <>
                        <button type="button" onClick={handleCancel} disabled={isSaving}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-neutral-700 text-neutral-200 hover:bg-neutral-600 transition-colors disabled:opacity-50">
                            <FiXCircle className="w-4 h-4" /> Cancel
                        </button>
                         <button type="submit" disabled={isSaving || !isDirty} // Disable save if no changes or saving
                            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSaving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </>
                ) : (
                    <button type="button" onClick={() => setIsEditing(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-neutral-800 text-neutral-200 hover:bg-neutral-700 transition-colors">
                       <FiEdit className="w-4 h-4" /> Edit Profile
                    </button>
                )}
            </div>

            {/* Success/Error Message Display */}
            <div className="h-10 mb-4"> {/* Reserve space for messages */}
                {successMessage && <div className="p-3 rounded-md bg-green-900/50 border border-green-700 text-green-300 text-sm text-center animate-pulse">{successMessage}</div>}
                {error && <div className="p-3 rounded-md bg-red-900/50 border border-red-700 text-red-300 text-sm text-center">{error}</div>}
            </div>

            {/* Grid Layout for Profile Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

                {/* Card 1: Personal & Financial Info */}
                <WobbleCard containerClassName="col-span-1 lg:col-span-1 min-h-[400px] bg-neutral-900" className="!p-6" >
                     <h2 className="text-xl font-semibold text-white mb-5">Personal & Financial</h2>
                     {renderField("Full Name", "name", {inputType:'text', required: true})}
                     {renderDateField("Date of Birth", "dob", true)}
                     {renderField("Occupation (Optional)", "occupation", {inputType:'text'})}
                     {renderField("Estimated Annual Salary", "annualSalary", {inputType: 'number', required: true, placeholder: "0", isCurrency: true})}
                </WobbleCard>

                 {/* Card 2: Expenses */}
                 <WobbleCard containerClassName="col-span-1 lg:col-span-1 min-h-[400px] bg-neutral-900" className="!p-6" >
                     <h2 className="text-xl font-semibold text-white mb-5">Monthly Expenses</h2>
                     {/* Fixed Expenses */}
                     <div className="grid grid-cols-3 gap-x-4 gap-y-1 mb-4">
                         {renderField("Food", "foodExpense", {inputType: 'number', placeholder: "0", isCurrency: true})}
                         {renderField("Transport", "transportExpense", {inputType: 'number', placeholder: "0", isCurrency: true})}
                         {renderField("Utilities", "utilitiesExpense", {inputType: 'number', placeholder: "0", isCurrency: true})}
                     </div>
                     {/* Custom Expenses */}
                     <Label className="text-sm font-medium text-neutral-300 mb-2 block">Other Recurring</Label>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-850">
                          {customExpenseFields.map((field, index) => (
                              <div key={field.id} className="flex items-center gap-2">
                                  <Input placeholder="Category" {...register(`customExpenses.${index}.category`)} disabled={!isEditing || isSaving} className="text-sm h-9 bg-neutral-950 border-neutral-700 flex-1 disabled:opacity-70"/>
                                  <Input type="number" placeholder="Amount" {...register(`customExpenses.${index}.amount`, {valueAsNumber: true})} disabled={!isEditing || isSaving} className="text-sm h-9 bg-neutral-950 border-neutral-700 w-28 disabled:opacity-70"/>
                                  {isEditing && <button type="button" onClick={() => removeCustomExpense(index)} disabled={isSaving} className="p-1 text-neutral-500 hover:text-red-400 disabled:opacity-50"><FiTrash2 className="w-4 h-4"/></button>}
                              </div>
                          ))}
                      </div>
                      {isEditing && <button type="button" onClick={() => appendCustomExpense({ category: '', amount: '' })} disabled={isSaving} className="mt-2 text-blue-400 text-xs hover:underline disabled:opacity-50">+ Add Expense</button>}
                 </WobbleCard>

                 {/* Card 3: Debts */}
                 <WobbleCard containerClassName="col-span-1 lg:col-span-1 min-h-[400px] bg-neutral-900" className="!p-6">
                      <h2 className="text-xl font-semibold text-white mb-5">Debts / EMIs</h2>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-850">
                          {debtFields.map((field, index) => (
                              <div key={field.id} className="grid grid-cols-6 gap-2 items-center">
                                  <Input placeholder="Debt Type" {...register(`debts.${index}.type`)} disabled={!isEditing || isSaving} className="text-sm h-9 bg-neutral-950 border-neutral-700 col-span-2 disabled:opacity-70"/>
                                  <Input type="number" placeholder="Total Amt (INR)" {...register(`debts.${index}.amount`, {valueAsNumber: true})} disabled={!isEditing || isSaving} className="text-sm h-9 bg-neutral-950 border-neutral-700 col-span-2 disabled:opacity-70"/>
                                  <Input type="number" placeholder="EMI (INR)" {...register(`debts.${index}.emi`, {valueAsNumber: true})} disabled={!isEditing || isSaving} className="text-sm h-9 bg-neutral-950 border-neutral-700 col-span-1 disabled:opacity-70"/>
                                  {isEditing && <button type="button" onClick={() => removeDebt(index)} disabled={isSaving} className="p-1 text-neutral-500 hover:text-red-400 justify-self-end disabled:opacity-50"><FiTrash2 className="w-4 h-4"/></button>}
                              </div>
                          ))}
                      </div>
                      {isEditing && <button type="button" onClick={() => appendDebt({ type: '', amount: '', emi: '' })} disabled={isSaving} className="mt-2 text-blue-400 text-xs hover:underline disabled:opacity-50">+ Add Debt</button>}
                 </WobbleCard>

                 {/* Card 4: Investments */}
                 <WobbleCard containerClassName="col-span-1 lg:col-span-1 min-h-[400px] bg-neutral-900" className="!p-6">
                      <h2 className="text-xl font-semibold text-white mb-5">Investments</h2>
                       <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-850">
                          {investmentFields.map((field, index) => (
                              <div key={field.id} className="flex items-center gap-2">
                                  <Input placeholder="Investment Type" {...register(`investments.${index}.type`)} disabled={!isEditing || isSaving} className="text-sm h-9 bg-neutral-950 border-neutral-700 flex-1 disabled:opacity-70"/>
                                  <Input type="number" placeholder="Current Value (INR)" {...register(`investments.${index}.amount`, {valueAsNumber: true})} disabled={!isEditing || isSaving} className="text-sm h-9 bg-neutral-950 border-neutral-700 w-32 disabled:opacity-70"/>
                                  {isEditing && <button type="button" onClick={() => removeInvestment(index)} disabled={isSaving} className="p-1 text-neutral-500 hover:text-red-400 disabled:opacity-50"><FiTrash2 className="w-4 h-4"/></button>}
                              </div>
                          ))}
                      </div>
                      {isEditing && <button type="button" onClick={() => appendInvestment({ type: '', amount: '' })} disabled={isSaving} className="mt-2 text-blue-400 text-xs hover:underline disabled:opacity-50">+ Add Investment</button>}
                 </WobbleCard>

            </div>
        </form>
    );
}