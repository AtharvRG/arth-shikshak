// src/components/goals/GoalDetailView.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Goal as GoalType } from '@/models/Goal';
import { FiMessageSquare, FiInfo, FiLoader, FiAlertCircle, FiDollarSign, FiCalendar, FiRefreshCw, FiEdit2, FiSave, FiXCircle, FiCheckCircle, FiTrendingUp, FiTrash2 } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // Use standard Button
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useLoading } from '@/context/LoadingContext';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format, parseISO, isValid } from 'date-fns';

// Props Interface
interface GoalDetailViewProps {
    goal: Omit<GoalType, '_id' | 'userId' | 'targetDate' | 'createdAt' | 'updatedAt'> &
          { _id: string; userId: string; targetDate?: string; createdAt: string; updatedAt: string; aiSuggestions?: string | null; currentAmount?: number };
    // *** NEW: Callback to notify parent about deletion ***
    onDelete: () => void; // Changed from (goalId: string) => void
}

// Formatting helpers
const formatCurrencyDisplay = (value: any): string => { const num = Number(value); if (isNaN(num) || value === '' || value === null || value === undefined) return 'Not Set'; return `₹ ${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`; };
const formatDateDisplay = (value: any): string => { if (!value) return 'Not Set'; try { const date = typeof value === 'string' ? new Date(value) : value; if (!isValid(date)) return 'Invalid Date'; return format(date, 'PPP'); } catch { return 'Invalid Date'; } };
const numToString = (val: any): string => (val === null || val === undefined) ? '' : String(val);


