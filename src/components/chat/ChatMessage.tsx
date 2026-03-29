// src/components/chat/ChatMessage.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react'; // Import React hooks
import { cn } from '@/lib/utils'; // Utility for merging Tailwind classes
import { FiUser, FiCpu, FiAlertTriangle } from 'react-icons/fi'; // Icons for different roles
import ReactMarkdown from 'react-markdown'; // Component for rendering Markdown
import remarkGfm from 'remark-gfm'; // Plugin for GitHub Flavored Markdown support (tables, strikethrough, etc.)
import { motion } from 'framer-motion'; // For entry animation
import { TypewriterEffect } from '@/components/ui/typewriter-effect'; // Import the Framer Motion based typewriter

// Define the props expected by the ChatMessage component
interface ChatMessageProps {
    role: 'user' | 'model' | 'system'; // Determines styling, icon, and behavior
    content: string; // The message text, potentially containing Markdown
    isLoading?: boolean; // Optional flag, true if this is a placeholder for a model response being generated
}

// The component to display a single chat message
export default function ChatMessage({ role, content, isLoading = false }: ChatMessageProps) {
    const isUser = role === 'user';
    const isSystem = role === 'system'; // Usually for errors or important info
    const isModel = role === 'model'; // AI responses

    // State to track if the typewriter effect for *this specific message* has completed
    // Start as 'complete' for non-model messages or if initially loading (dots show first)
    const [isTypingComplete, setIsTypingComplete] = useState(!isModel || isLoading);

    // Effect to reset completion state and start typing when new model content arrives
    // (and it's no longer in the initial 'isLoading' state)
    useEffect(() => {
        if (isModel && !isLoading) {
            // If it's a model message and the loading is finished, start typing
            setIsTypingComplete(false);
        } else {
            // Otherwise (user, system, or model still loading initially), consider it "complete" instantly
            setIsTypingComplete(true);
        }
    }, [content, isModel, isLoading]); // Re-evaluate when these change

    // Callback function passed to TypewriterEffect, called when its animation finishes
    const handleTypingComplete = useCallback(() => {
        // console.log("Typing complete callback triggered"); // Debug log
        setIsTypingComplete(true); // Set state to true, triggering Markdown render
    }, []); // No dependencies needed for this stable callback

    // --- Styling and Icons ---
    const alignmentClass = isUser ? "justify-end" : isSystem ? "justify-center" : "justify-start";
    const roleStyles = {
        user: { icon: FiUser, iconColor: "text-blue-300", textColor: "text-neutral-100", bubbleClasses: "bg-blue-600/20 border border-blue-800/50" },
        model: { icon: FiCpu, iconColor: "text-purple-300", textColor: "text-neutral-200", bubbleClasses: "bg-neutral-800/70 border border-neutral-700/60" },
        system: { icon: FiAlertTriangle, iconColor: "text-yellow-500", textColor: "text-yellow-300", bubbleClasses: "bg-yellow-900/40 border border-yellow-700/60 text-xs italic text-center !max-w-lg" },
    };
    const SelectedIcon = roleStyles[role].icon;
    // --- End Styling ---

    return (
        // Outer container div for alignment and entry animation
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn("w-full flex mb-4", alignmentClass)}
        >
            {/* Inner container holds the icon (if applicable) and the message bubble */}
            <div className={cn(
                "flex items-start gap-3 w-auto", // Layout icon and bubble
                "max-w-[85%] sm:max-w-[80%] md:max-w-[75%]", // Responsive max width
                isUser ? "flex-row-reverse" : "flex-row" // Reverse layout for user
            )}>
                {/* Icon Area - Conditionally rendered */}
                {!isSystem && (
                    <div className={cn(
                        "mt-1 flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center shadow-inner",
                        isUser ? "bg-blue-900/80" : "bg-neutral-700/80"
                    )}>
                        <SelectedIcon className={cn("w-4 h-4", roleStyles[role].iconColor)} />
                    </div>
                )}

                {/* Content Bubble */}
                <div className={cn(
                    "py-2.5 px-4 rounded-lg shadow-md min-h-[36px]", // Base styles
                    roleStyles[role].bubbleClasses, // Role-specific background/border
                    roleStyles[role].textColor, // Role-specific text color
                    // Conditional corner rounding
                    isUser ? "rounded-br-none" : isSystem ? "" : "rounded-bl-none"
                )}>
                     {/* Optional: Icon inside for system messages */}
                     {isSystem && (
                         <div className="flex items-center justify-center gap-1.5 mb-1">
                             <SelectedIcon className={cn("w-3.5 h-3.5", roleStyles[role].iconColor)} />
                             <span>System Message</span>
                         </div>
                     )}

                    {/* Content Area: Renders Loading, Typewriter, or Markdown */}
                    <div className={cn(
                        // Base text styles for wrapping and line breaks
                        "whitespace-pre-wrap break-words text-sm leading-relaxed",
                        // Apply Tailwind Prose styles ONLY when rendering Markdown (typing complete or not model)
                        // This prevents prose from interfering with typewriter's plain text rendering
                        (isTypingComplete || !isModel) && [
                            "prose prose-sm prose-invert dark:prose-invert max-w-none",
                            "prose-p:my-1.5 prose-li:my-0.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-ul:pl-4 prose-ol:pl-4",
                            "prose-headings:mt-3 prose-headings:mb-1.5 prose-headings:font-semibold",
                            "prose-code:bg-black/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:text-purple-300 prose-code:before:content-[''] prose-code:after:content-['']",
                            "prose-pre:bg-black/40 prose-pre:p-3 prose-pre:rounded-md prose-pre:text-xs prose-pre:leading-snug prose-pre:scrollbar-thin prose-pre:scrollbar-thumb-neutral-600",
                            "prose-blockquote:border-l-4 prose-blockquote:border-neutral-600 prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-neutral-400",
                            "prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-a:underline prose-a:decoration-blue-400/50 hover:prose-a:decoration-blue-300 prose-a:font-medium",
                        ],
                        // Override specific styles for system messages if needed
                        isSystem && "!text-yellow-300 !text-xs"
                        )}
                    >
                        {/* Conditional Rendering Logic */}
                        {isLoading ? (
                             // 1. Show loading dots if isLoading prop is true
                             <div className="flex space-x-1 items-center h-5">
                                <span className="h-1.5 w-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-1.5 w-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-1.5 w-1.5 bg-current rounded-full animate-bounce"></span>
                             </div>
                        ) : isModel && !isTypingComplete ? (
                            // 2. Show Typewriter effect if it's a model message and typing isn't finished
                            <TypewriterEffect
                                text={content} // The full content to type
                                // Calculate duration based on length for variable speed
                                duration={Math.min(5, Math.max(0.5, content.length * 0.025))} // e.g., 25ms/char
                                className="text-sm leading-relaxed" // Apply base text style
                                onComplete={handleTypingComplete} // Call function when typing finishes
                            />
                        ) : (
                            // 3. Show rendered Markdown for completed model messages, user messages, or system messages
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {content}
                            </ReactMarkdown>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}