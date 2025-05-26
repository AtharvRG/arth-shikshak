// src/app/dashboard/page.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import router hook
import Navbar from '@/components/layout/Navbar'; // Import the Navbar
import SuggestionButton from '@/components/chat/SuggestionButton'; // Import Suggestion button
import { Spotlight } from "@/components/ui/spotlight-new"; // Import background Spotlight effect
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input"; // Import the special input
import { motion } from 'framer-motion'; // Import for animations
import { cn } from '@/lib/utils'; // Import class name utility
import { useLoading } from '@/context/LoadingContext'; // Import the loading context hook

// Define hint sets specifically for the dashboard-to-chat transition
const HINTS_DASHBOARD_TO_CHAT: string[] = [
    "Loading your conversation...",
    "Preparing the AI assistant...",
    "Getting ready to chat...",
    "Tip: Keep your financial goals in mind.",
    "Connecting securely...",
];

// The main component for the minimal dashboard page
export default function MinimalDashboardPage() {
    const router = useRouter(); // Initialize router hook
    const { startLoading, stopLoading } = useLoading(); // Get loading functions from context
    const [inputMessage, setInputMessage] = useState(''); // State for the controlled input field
    const [isLoading, setIsLoading] = useState(false); // Local loading state, mainly for disabling UI elements during API call
    const [error, setError] = useState<string | null>(null); // State for displaying errors

    // Handler function called when submitting the input or clicking a suggestion
    const handleStartChat = async (submittedValue: string) => {
        const content = submittedValue.trim(); // Trim whitespace
        if (!content || isLoading) return; // Prevent submission if content is empty or already processing

        setInputMessage(''); // Clear the input field state immediately
        setError(null); // Clear any previous errors
        setIsLoading(true); // Set local loading state (e.g., disable suggestion buttons)

        // Trigger the POPUP loading indicator before starting async work
        startLoading('popup', HINTS_DASHBOARD_TO_CHAT);

        try {
            // --- Perform actual API call to create a new chat ---
            console.log("Calling API to start new chat with:", content);
            const response = await fetch('/api/chat/new', { // Call the backend endpoint
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Send the initial message if the API expects it (currently it doesn't)
                // body: JSON.stringify({ initialMessage: content }),
            });

            if (!response.ok) {
                // If API returns an error, try to parse message, otherwise throw generic error
                const errData = await response.json().catch(() => ({ message: 'Failed to start chat session.' }));
                throw new Error(errData.message || `HTTP error! Status: ${response.status}`);
            }

            const { chatId } = await response.json(); // Extract the new chat ID from the successful API response
            // --- End API Call ---

            console.log("API successful, new chat ID:", chatId, "Redirecting...");

            // Programmatically navigate to the new chat page
            // The NavigationEvents component will handle stopping the loading indicator
            // once the navigation to the new route is complete.
            router.push(`/chat/${chatId}?q=${encodeURIComponent(content)}`); // Pass initial query via URL param
            // No need to call stopLoading() here, NavigationEvents handles it

        } catch (err) {
            // Handle errors during the API call
            console.error("Error starting chat:", err);
            setError(err instanceof Error ? err.message : "Could not start chat session. Please try again.");
            startLoading(null); // Stop the global loading indicator immediately on error
            setIsLoading(false); // Reset local button loading state on error
        }
        // No need to reset isLoading on success because the page navigates away
    };

    // Placeholder suggestions for the PlaceholdersAndVanishInput component
    const placeholders = [
        "Plan my retirement strategy...",
        "Analyze my investment portfolio for risks...",
        "How much should I save for my child's education?",
        "Explain tax-loss harvesting.",
        "Draft a simple will outline.",
        "Ask anything about personal finance...",
    ];

    // Handler for the controlled input component's onChange event
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputMessage(e.target.value); // Update the local state as the user types
    };

    return (
        // Main container for the page
        <div className={cn(
             "flex flex-col h-screen w-full text-white overflow-hidden", // Layout: full height, column direction
             "bg-black/[0.96] antialiased bg-grid-white/[0.02]", // Background styling from Aceternity example
             "relative" // Required for absolute positioning of Spotlight
             )}>

             {/* Background Spotlight Animation Component */}
             <Spotlight
                 className="-top-40 -left-10 md:-left-10 md:-top-20" // Position adjusted for better centering
                 // Customize other props like gradients here if desired
             />

             {/* Content Wrapper - Stacks Navbar and Main Content, ensures content is above spotlight */}
             <div className="flex flex-col h-full relative z-10">
                 {/* Application Navbar */}
                 <Navbar />

                 {/* Main Content Area - Centered Flex Container */}
                 <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                     {/* Animated Container for the central UI elements */}
                     <motion.div
                         initial={{ opacity: 0, scale: 0.9 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ delay: 0.2, duration: 0.5 }}
                         className="w-full flex flex-col items-center" // Centers content vertically
                     >
                         {/* Page Title */}
                         <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
                             Arth Shikshak
                         </h1>
                         {/* Page Subtitle */}
                         <p className="text-base md:text-lg text-neutral-300 mb-10 max-w-lg mx-auto">
                             How can I help you plan your finances today?
                         </p>

                         {/* Suggestion Buttons Section */}
                         <div className="flex flex-wrap gap-2 md:gap-3 mb-6 justify-center max-w-2xl mx-auto">
                             {/* Map over placeholder suggestions to create buttons */}
                             {placeholders.map((text) => (
                                 // Use standard button with disabled state handling
                                 <button
                                     key={text}
                                     // Call handler on click, only if not loading
                                     onClick={() => !isLoading && handleStartChat(text)}
                                     disabled={isLoading} // Disable button during API calls
                                     className={cn(
                                         // Basic suggestion button styling
                                        "px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-700/80",
                                        "text-xs text-neutral-300 font-medium transition-colors",
                                        "disabled:opacity-50 disabled:cursor-not-allowed" // Styling for disabled state
                                     )}
                                 >
                                     {text}
                                 </button>
                             ))}
                         </div>

                         {/* Error Display Area */}
                         {/* Conditionally display error message */}
                         {error && (<p className="text-red-400 text-sm mb-4 h-5">{error}</p>)}
                         {/* Placeholder div to maintain layout consistency when no error */}
                         {!error && (<div className="h-5 mb-4"></div>)}

                         {/* Placeholders and Vanish Input Component */}
                         <div className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl px-4">
                             {/* The Vanishing Input Component */}
                             <PlaceholdersAndVanishInput
                                 placeholders={placeholders} // Pass placeholder array
                                 onChange={handleInputChange} // Pass state update function
                                 onSubmit={handleStartChat} // Pass submit/chat creation function
                                 value={inputMessage} // Pass current input state (controlled component)
                             />
                         </div>
                     </motion.div>
                 </main>
             </div>
             {/* End Content Wrapper */}
        </div> // End Outer Container
    );
}