export default function GoalDetailView({ goal, onDelete }: GoalDetailViewProps) {
    const [suggestions, setSuggestions] = useState<string | null>(goal.aiSuggestions || null);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [suggestionError, setSuggestionError] = useState<string | null>(null);
    // *** State for Progress Editing ***
    const [isEditingProgress, setIsEditingProgress] = useState(false);
    const [currentSavedAmount, setCurrentSavedAmount] = useState<number | null>(goal.currentAmount ?? null); // Local state reflects saved value
    const [editedAmount, setEditedAmount] = useState<string>(numToString(goal.currentAmount)); // Input field value
    const [isSavingProgress, setIsSavingProgress] = useState(false);
    const [progressError, setProgressError] = useState<string | null>(null);
    const [isDeletingGoalLocal, setIsDeletingGoalLocal] = useState(false); // Local state for button visuals if needed
    const [deleteError, setDeleteError] = useState<string|null>(null);

    const { startLoading } = useLoading();
    const router = useRouter();

    // Reset edited amount when not editing or goal changes
    useEffect(() => {
        setCurrentSavedAmount(goal.currentAmount ?? null); // Sync with prop
        setEditedAmount(numToString(goal.currentAmount)); // Reset input field value
        setIsEditingProgress(false); // Ensure edit mode is off initially
    }, [goal.currentAmount, goal._id]); // Reset if goal changes

    // Fetch/Regenerate AI suggestions
    const fetchOrRegenerateSuggestions = useCallback(async (regenerate = false) => {
        setIsLoadingSuggestions(true); setSuggestionError(null);
        if (!regenerate && !suggestions) { setSuggestions(null); } // Clear only when fetching fresh
        try {
            const method = regenerate ? 'PUT' : 'POST';
            const response = await fetch(`/api/goals/${goal._id}/suggestions`, { method });
            const data = await response.json();
            if (!response.ok) { throw new Error(data.message || "Failed."); }
            setSuggestions(data.suggestions);
        } catch (err) { setSuggestionError(err instanceof Error ? err.message : "Error."); if (!regenerate) setSuggestions(null); }
        finally { setIsLoadingSuggestions(false); }
    }, [goal._id, suggestions]); // Include suggestions in deps to potentially avoid refetch if already present

    // Effect to fetch initial suggestions if needed
    useEffect(() => {
        // Fetch only if aiSuggestions was initially undefined or null
        if (goal.aiSuggestions === undefined || goal.aiSuggestions === null) {
             fetchOrRegenerateSuggestions(false);
        } else {
             setSuggestions(goal.aiSuggestions); // Ensure state matches prop initially
        }
     // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [goal._id, goal.aiSuggestions]);
    
    const handleDeleteClick = () => {
        // Just call the callback passed from the parent page
        // Parent page (GoalsPage) will handle opening the confirmation dialog
        onDelete();
    };

    // *** CORRECTED: Start a NEW general chat, passing goal info ***
    const handleStartGoalChat = async () => {
        // Prepare the initial prompt including goal details
        let initialQuery = `Let's discuss my financial goal: "${goal.title}".`;
        if (goal.description) initialQuery += `\nDescription: ${goal.description}.`;
        if (goal.targetAmount) initialQuery += `\nTarget: ${formatCurrencyDisplay(goal.targetAmount)}.`;
        if (goal.targetDate) initialQuery += `\nDue: ${formatDateDisplay(goal.targetDate)}.`;
        // Optionally add current progress or AI suggestions if available
        if (suggestions) initialQuery += `\n\nCurrent AI Suggestions:\n${suggestions}\n\nWhat steps should I focus on first?`;
        else initialQuery += `\nWhat are the first few steps I should take?`;

        // Trigger full page loader because we are navigating
        startLoading('fullPage', ["Starting goal-focused chat..."]);

        try {
            console.log("Calling API to start new chat session for goal focus...");
            // Call the standard 'new chat' endpoint
            const response = await fetch('/api/chat/new', {
                method: 'POST',
                // We won't pre-populate the message in the DB,
                // but we'll pass the detailed query via URL param
            });
            if (!response.ok) {
                 const errData = await response.json().catch(()=>({}));
                 throw new Error(errData.message || 'Failed to start new chat session.');
            }
            const { chatId } = await response.json();
            console.log("New chat created for goal discussion, ID:", chatId, "Redirecting...");
            // Redirect to the *standard* chat page, passing the detailed query
            router.push(`/chat/${chatId}?q=${encodeURIComponent(initialQuery)}`);
            // stopLoading() handled by NavigationEvents

        } catch (err) {
            console.error("Error starting goal chat:", err);
            startLoading(null); // Stop loading on error
            alert(`Error: ${err instanceof Error ? err.message : 'Could not start chat.'}`); // Show error
        }
    };
    const handleSaveProgress = async () => {
        const amount = Number(editedAmount); // Convert input string to number
        if (isNaN(amount) || amount < 0) {
            setProgressError("Please enter a valid non-negative amount."); return;
        }
        setIsSavingProgress(true); setProgressError(null);
        try {
             const response = await fetch(`/api/goals/${goal._id}`, { // Call PUT endpoint
                 method: 'PUT',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ currentAmount: amount }), // Send the new amount
             });
             const result = await response.json();
             if (!response.ok) { throw new Error(result.message || 'Failed.'); }
             setCurrentSavedAmount(result.currentAmount); // Update local state with response
             setIsEditingProgress(false); // Exit edit mode
        } catch (err) { setProgressError(err instanceof Error ? err.message : "Error."); }
        finally { setIsSavingProgress(false); }
    };

    // --- Calculate progress percentage ---
    const progressPercent = useMemo(() => {
        if (goal.targetAmount && goal.targetAmount > 0 && currentSavedAmount !== null && currentSavedAmount >= 0) {
            // Calculate percentage, clamp between 0 and 100
            return Math.min(100, Math.max(0, (currentSavedAmount / goal.targetAmount) * 100));
        }
        return 0; // Default to 0 if no target or current amount
    }, [currentSavedAmount, goal.targetAmount]); // Recalculate when these change


    return (
        <div className="space-y-4 text-sm text-neutral-300 p-1">
            {/* Goal Details */}
            {goal.description && (<p className="italic text-neutral-400 border-l-2 border-neutral-600 pl-3 text-xs">{goal.description}</p>)}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs border-t border-neutral-700/50 pt-3 mt-3">
                 {goal.targetAmount != null && ( <div className='flex items-center gap-1.5 text-neutral-400'> <FiDollarSign className='w-3.5 h-3.5'/> Target: <span className='font-medium text-neutral-100'>{formatCurrencyDisplay(goal.targetAmount)}</span> </div> )}
                 {goal.targetDate && ( <div className='flex items-center gap-1.5 text-neutral-400'> <FiCalendar className='w-3.5 h-3.5'/> Due: <span className='font-medium text-neutral-100'>{formatDateDisplay(goal.targetDate)}</span> </div> )}
            </div>

             {/* --- Progress Section --- */}
             <div className="space-y-2 border-t border-neutral-700/50 pt-3 mt-3">
                 <div className="flex justify-between items-center min-h-[28px]"> {/* Ensure consistent height */}
                    <Label className='text-sm font-medium text-neutral-300 flex items-center gap-1.5'><FiTrendingUp className='w-4 h-4'/> Current Progress</Label>
                    {!isEditingProgress && ( // Show Edit button only in display mode
                        <Button variant="ghost" size="sm" className='h-6 px-1 py-0 text-xs text-neutral-400 hover:text-blue-400' onClick={() => { setEditedAmount(numToString(currentSavedAmount)); setIsEditingProgress(true); setProgressError(null); }}>
                            <FiEdit2 className="w-3 h-3 mr-1"/> Edit
                        </Button>
                    )}
                 </div>
                 {isEditingProgress ? (
                     // Edit Mode Input Form
                     <div className='space-y-2 p-2 bg-neutral-800/40 rounded-md border border-neutral-700/50'>
                        <div className="flex items-center gap-2">
                             <span className="text-sm font-medium text-neutral-300">₹</span>
                             <Input
                                 type="number"
                                 value={editedAmount}
                                 onChange={(e) => setEditedAmount(e.target.value)}
                                 min="0"
                                 step="100" // Adjust step if needed
                                 placeholder="Enter saved amount"
                                 disabled={isSavingProgress}
                                 className="h-8 text-sm bg-neutral-900 border-neutral-600 flex-1"
                                 aria-label='Current saved amount'
                             />
                        </div>
                        {progressError && <p className="text-xs text-red-400 flex items-center gap-1"><FiAlertCircle size={14}/>{progressError}</p>}
                        <div className="flex justify-end gap-2 pt-1">
                             <Button variant="ghost" size="sm" onClick={() => {setIsEditingProgress(false); setProgressError(null);}} disabled={isSavingProgress} className='h-7 text-xs px-2'>Cancel</Button>
                             <Button variant="secondary" size="sm" onClick={handleSaveProgress} disabled={isSavingProgress} className='h-7 text-xs px-2'>
                                 {isSavingProgress ? <FiLoader className="animate-spin w-3 h-3 mr-1"/> : <FiSave className="w-3 h-3 mr-1"/>}
                                 Save
                             </Button>
                        </div>
                     </div>
                 ) : (
                     // Display Mode Progress
                     <div className='pt-1'>
                        <p className='text-lg font-semibold text-green-400 mb-1.5'>{formatCurrencyDisplay(currentSavedAmount)}</p>
                        {goal.targetAmount && goal.targetAmount > 0 && ( // Show progress bar only if target exists
                            <div className='space-y-1'>
                                 <Progress value={progressPercent} className="h-1.5" indicatorColor={cn(progressPercent >= 100 ? 'bg-green-500' : progressPercent > 66 ? 'bg-lime-500' : progressPercent > 33 ? 'bg-yellow-500' : 'bg-blue-500')}/>
                                 <p className='text-xs text-neutral-500 text-right'>{progressPercent.toFixed(0)}% Funded</p>
                            </div>
                        )}
                    </div>
                 )}
             </div>
             {/* --- End Progress Section --- */}


            {/* AI Suggestions Section */}
            <div className="border-t border-neutral-700/50 pt-3 mt-3 space-y-2">
                 <div className='flex justify-between items-center'>
                    <h4 className='font-semibold text-base text-neutral-100 flex items-center gap-2'><FiInfo /> AI Suggestions</h4>
                    {(suggestions || suggestionError) && !isLoadingSuggestions && (
                        <Button variant="ghost" size="sm" onClick={() => fetchOrRegenerateSuggestions(true)} className='h-7 px-1.5 py-0.5 text-xs text-neutral-400 hover:text-blue-400 hover:bg-neutral-700/50 disabled:opacity-50' disabled={isLoadingSuggestions}>
                             <FiRefreshCw className="w-3 h-3 mr-1"/> {suggestionError ? 'Retry' : 'Regenerate'}
                         </Button>
                    )}
                 </div>
                 {isLoadingSuggestions ? ( <div className="flex items-center gap-2 text-xs text-neutral-400 p-3 bg-neutral-800/40 rounded-md animate-pulse"> <FiLoader className="animate-spin w-3 h-3"/> Fetching suggestions... </div> )
                  : suggestionError ? ( <div className="flex items-center gap-2 text-xs text-red-400 p-3 bg-red-900/30 border border-red-700/50 rounded-md"> <FiAlertCircle className="w-3.5 h-3.5"/> {suggestionError}</div> )
                  : suggestions ? ( <div className="text-xs p-3 bg-neutral-800/50 border border-neutral-700/50 rounded-md prose prose-xs prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5"> <ReactMarkdown remarkPlugins={[remarkGfm]}>{suggestions}</ReactMarkdown> </div> )
                  : ( <Button variant="secondary" size="sm" onClick={() => fetchOrRegenerateSuggestions(false)} className='h-8' disabled={isLoadingSuggestions}> Get AI Suggestions </Button> )}
            </div>

            {/* Chat Button */}
            <div className='pt-4 flex justify-end'>
                <Button size="sm" onClick={handleStartGoalChat} variant="default">
                    <FiMessageSquare className='w-4 h-4 mr-2'/> Chat about this Goal
                </Button>
                <span className="w-80" /> 
                <Button
                    variant="destructive" size="sm"
                    onClick={handleDeleteClick} // Call the simplified handler
                    disabled={isDeletingGoalLocal} // Optional local disabling
                    className="flex items-center gap-1.5 text-red-400 bg-red-900/30 hover:bg-red-900/50 border border-red-800/50"
                >
                     {/* Show loader based on local state if desired */}
                     {isDeletingGoalLocal ? <FiLoader className="w-4 h-4 animate-spin"/> : <FiTrash2 className="w-4 h-4" />}
                     {isDeletingGoalLocal ? 'Deleting...' : 'Delete Goal'}
                </Button>
                 {/* Action Buttons Footer */}


            </div>
        </div>
    );
}