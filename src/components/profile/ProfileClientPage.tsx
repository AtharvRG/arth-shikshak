// src/components/profile/ProfileClientPage.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller, useFieldArray, SubmitHandler } from 'react-hook-form';
import { User as CustomUserType } from '@/models/User';
import { Goal as GoalType } from '@/models/Goal';
import { FocusCards, CardData as FocusCardData } from '@/components/ui/focus-cards';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from "@/components/ui/button";
import { FiEdit, FiSave, FiXCircle, FiPlus, FiTrash2, FiLoader, FiUser, FiCalendar, FiBriefcase, FiDollarSign, FiShoppingBag, FiCreditCard, FiTrendingUp, FiTarget, FiSettings, FiAlertCircle } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import { parseISO, format, isValid } from 'date-fns';
import { useLoading } from '@/context/LoadingContext';
import { AnimatePresence, motion } from 'framer-motion';
import CustomLink from '../ui/CustomLink';
import { FocusEffectProvider, useFocusEffect } from '@/context/FocusEffectContext';
import { Checkbox } from "@/components/ui/checkbox";
import DeleteGoalDialog from '@/components/goals/DeleteGoalDialog';

// Form Data Type
type ProfileFormData = {
  name: string; dob: string; occupation: string; annualSalary: string;
  foodExpense: string; transportExpense: string; utilitiesExpense: string;
  customExpenses: { id?: string; category: string; amount: string }[];
  debts: { id?: string; type: string; amount: string; emi: string }[];
  investments: { id?: string; type: string; amount: string }[];
};

// Local Goal Type
type LocalGoal = Omit<GoalType, '_id' | 'userId' | 'targetDate' | 'createdAt' | 'updatedAt'> &
                 { _id: string; userId: string; targetDate?: string; createdAt: string; updatedAt: string; aiSuggestions?: string | null; currentAmount?: number };

// Component Props
interface ProfileClientPageProps {
  initialData: Omit<CustomUserType, '_id' | 'password' | 'goals'> & { _id: string; goals?: LocalGoal[] };
}

// Formatting helpers
const formatCurrencyDisplay = (value: string | number | null | undefined): string => { const num = Number(value); if (isNaN(num) || value === '' || value === null || value === undefined) return '-'; return `₹ ${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`; };
const formatDateDisplay = (value: string | Date | null | undefined): string => { if (!value) return '-'; try { const date = typeof value === 'string' ? parseISO(value) : value; if (!isValid(date)) return 'Invalid Date'; return format(date, 'PPP'); } catch { return 'Invalid Date'; } };
const numToString = (val: number | null | undefined): string => (val === null || val === undefined) ? '' : String(val);




