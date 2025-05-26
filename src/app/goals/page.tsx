// src/app/goals/page.tsx
"use client"; // This page uses client-side state and hooks

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar'; // Main application navigation
import { ExpandableCardGrid, ExpandableCardData } from '@/components/ui/expandable-card'; // Component for the expanding card grid
import { Input } from '@/components/ui/input'; // Styled input component
import { Label } from '@/components/ui/label'; // Styled label component
import { Button } from '@/components/ui/button'; // Standard button component
import { FiPlus, FiTarget, FiLoader, FiAlertCircle, FiSave, FiXCircle, FiDollarSign, FiCalendar, FiArrowRight, FiTrendingUp, FiInfo, FiZap, FiTrash2 } from 'react-icons/fi'; // Icons
import { cn } from '@/lib/utils'; // Utility for merging class names
import { format, parseISO, isValid } from 'date-fns'; // Date utility functions
import { useLoading } from '@/context/LoadingContext'; // Global loading indicator context
import { AnimatePresence, motion } from 'framer-motion'; // For animations (add goal form)
import { useRouter } from 'next/navigation'; // For potential redirects
import GoalDetailView from '@/components/goals/GoalDetailView'; // Component for expanded goal view
import { Goal as GoalType } from '@/models/Goal'; // Type definition for Goal data
import { Progress } from '@/components/ui/progress'; // Progress bar component
import ReactMarkdown from 'react-markdown'; // For rendering AI suggestion snippets
import remarkGfm from 'remark-gfm'; // For GFM Markdown features
import DeleteGoalDialog from '@/components/goals/DeleteGoalDialog'; // Import the delete confirmation dialog

// Define Goal type matching backend response (with string IDs expected from JSON serialization)
interface DisplayGoal {
    _id: string;
    userId: string;
    title: string;
    description?: string;
    targetAmount?: number;
    targetDate?: string; // Date as string (YYYY-MM-DD or ISO)
    currentAmount?: number;
    createdAt: string;
    updatedAt: string;
    aiSuggestions?: string | null;
}

// Formatting helper for currency
const formatCurrencyDisplay = (value: string | number | null | undefined): string => {
    const num = Number(value);
    if (isNaN(num) || value === '' || value === null || value === undefined) return 'N/A';
    return `₹ ${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};
// Formatting helper for dates
const formatDateDisplay = (value: string | Date | null | undefined): string => {
    if (!value) return 'N/A';
    try {
        const date = typeof value === 'string' ? parseISO(value) : value;
        if (!isValid(date)) return 'Invalid Date';
        return format(date, 'PPP'); // e.g., Apr 29th, 2025
    } catch {
        return 'Invalid Date';
    }
};

// Helper to get a snippet of AI suggestions for the preview card
const getSuggestionSnippet = (suggestions: string | null | undefined): string | null => {
    if (!suggestions) return null;
    const lines = suggestions.split('\n');
    let snippet = '';
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('*') || trimmedLine.startsWith('-')) {
            snippet = trimmedLine.substring(1).trim(); break;
        }
        if (trimmedLine.length > 0 && snippet.length === 0) { snippet = trimmedLine; }
    }
    if (!snippet) snippet = suggestions.substring(0, 110).trim();
    if (snippet.length > 110) snippet = snippet.substring(0, 110).trimEnd() + "...";
    return snippet || null;
};


// Main Goals Page Component
export default function GoalsPage() {
    // State Management
    const [goals, setGoals] = useState<DisplayGoal[]>([]); // Holds the list of user's goals
    const [isLoadingGoals, setIsLoadingGoals] = useState(true); // Loading state for initial goal fetch
    const [errorLoading, setErrorLoading] = useState<string | null>(null); // Error message during initial fetch
    const [isAddingGoal, setIsAddingGoal] = useState(false); // Controls visibility of the "Add Goal" form
    const [isSavingGoal, setIsSavingGoal] = useState(false); // Loading state for the "Save Goal" button
    const [addGoalError, setAddGoalError] = useState<string | null>(null); // Error specific to the add goal form
    // State for the "Add Goal" form fields
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [newGoalDesc, setNewGoalDesc] = useState('');
    const [newGoalAmount, setNewGoalAmount] = useState('');
    const [newGoalDate, setNewGoalDate] = useState('');
    // State for suggestion generation loading (specific to a card)
    const [generatingSuggestionId, setGeneratingSuggestionId] = useState<string | null>(null);
    // State for delete confirmation dialog
    const [goalToDelete, setGoalToDelete] = useState<DisplayGoal | null>(null); // Stores the goal object to be deleted
    const [isDeleting, setIsDeleting] = useState(false); // Loading state for the delete confirmation button
    const [deleteError, setDeleteError] = useState<string | null>(null); // Error specific to deletion action

    // Hooks
    const { startLoading, stopLoading } = useLoading(); // Global loading indicator for page transitions
    const router = useRouter(); // Next.js router for navigation

    // Fetch Goals Function (memoized with useCallback)
    const fetchGoals = useCallback(async () => {
        setIsLoadingGoals(true); setErrorLoading(null);
        try {
            const response = await fetch('/api/goals'); // GET request to fetch goals
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to fetch goals');
            }
            const data: DisplayGoal[] = await response.json();
            setGoals(data); // Update state with fetched goals
        } catch (err) {
            console.error("Error fetching goals:", err);
            setErrorLoading(err instanceof Error ? err.message : "Could not load goals.");
            setGoals([]); // Clear goals on error
        } finally {
            setIsLoadingGoals(false); // Update loading state
        }
    }, []); // Empty dependency array - function reference is stable

    // Effect Hook to fetch goals when the component mounts
    useEffect(() => {
        startLoading('fullPage', ["Loading your financial goals..."]); // Show loader on initial page load
        fetchGoals().finally(() => stopLoading()); // Fetch data and stop loader when done
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchGoals]); // Depend only on the stable fetchGoals function


    // Function to handle submitting the "Add New Goal" form
    const handleAddGoalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent default browser form submission
        const title = newGoalTitle.trim();
        if (!title) { setAddGoalError("Goal title is required."); return; } // Basic client-side validation

        setIsSavingGoal(true); setAddGoalError(null); // Set loading state, clear errors

        try {
            // Call the POST API endpoint to create the new goal
            const response = await fetch('/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title,
                    description: newGoalDesc.trim() || undefined, // Send description if provided
                    targetAmount: newGoalAmount || undefined, // Send amount if provided
                    targetDate: newGoalDate || undefined, // Send date if provided
                }),
            });
            const result = await response.json(); // Parse the API response
            if (!response.ok) { throw new Error(result.message || 'Failed to add goal.'); } // Handle API errors

            setGoals(prev => [result, ...prev]); // Add the newly created goal to the beginning of the local list
            // Reset form fields and hide the form
            setNewGoalTitle(''); setNewGoalDesc(''); setNewGoalAmount(''); setNewGoalDate('');
            setIsAddingGoal(false);

        } catch (err) {
            console.error("Error adding goal:", err);
            setAddGoalError(err instanceof Error ? err.message : "Could not save goal."); // Set specific error state for the form
        } finally {
            setIsSavingGoal(false); // Reset loading state for the save button
        }
    };

    // Function to generate AI suggestions for a specific goal (called from preview card button)
    const generateSuggestionsForGoal = async (goalId: string, event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent the card from expanding when clicking the button
        event.preventDefault();
        setGeneratingSuggestionId(goalId); // Indicate loading specifically for this card
        setErrorLoading(null); // Clear general loading errors

        try {
            startLoading('popup', ["Generating AI suggestions..."]); // Use popup loader for this action
            const response = await fetch(`/api/goals/${goalId}/suggestions`, { method: 'POST' }); // Call API to generate suggestions
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to get suggestions.");

            // Update the specific goal in the local state with the new suggestions
            setGoals(prevGoals =>
                prevGoals.map(g =>
                    g._id === goalId ? { ...g, aiSuggestions: data.suggestions } : g
                )
            );
            console.log(`Suggestions generated and updated locally for ${goalId}`);

        } catch (err) {
            console.error("Suggestion generation failed:", err);
            // Notify user of the error (could use a toast notification library)
            alert(`Error generating suggestions: ${err instanceof Error ? err.message : 'Unknown error'}`);
            setErrorLoading(err instanceof Error ? err.message : "Could not generate suggestions.");
        } finally {
            setGeneratingSuggestionId(null); // Reset loading state for this card
            stopLoading(); // Stop the global popup loader
        }
    };

    // --- Delete Goal Logic ---
    // Opens the confirmation dialog
    const openDeleteDialog = (goal: DisplayGoal, event?: React.MouseEvent) => {
        event?.stopPropagation(); // Prevent card expansion if clicked on preview action
        event?.preventDefault();
        setGoalToDelete(goal); // Set the goal to be deleted, which triggers the dialog
        setDeleteError(null); // Clear previous delete errors
    };

    // Performs the actual deletion after confirmation
    const confirmDeleteGoal = async () => {
        if (!goalToDelete) return;

        setIsDeleting(true); // Show loading in dialog button
        setDeleteError(null);
        // Optionally show a small loader: startLoading('popup', ['Deleting goal...']);

        try {
            const response = await fetch(`/api/goals/${goalToDelete._id}`, { method: 'DELETE' }); // Call delete API
            if (!response.ok) {
                const errData = await response.json().catch(() => ({ message: 'Failed to delete goal.' }));
                throw new Error(errData.message);
            }
            // Remove deleted goal from local state
            setGoals(prev => prev.filter(g => g._id !== goalToDelete._id));
            console.log(`Goal ${goalToDelete._id} deleted.`);
            setGoalToDelete(null); // Close the dialog

        } catch (err) {
            console.error("Error deleting goal:", err);
            setDeleteError(err instanceof Error ? err.message : "Could not delete goal.");
            // Keep dialog open to show error by not setting goalToDelete to null here
        } finally {
            setIsDeleting(false); // Stop loading indicator in dialog
            // stopLoading(); // Stop global loader if used
        }
    };
    // --- End Delete Goal Logic ---

    // Map fetched goals data to the format required by ExpandableCardGrid
    const goalItems: ExpandableCardData[] = goals.map(goal => {
        const suggestionSnippet = getSuggestionSnippet(goal.aiSuggestions);
        const currentAmount = Number(goal.currentAmount ?? 0);
        const targetAmount = Number(goal.targetAmount ?? 0);
        const progressPercent = (targetAmount > 0 && currentAmount >= 0) ? Math.min(100, Math.max(0, (currentAmount / targetAmount) * 100)) : 0;
        const isGenerating = generatingSuggestionId === goal._id;
        const isBeingDeleted = goalToDelete?._id === goal._id && isDeleting; // Check if this card's delete is in progress

        return {
            id: goal._id, // Unique ID for animation
            title: goal.title, // Title for collapsed/expanded card
            // Description shown in collapsed card
            description: goal.description?.substring(0, 100) + (goal.description && goal.description.length > 100 ? '...' : '') || `Target: ${goal.targetAmount ? formatCurrencyDisplay(goal.targetAmount) : 'N/A'}`,
            src: "/noise.webp", // Fallback image path
            className: "!p-0 bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700", // Base styling applied via card data

            // Custom JSX for the collapsed card preview
            previewContent: (
                <div className="flex flex-col h-full p-5 text-white">
                    {/* Top: Title & Description */}
                    <div className="flex-1 mb-3 overflow-hidden">
                        <h3 className="font-semibold text-lg text-neutral-100 truncate"> {goal.title} </h3>
                        <p className="text-neutral-400 text-sm line-clamp-2 mt-1"> {goal.description || `Target: ${goal.targetAmount ? formatCurrencyDisplay(goal.targetAmount) : 'Not set'}`} </p>
                    </div>
                    {/* Middle: AI Suggestion Snippet OR Generate Button */}
                    <div className="mb-3 min-h-[60px] flex flex-col justify-center border-t border-b border-neutral-800/60 py-2">
                       {goal.aiSuggestions ? (
                           <div className={cn("text-xs text-neutral-400 italic", "prose prose-xs prose-invert max-w-none", "prose-p:my-0.5 prose-ul:my-0.5 prose-li:my-0", "line-clamp-3")}>
                               <span className='not-italic font-medium text-neutral-300 flex items-center gap-1 text-xs mb-0.5'><FiInfo className='w-3 h-3'/> AI Tip:</span>
                               <ReactMarkdown remarkPlugins={[remarkGfm]}>{suggestionSnippet || 'Suggestion available...'}</ReactMarkdown>
                           </div>
                       ) : (
                           <Button variant="link" size="sm" onClick={(e) => generateSuggestionsForGoal(goal._id, e)} disabled={isGenerating || isBeingDeleted} className="text-xs h-auto p-0 text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed justify-start">
                               {isGenerating ? ( <><FiLoader className="w-3 h-3 mr-1 animate-spin"/> Generating...</> ) : ( <><FiZap className="w-3 h-3 mr-1"/> Generate AI Suggestions</> )}
                           </Button>
                       )}
                    </div>
                    {/* Bottom: Progress Bar and Expand Text */}
                    <div className="mt-auto space-y-2">
                        {targetAmount > 0 && ( // Show progress only if target is set
                             <div className="space-y-1">
                                 <Progress value={progressPercent} className="h-1.5" indicatorColor={cn(progressPercent >= 100 ? 'bg-green-500' : 'bg-blue-500')}/>
                                 <p className='text-xs text-neutral-500 text-right'>{progressPercent.toFixed(0)}% Funded</p>
                             </div>
                        )}
                        <div className="text-right"> <span className="text-xs text-neutral-500 group-hover/collapsed_card:text-blue-400 flex items-center justify-end gap-1 transition-colors duration-200"> Expand Details <FiArrowRight className="w-3 h-3 transition-transform group-hover/collapsed_card:translate-x-1" /> </span> </div>
                    </div>
                </div>
            ),
             // Actions shown on hover in collapsed view (Delete Button)
             previewActions: (
                <button
                     onClick={(e) => openDeleteDialog(goal, e)} // Opens the confirmation dialog
                     disabled={isDeleting || isGenerating} // Disable if any delete/generation is happening
                     className="p-1.5 rounded-full text-neutral-500 bg-neutral-800/50 hover:bg-red-900/40 hover:text-red-400 transition-colors disabled:opacity-50"
                     aria-label={`Delete goal ${goal.title}`}
                 >
                     {/* Show loader if this specific goal is being deleted via preview */}
                     {isDeleting && goalToDelete?._id === goal._id ? <FiLoader className="w-3.5 h-3.5 animate-spin"/> : <FiTrash2 className="w-3.5 h-3.5"/>}
                 </button>
             ),
            // Expanded content view uses GoalDetailView component
            // Pass the openDeleteDialog function to handle delete from within detail view
            content: () => <GoalDetailView goal={goal} onDelete={() => openDeleteDialog(goal)} />,
        };
    });

    return (
        <div className="flex flex-col min-h-screen bg-black text-white">
            <Navbar />
            <main className="flex-1 p-4 md:p-6 lg:p-10">
                 {/* Header section */}
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6 md:mb-8 max-w-5xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2"><FiTarget/> Your Goals</h1>
                    <Button variant={isAddingGoal ? "secondary" : "default"} size="sm" onClick={() => setIsAddingGoal(prev => !prev)} className='flex-shrink-0'>
                       {isAddingGoal ? <FiXCircle className="w-4 h-4 mr-1.5" /> : <FiPlus className="w-4 h-4 mr-1.5" />}
                       {isAddingGoal ? 'Cancel Add' : 'Add New Goal'}
                    </Button>
                </div>

                {/* Add New Goal Form (Animated) */}
                 <AnimatePresence>
                    {isAddingGoal && (
                        <motion.div key="add-goal-form" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1, marginBottom: '1.5rem' }} exit={{ height: 0, opacity: 0, marginBottom: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden max-w-2xl mx-auto">
                             <form onSubmit={handleAddGoalSubmit} className='p-4 md:p-6 bg-neutral-900 rounded-lg border border-neutral-800 space-y-4'>
                                <h2 className='text-xl font-semibold mb-3 text-neutral-100'>Add New Financial Goal</h2>
                                {addGoalError && <p className='text-sm text-red-400 bg-red-900/30 p-2 rounded border border-red-700/50 flex items-center gap-1.5'><FiAlertCircle/>{addGoalError}</p>}
                                <div className='space-y-1'> <Label htmlFor="newGoalTitle" className='text-sm'>Goal Title <span className='text-red-500'>*</span></Label> <Input id="newGoalTitle" value={newGoalTitle} onChange={(e)=>setNewGoalTitle(e.target.value)} required disabled={isSavingGoal} placeholder="e.g., European Vacation Fund" className='mt-1 bg-neutral-800 border-neutral-700 h-10'/> </div>
                                <div className='space-y-1'> <Label htmlFor="newGoalDesc" className='text-sm'>Description (Optional)</Label> <Input id="newGoalDesc" value={newGoalDesc} onChange={(e)=>setNewGoalDesc(e.target.value)} disabled={isSavingGoal} placeholder="Specific details (target countries, duration)" className='mt-1 bg-neutral-800 border-neutral-700 h-10'/> </div>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div className='space-y-1'> <Label htmlFor="newGoalAmount" className='text-sm'>Target Amount (INR, Optional)</Label> <Input id="newGoalAmount" type='number' min="0" step="100" value={newGoalAmount} onChange={(e)=>setNewGoalAmount(e.target.value)} disabled={isSavingGoal} placeholder="e.g., 250000" className='mt-1 bg-neutral-800 border-neutral-700 h-10'/> </div>
                                    <div className='space-y-1'> <Label htmlFor="newGoalDate" className='text-sm'>Target Date (Optional)</Label> <Input id="newGoalDate" type='date' value={newGoalDate} onChange={(e)=>setNewGoalDate(e.target.value)} disabled={isSavingGoal} className='mt-1 bg-neutral-800 border-neutral-700 h-10 appearance-none px-3'/> </div>
                                </div>
                                <div className='flex justify-end pt-2'> <Button type="submit" disabled={isSavingGoal} size="sm"> {isSavingGoal ? <FiLoader className="w-4 h-4 animate-spin mr-1.5" /> : <FiSave className="w-4 h-4 mr-1.5" />} {isSavingGoal ? 'Saving...' : 'Save Goal'} </Button> </div>
                            </form>
                        </motion.div>
                    )}
                 </AnimatePresence>

                {/* Goals Grid Display Area */}
                 {isLoadingGoals ? ( <div className='text-center py-16 text-neutral-400 flex items-center justify-center gap-2'> <FiLoader className='animate-spin w-5 h-5'/>Loading your goals...</div> )
                  : errorLoading ? ( <div className='text-center py-10 text-red-400 flex items-center justify-center gap-1.5 border border-red-700/50 bg-red-900/30 rounded-lg p-4'> <FiAlertCircle className='w-5 h-5'/>{errorLoading}</div> )
                  : goals.length === 0 && !isAddingGoal ? ( <div className='text-center py-16 text-neutral-500 border border-dashed border-neutral-700 rounded-lg bg-neutral-900/40 mt-4'> <FiTarget className='w-12 h-12 mx-auto mb-4 text-neutral-600'/> <p className='text-lg font-medium mb-2 text-neutral-400'>No Goals Set Yet</p> <p className='text-sm mb-4'>Define your financial targets to start planning.</p> <Button variant="link" size="sm" onClick={()=>setIsAddingGoal(true)} className='text-blue-400 hover:text-blue-300'>+ Add Your First Goal</Button> </div> )
                  : goals.length > 0 ? ( <ExpandableCardGrid cards={goalItems} /> )
                  : null }

            </main>

             {/* Render Delete Confirmation Dialog */}
             <DeleteGoalDialog
                isOpen={!!goalToDelete}
                onOpenChange={(open) => { if (!open) { setGoalToDelete(null); setDeleteError(null); } }}
                onConfirmDelete={confirmDeleteGoal}
                goalTitle={goalToDelete?.title || ''}
                isDeleting={isDeleting}
            />
             {/* Optional: Display delete error as a toast or near dialog trigger */}
             {deleteError && goalToDelete && <p className="text-xs text-red-400 text-center mt-1">{deleteError}</p>}

        </div>
    );
}