// --- Internal Component with Form Logic and State ---
function ProfileFormContent({ initialData }: ProfileClientPageProps) {
    const { isBlurEnabled, setIsBlurEnabled } = useFocusEffect();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { startLoading, stopLoading } = useLoading();
    const [localGoals, setLocalGoals] = useState<LocalGoal[]>(initialData.goals || []);
    const [showAddGoalForm, setShowAddGoalForm] = useState(false);
    const [isSavingGoal, setIsSavingGoal] = useState(false);
    const [addGoalError, setAddGoalError] = useState<string | null>(null);
    const [goalToDelete, setGoalToDelete] = useState<LocalGoal | null>(null);
    const [isDeletingGoal, setIsDeletingGoal] = useState(false);
    const [deleteGoalError, setDeleteGoalError] = useState<string | null>(null);

    // Prepare default form values
    const defaultValues: ProfileFormData = {
        name: initialData.name || '',
        dob: initialData.dob ? format(new Date(initialData.dob), 'yyyy-MM-dd') : '',
        occupation: initialData.occupation || '',
        annualSalary: numToString(initialData.annualSalary),
        foodExpense: numToString(initialData.expenses?.find(e => e.category === 'Food')?.amount),
        transportExpense: numToString(initialData.expenses?.find(e => e.category === 'Transport')?.amount),
        utilitiesExpense: numToString(initialData.expenses?.find(e => e.category === 'Utilities')?.amount),
        customExpenses: initialData.expenses?.filter(e => e.category && !['Food', 'Transport', 'Utilities'].includes(e.category)).map(e => ({ id: e._id?.toString(), category: e.category || '', amount: numToString(e.amount) })) || [],
        debts: initialData.debts?.map(d => ({ id: d._id?.toString(), type: d.type || '', amount: numToString(d.amount), emi: numToString(d.emi) })) || [],
        investments: initialData.investments?.map(i => ({ id: i._id?.toString(), type: i.type || '', amount: numToString(i.amount) })) || [],
    };

    // react-hook-form setup
    const { register, handleSubmit, control, reset, formState: { errors, isDirty } } = useForm<ProfileFormData>({ defaultValues });
    const { fields: customExpenseFields, append: appendCustomExpense, remove: removeCustomExpense } = useFieldArray({ control, name: "customExpenses" });
    const { fields: debtFields, append: appendDebt, remove: removeDebt } = useFieldArray({ control, name: "debts" });
    const { fields: investmentFields, append: appendInvestment, remove: removeInvestment } = useFieldArray({ control, name: "investments" });

    // Effect to reset form and local goals
    useEffect(() => {
        reset(defaultValues);
        setLocalGoals(initialData.goals || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData, reset]);

    // onSave handler
    const onSave: SubmitHandler<ProfileFormData> = async (formData) => {
        setIsSaving(true); setError(null); setSuccessMessage(null);
        startLoading('fullPage', ["Updating your profile..."]);
        if (formData.dob && !isValid(parseISO(formData.dob))) { setError("Invalid Date of Birth."); setIsSaving(false); stopLoading(); return; }
        const apiPayload = {
            name: formData.name, dob: formData.dob || undefined, occupation: formData.occupation || undefined,
            annualSalary: formData.annualSalary === '' ? null : Number(formData.annualSalary),
            foodExpense: formData.foodExpense === '' ? null : Number(formData.foodExpense),
            transportExpense: formData.transportExpense === '' ? null : Number(formData.transportExpense),
            utilitiesExpense: formData.utilitiesExpense === '' ? null : Number(formData.utilitiesExpense),
            customExpenses: formData.customExpenses.map(e => ({category: e.category, amount: Number(e.amount)})).filter(e => e.category?.trim() && !isNaN(e.amount) && e.amount >= 0),
            debts: formData.debts.map(d => ({type: d.type, amount: Number(d.amount), emi: d.emi === '' ? undefined : Number(d.emi)})).filter(d => d.type?.trim() && !isNaN(d.amount) && d.amount >= 0),
            investments: formData.investments.map(i => ({type: i.type, amount: Number(i.amount)})).filter(i => i.type?.trim() && !isNaN(i.amount) && i.amount >= 0),
        };
        try {
            const response = await fetch('/api/user/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(apiPayload) });
            const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Failed');
            setSuccessMessage("Profile updated!"); setIsEditing(false); reset(formData);
        } catch (error) { setError(error instanceof Error ? error.message : "Error"); }
        finally { setIsSaving(false); stopLoading(); setTimeout(() => setSuccessMessage(null), 4000); }
    };

    // Cancel handler
    const handleCancel = () => { reset(defaultValues); setIsEditing(false); setError(null); setSuccessMessage(null); setShowAddGoalForm(false); setAddGoalError(null); setGoalToDelete(null); setDeleteGoalError(null); };

    // Add Goal Handler
     const handleAddGoal = async (goalData: { title: string, description?: string, targetAmount?: string, targetDate?: string }) => {
         const title = goalData.title?.trim(); if (!title) { setAddGoalError("Title required."); return; }
         setIsSavingGoal(true); setAddGoalError(null); startLoading('popup', ['Adding goal...']);
         try {
             const response = await fetch('/api/goals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(goalData), });
             const newGoal: LocalGoal = await response.json(); if (!response.ok) throw new Error(newGoal.message || 'Failed');
             setLocalGoals(prev => [newGoal, ...prev]); setShowAddGoalForm(false);
             const form = document.getElementById('inline-add-goal-form') as HTMLFormElement; form?.reset();
         } catch (err) { setAddGoalError(err instanceof Error ? err.message : "Error."); }
         finally { stopLoading(); setIsSavingGoal(false); }
     };

    // Delete Goal Handlers
     const openDeleteDialog = (goal: LocalGoal) => { setGoalToDelete(goal); setDeleteGoalError(null); };
     const confirmDeleteGoal = async () => {
         if (!goalToDelete) return; setIsDeletingGoal(true); setDeleteGoalError(null); startLoading('popup', ['Deleting goal...']);
         try {
             const response = await fetch(`/api/goals/${goalToDelete._id}`, { method: 'DELETE' });
             if (!response.ok) { const d=await response.json().catch(()=>{}); throw new Error(d.message || 'Failed'); }
             setLocalGoals(prev => prev.filter(g => g._id !== goalToDelete._id)); setGoalToDelete(null);
         } catch (err) { setDeleteGoalError(err instanceof Error ? err.message : "Error."); }
         finally { stopLoading(); setIsDeletingGoal(false); }
     };

    // --- Content Components Definitions ---

    const PersonalInfoContent = () => (
        <div className="p-4 md:p-6 text-white h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiUser/> Personal & Financial</h2>
            {isEditing ? (
                <div className='space-y-3 flex-1'>
                    <div className="space-y-1">
                        <Label htmlFor="name" className='text-xs'>Full Name</Label>
                        <Input id="name" {...register("name", { required: "Name is required." })} className="mt-1 h-9 text-sm bg-neutral-800/60 border-neutral-700 disabled:opacity-70" disabled={isSaving}/>
                        {errors.name && <span className="text-red-400 text-xs mt-0.5 block">{errors.name.message}</span>}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="dob" className='text-xs'>Date of Birth</Label>
                        <Controller name="dob" control={control} rules={{ required: "Date of Birth is required." }} render={({ field }) => ( <DatePicker id="dob" value={field.value ? parseISO(field.value) : undefined} onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')} inputClassName="mt-1 h-9 text-sm bg-neutral-800/60 border-neutral-700 w-full disabled:opacity-70" required disabled={isSaving}/> )}/>
                        {errors.dob && <span className="text-red-400 text-xs mt-0.5 block">{errors.dob.message}</span>}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="occupation" className='text-xs'>Occupation</Label>
                        <Input id="occupation" {...register("occupation")} placeholder="(Optional)" className="mt-1 h-9 text-sm bg-neutral-800/60 border-neutral-700 disabled:opacity-70" disabled={isSaving}/>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="annualSalary" className='text-xs'>Annual Salary (INR)</Label>
                        <Input id="annualSalary" type="number" min="0" {...register("annualSalary", { required: "Salary is required.", validate: value => value === '' || Number(value)>=0 || "Must be positive" })} placeholder="0" className="mt-1 h-9 text-sm bg-neutral-800/60 border-neutral-700 disabled:opacity-70" disabled={isSaving}/>
                        {errors.annualSalary && <span className="text-red-400 text-xs mt-0.5 block">{errors.annualSalary.message}</span>}
                    </div>
                </div>
            ) : (
                <div className='space-y-4 flex-1'>
                    <div><p className="text-xs text-neutral-400">Full Name</p><p className="text-base text-neutral-100 truncate">{defaultValues.name || <span className="text-neutral-500 italic text-sm">Not set</span>}</p></div>
                    <div><p className="text-xs text-neutral-400">Date of Birth</p><p className="text-base text-neutral-100">{formatDateDisplay(defaultValues.dob)}</p></div>
                    <div><p className="text-xs text-neutral-400">Occupation</p><p className="text-base text-neutral-100 truncate">{defaultValues.occupation || <span className="text-neutral-500 italic text-sm">Not set</span>}</p></div>
                    <div><p className="text-xs text-neutral-400">Annual Salary</p><p className="text-base text-neutral-100">{formatCurrencyDisplay(defaultValues.annualSalary)}</p></div>
                </div>
            )}
        </div>
    );

    const ExpensesContent = () => (
        <div className="p-4 md:p-6 text-white h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiShoppingBag/> Monthly Expenses (INR)</h2>
            <div className={cn("grid grid-cols-3 gap-x-4 mb-4", isEditing ? "gap-y-1" : "gap-y-4")}>
                 {isEditing ? (
                     <>
                         <div className='space-y-1'><Label htmlFor="foodExpense" className="text-xs">Food</Label><Input id="foodExpense" type="number" min="0" step="100" {...register("foodExpense")} className="mt-1 h-9 text-sm bg-neutral-800/60 border-neutral-700 disabled:opacity-70" disabled={isSaving}/></div>
                         <div className='space-y-1'><Label htmlFor="transportExpense" className="text-xs">Transport</Label><Input id="transportExpense" type="number" min="0" step="100" {...register("transportExpense")} className="mt-1 h-9 text-sm bg-neutral-800/60 border-neutral-700 disabled:opacity-70" disabled={isSaving}/></div>
                         <div className='space-y-1'><Label htmlFor="utilitiesExpense" className="text-xs">Utilities</Label><Input id="utilitiesExpense" type="number" min="0" step="100" {...register("utilitiesExpense")} className="mt-1 h-9 text-sm bg-neutral-800/60 border-neutral-700 disabled:opacity-70" disabled={isSaving}/></div>
                     </>
                 ) : (
                     <>
                         <div><p className="text-xs text-neutral-400">Food</p><p className="text-base text-neutral-100">{formatCurrencyDisplay(defaultValues.foodExpense)}</p></div>
                         <div><p className="text-xs text-neutral-400">Transport</p><p className="text-base text-neutral-100">{formatCurrencyDisplay(defaultValues.transportExpense)}</p></div>
                         <div><p className="text-xs text-neutral-400">Utilities</p><p className="text-base text-neutral-100">{formatCurrencyDisplay(defaultValues.utilitiesExpense)}</p></div>
                     </>
                 )}
            </div>
            <Label className={cn("block mb-2", isEditing ? "text-sm font-medium text-neutral-300" : "text-xs font-medium text-neutral-400")}>Other Recurring</Label>
            <div className="space-y-2 flex-1 overflow-y-auto max-h-[120px] pr-1 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-850 mb-2">
                 {isEditing && customExpenseFields.map((field, index) => ( <div key={field.id} className="flex items-center gap-2"> <Input placeholder="Category" {...register(`customExpenses.${index}.category`, { required: "Category required" })} required disabled={isSaving} className="text-sm h-9 bg-neutral-950 border-neutral-700 flex-1 disabled:opacity-70"/> <Input type="number" placeholder="Amount" min="0" {...register(`customExpenses.${index}.amount`, { required: "Amount required", validate: value => value === '' || Number(value)>=0 || ">= 0" })} required disabled={isSaving} className="text-sm h-9 bg-neutral-950 border-neutral-700 w-28 disabled:opacity-70"/> <button type="button" onClick={() => removeCustomExpense(index)} disabled={isSaving} className="p-1 text-neutral-500 hover:text-red-400 disabled:opacity-50"><FiTrash2 className="w-4 h-4"/></button> </div> ))}
                 {!isEditing && defaultValues.customExpenses.map((exp, index)=>( <div key={`display-exp-${index}`} className="flex justify-between items-center text-sm py-1 border-b border-neutral-800/50"> <span className="text-neutral-300">{exp.category || 'Unnamed'}</span> <span className="text-neutral-100 font-medium">{formatCurrencyDisplay(exp.amount)}</span> </div> ))}
                 {!isEditing && defaultValues.customExpenses.length === 0 && <p className="text-neutral-500 text-xs italic py-2">No other expenses added.</p>}
             </div>
             {isEditing && <button type="button" onClick={() => appendCustomExpense({ category: '', amount: '' })} disabled={isSaving} className="text-blue-400 text-xs hover:underline disabled:opacity-50 flex items-center gap-1"><FiPlus className="w-3 h-3"/> Add Expense</button>}
        </div>
    );

    const DebtsContent = () => (
        <div className="p-4 md:p-6 text-white h-full flex flex-col">
             <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiCreditCard/> Debts / EMIs (INR)</h2>
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[200px] pr-1 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-850 mb-2">
                 {isEditing && debtFields.map((field, index) => ( <div key={field.id} className="grid grid-cols-1 sm:grid-cols-7 gap-2 items-center p-2 rounded-md bg-neutral-800/30"> <Input placeholder="Type (Loan, CC)" {...register(`debts.${index}.type`, {required: "Type required"})} required className="text-sm h-9 bg-neutral-950 border-neutral-700 col-span-7 sm:col-span-3 disabled:opacity-70" disabled={isSaving}/> <Input type="number" placeholder="Total Amt" min="0" {...register(`debts.${index}.amount`, {required: "Amount required", validate: value => value === '' || Number(value)>=0 || ">= 0"})} required className="text-sm h-9 bg-neutral-950 border-neutral-700 col-span-3 sm:col-span-2 disabled:opacity-70" disabled={isSaving}/> <Input type="number" placeholder="EMI" min="0" {...register(`debts.${index}.emi`)} className="text-sm h-9 bg-neutral-950 border-neutral-700 col-span-3 sm:col-span-1 disabled:opacity-70" disabled={isSaving}/> <button type="button" onClick={() => removeDebt(index)} className="p-1 text-neutral-500 hover:text-red-400 justify-self-end col-span-1 disabled:opacity-50" disabled={isSaving}><FiTrash2 className="w-4 h-4"/></button> </div> ))}
                 {!isEditing && defaultValues.debts.map((debt, index)=>( <div key={`display-debt-${index}`} className="flex justify-between items-center text-sm py-1.5 border-b border-neutral-800/50"> <span className="text-neutral-300 flex-1 truncate pr-2">{debt.type || 'Unnamed Debt'}</span> <div className="text-right ml-2"> <span className="text-neutral-100 font-medium">{formatCurrencyDisplay(debt.amount)}</span> {debt.emi && Number(debt.emi) > 0 && <span className="text-xs text-neutral-400 block">(EMI: {formatCurrencyDisplay(debt.emi)})</span>} </div> </div> ))}
                 {!isEditing && defaultValues.debts.length === 0 && <p className="text-neutral-500 text-xs italic py-2">No debts added.</p>}
             </div>
             {isEditing && <button type="button" onClick={() => appendDebt({ type: '', amount: '', emi: '' })} disabled={isSaving} className="mt-auto text-blue-400 text-xs hover:underline disabled:opacity-50 flex items-center gap-1 pt-2"><FiPlus className="w-3 h-3"/> Add Debt/Loan</button>}
        </div>
    );

    const InvestmentsContent = () => (
         <div className="p-4 md:p-6 text-white h-full flex flex-col">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiTrendingUp/> Investments (INR)</h2>
               <div className="space-y-2 flex-1 overflow-y-auto max-h-[200px] pr-1 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-850 mb-2">
                  {isEditing && investmentFields.map((field, index) => ( <div key={field.id} className="flex items-center gap-2 p-2 rounded-md bg-neutral-800/30"> <Input placeholder="Investment Type" {...register(`investments.${index}.type`, { required: "Type required" })} required disabled={isSaving} className="text-sm h-9 bg-neutral-950 border-neutral-700 flex-1 disabled:opacity-70"/> <Input type="number" placeholder="Current Value" min="0" {...register(`investments.${index}.amount`, { required: "Value required", validate: value => value === '' || Number(value)>=0 || ">= 0" })} required disabled={isSaving} className="text-sm h-9 bg-neutral-950 border-neutral-700 w-32 disabled:opacity-70"/> <button type="button" onClick={() => removeInvestment(index)} disabled={isSaving} className="p-1 text-neutral-500 hover:text-red-400 disabled:opacity-70"><FiTrash2 className="w-4 h-4"/></button> </div> ))}
                  {!isEditing && defaultValues.investments.map((inv, index)=>( <div key={`display-inv-${index}`} className="flex justify-between items-center text-sm py-1.5 border-b border-neutral-800/50"> <span className="text-neutral-300 flex-1 truncate pr-2">{inv.type || 'Unnamed Investment'}</span> <span className="text-neutral-100 font-medium">{formatCurrencyDisplay(inv.amount)}</span> </div> ))}
                  {!isEditing && defaultValues.investments.length === 0 && <p className="text-neutral-500 text-xs italic py-2">No investments added.</p>}
              </div>
              {isEditing && <button type="button" onClick={() => appendInvestment({ type: '', amount: '' })} disabled={isSaving} className="mt-auto text-blue-400 text-xs hover:underline disabled:opacity-50 flex items-center gap-1 pt-2"><FiPlus className="w-3 h-3"/> Add Investment</button>}
         </div>
    );

    const GoalsContent = () => (
        <div className="p-4 md:p-6 text-white h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><FiTarget/> Financial Goals</h2>
                {isEditing && ( <button type="button" onClick={() => setShowAddGoalForm(prev => !prev)} disabled={isSaving || isSavingGoal} className={cn("p-1 rounded-full transition-colors disabled:opacity-50", showAddGoalForm ? "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700" : "text-blue-400 hover:text-blue-300 hover:bg-blue-900/50")}> {showAddGoalForm ? <FiXCircle className="w-4 h-4"/> : <FiPlus className="w-4 h-4"/>} </button> )}
            </div>
             <AnimatePresence>
                 {isEditing && showAddGoalForm && (
                    <motion.form id="inline-add-goal-form" initial={{height: 0, opacity: 0}} animate={{height:'auto', opacity: 1}} exit={{height: 0, opacity: 0}}
                       onSubmit={(e) => { e.preventDefault(); const target = e.target as typeof e.target & { title: {value:string}, description: {value:string}, amount: {value:string}, date: {value:string} }; handleAddGoal({ title: target.title.value, description: target.description.value, targetAmount: target.amount.value, targetDate: target.date.value }); }}
                       className="mb-4 p-3 border border-neutral-700 rounded-lg space-y-2 bg-neutral-800/50 overflow-hidden">
                         <h3 className='text-sm font-medium mb-1 text-neutral-200'>Add New Goal</h3>
                          {addGoalError && <p className='text-xs text-red-400 flex items-center gap-1'><FiAlertCircle size={14}/>{addGoalError}</p>}
                         <Input name="title" placeholder="Goal Title*" required className="h-8 text-sm bg-neutral-900 border-neutral-700" disabled={isSavingGoal}/>
                         <Input name="description" placeholder="Description" className="h-8 text-sm bg-neutral-900 border-neutral-700" disabled={isSavingGoal}/>
                         <Input name="amount" type="number" min="0" placeholder="Target Amount (Optional)" className="h-8 text-sm bg-neutral-900 border-neutral-700" disabled={isSavingGoal}/>
                         <Input name="date" type="date" className="h-8 text-sm bg-neutral-900 border-neutral-700 appearance-none px-2" disabled={isSavingGoal}/>
                         <div className='flex justify-end'> <Button type="submit" variant="secondary" size="sm" disabled={isSavingGoal}>{isSavingGoal? <FiLoader className='animate-spin w-3 h-3 mr-1'/> : null} {isSavingGoal? 'Adding...' : 'Add Goal'}</Button> </div>
                    </motion.form>
                 )}
             </AnimatePresence>
             <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[160px] pr-1 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-850 mb-2">
                 {localGoals && localGoals.length > 0 ? (
                     localGoals.map((goal: LocalGoal) => (
                         <div key={goal._id} className="group flex justify-between items-center text-sm py-1.5 border-b border-neutral-800/50">
                            <span className="text-neutral-200 font-medium truncate pr-2">{goal.title || 'Untitled Goal'}</span>
                            <div className='flex items-center gap-2'>
                               {goal.targetAmount != null && <span className="text-neutral-300 text-xs">{formatCurrencyDisplay(goal.targetAmount)}</span>}
                               {isEditing && ( <button type="button" onClick={() => openDeleteDialog(goal)} disabled={isSaving || isSavingGoal || isDeletingGoal} className="p-0.5 text-neutral-500 hover:text-red-400 disabled:opacity-50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity" aria-label={`Delete goal ${goal.title}`}> {isDeletingGoal && goalToDelete?._id === goal._id ? <FiLoader className="w-3.5 h-3.5 animate-spin"/> :<FiTrash2 className="w-3.5 h-3.5"/>} </button> )}
                            </div>
                         </div>
                     ))
                 ) : ( <p className="text-neutral-500 text-xs italic py-2">{isEditing ? "No goals yet. Use '+' to add." : "No financial goals set yet."}</p> )}
            </div>
             <div className="mt-auto pt-2"> <CustomLink href="/goals" loadingType='fullPage' className="text-sm text-blue-400 hover:underline hover:text-blue-300 transition-colors"> View & Manage All Goals → </CustomLink> </div>
        </div>
    );

    const SettingsContent = () => (
         <div className="p-4 md:p-6 text-white h-full flex flex-col">
             <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiSettings/> Settings</h2>
             <div className="mb-6"></div>
             <div className='space-y-4 flex-1'>
                 <div className="opacity-60"> <Label className='text-xs font-medium text-neutral-400'>Notification Preferences</Label> <p className='text-sm text-neutral-500 italic mt-1'>Configure email reports (feature pending).</p> </div>
                 <div className="opacity-60"> <Label className='text-xs font-medium text-neutral-400'>Data Management</Label> <p className='text-sm text-neutral-500 italic mt-1'>Export your data (feature pending).</p> </div>
             </div>
         </div>
     );

    // Prepare Card Data Array
    const profileCards: FocusCardData[] = [
        { title: "Personal Info", src: "/noise.webp", className: "lg:col-span-1 !h-auto", content: <PersonalInfoContent /> },
        { title: "Expenses", src: "/noise.webp", className: "lg:col-span-1 !h-auto", content: <ExpensesContent /> },
        { title: "Goals", src: "/noise.webp", className: "lg:col-span-1 !h-auto", content: <GoalsContent /> },
        { title: "Debts", src: "/noise.webp", className: "lg:col-span-1 !h-auto", content: <DebtsContent /> },
        { title: "Investments", src: "/noise.webp", className: "lg:col-span-1 !h-auto", content: <InvestmentsContent /> },
        { title: "Settings", src: "/noise.webp", className: "lg:col-span-1 !h-auto", content: <SettingsContent /> },
    ];

    // --- Main Form Render ---
    return (
        <div className="space-y-6 pb-20">
            {/* Sticky Header */}
             <div className="sticky top-[65px] z-30 mb-6 -mx-4 md:-mx-6 lg:-mx-10"> {/* Increased z-index */}
                 <div className="flex items-center justify-between bg-black/70 backdrop-blur-md p-4 rounded-lg border border-neutral-800/60 shadow-lg mx-4 md:mx-6 lg:mx-10">
                     <h1 className="text-2xl md:text-3xl font-bold text-white">Your Profile</h1>
                     <div className='flex items-center gap-4'>
                         <div className="flex items-center space-x-2"> <Checkbox id="profile-blur-toggle" checked={isBlurEnabled} onCheckedChange={(checked) => setIsBlurEnabled(Boolean(checked))} disabled={isEditing} className='disabled:opacity-40'/> <Label htmlFor="profile-blur-toggle" className="text-xs text-neutral-400 cursor-pointer select-none">Focus Effect</Label> </div>
                         <div className="flex gap-3"> {isEditing ? ( <> <Button variant="secondary" size="sm" type="button" onClick={handleCancel} disabled={isSaving}> <FiXCircle className="w-4 h-4 mr-1.5" /> Cancel </Button> <Button variant="default" size="sm" type="submit" form="profile-form" disabled={isSaving || !isDirty}> {isSaving ? <FiLoader className="w-4 h-4 animate-spin mr-1.5" /> : <FiSave className="w-4 h-4 mr-1.5" />} {isSaving ? 'Saving...' : 'Save'} </Button> </> ) : ( <Button variant="outline" size="sm" type="button" onClick={() => setIsEditing(true)}> <FiEdit className="w-4 h-4 mr-1.5" /> Edit </Button> )} </div>
                     </div>
                 </div>
            </div>
            {/* Status Messages Area */}
             <div className="h-10 mb-2 px-4 md:px-6 lg:px-10"> <AnimatePresence>{successMessage && <motion.div className="p-3 rounded-md bg-green-900/70 border border-green-700 text-green-200 text-sm text-center">{successMessage}</motion.div>}</AnimatePresence> <AnimatePresence>{error && <motion.div className="p-3 rounded-md bg-red-900/70 border border-red-700 text-red-300 text-sm text-center">{error}</motion.div>}</AnimatePresence> <AnimatePresence>{deleteGoalError && <motion.div className="p-3 rounded-md bg-red-900/70 border border-red-700 text-red-300 text-sm text-center">{deleteGoalError}</motion.div>}</AnimatePresence> </div>
            {/* Form OR Div wrapping FocusCards */}
            {isEditing ? ( <form id="profile-form" onSubmit={handleSubmit(onSave)}> <FocusCards cards={profileCards} /> </form> )
             : ( <div> <FocusCards cards={profileCards} /> </div> )}
             {/* Floating Save/Cancel Bar */}
             <AnimatePresence>
                 {isEditing && (
                     <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} transition={{ duration: 0.3 }}
                         className="fixed bottom-0 left-0 right-0 md:left-60 lg:left-64 z-40 p-4 bg-neutral-950/95 backdrop-blur-sm border-t border-neutral-700/50 flex justify-end gap-3 shadow-lg"> {/* Increased z-index */}
                         <Button variant="secondary" size="sm" type="button" onClick={handleCancel} disabled={isSaving}> <FiXCircle className="w-4 h-4 mr-1.5" /> Cancel </Button>
                         <Button variant="default" size="sm" type="submit" form="profile-form" disabled={isSaving || !isDirty}> {isSaving ? <FiLoader className="w-4 h-4 animate-spin mr-1.5" /> : <FiSave className="w-4 h-4 mr-1.5" />} {isSaving ? 'Saving...' : 'Save Changes'} </Button>
                     </motion.div>
                 )}
             </AnimatePresence>
             {/* Delete Confirmation Dialog */}
             <DeleteGoalDialog isOpen={!!goalToDelete} onOpenChange={(open) => { if (!open) setGoalToDelete(null); setDeleteGoalError(null); }} onConfirmDelete={confirmDeleteGoal} goalTitle={goalToDelete?.title || ''} isDeleting={isDeletingGoal}/>
        </div>
    );
}

// --- Main Exported Component (Wraps with Context Providers) ---
export default function ProfileClientPageWrapper(props: ProfileClientPageProps) {
    return ( <FocusEffectProvider> <ProfileFormContent {...props} /> </FocusEffectProvider> );
}