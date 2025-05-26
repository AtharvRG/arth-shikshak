// src/components/chat/ChatInput.tsx
"use client";

import React, { useRef, useEffect } from 'react';
import { FiSend, FiLoader } from 'react-icons/fi'; // Icons for send button states
import { cn } from '@/lib/utils'; // Utility for merging class names

// Define the props expected by the ChatInput component
interface ChatInputProps {
    value: string; // The current text value of the input (controlled component)
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; // Function to call when input value changes
    onSendMessage: () => void; // Function to call when the message should be sent
    isLoading: boolean; // Boolean indicating if an AI response is currently loading
}

export default function ChatInput({ value, onChange, onSendMessage, isLoading }: ChatInputProps) {
    // Ref to access the textarea DOM element for height calculation
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Effect to automatically adjust the textarea height based on its content
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Temporarily shrink to get accurate scrollHeight
            const scrollHeight = textareaRef.current.scrollHeight;
            // Set height based on content, capped at a maximum (e.g., 144px for max-h-36)
            textareaRef.current.style.height = `${Math.min(scrollHeight, 144)}px`;
        }
    }, [value]); // Re-run this effect whenever the input value changes

    // Handle keydown events on the textarea
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Send message if Enter is pressed without the Shift key
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent default behavior (inserting a newline)
            // Trigger send only if not currently loading and the input has trimmed content
            if (!isLoading && value.trim()) {
                onSendMessage();
            }
        }
    };

    // Handle clicks on the send button
    const handleSendClick = () => {
         // Trigger send only if not currently loading and the input has trimmed content
         if (!isLoading && value.trim()) {
             onSendMessage();
         }
    }

    return (
        // Main container div for the input area, includes styling for focus state
        <div className={cn(
            "flex items-end gap-2 rounded-lg border border-neutral-700/80 bg-neutral-800/50 p-2", // Base layout and appearance
            "focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/30", // Highlight when textarea is focused
            "transition-all duration-200" // Smooth transition for focus styles
            )}>
             {/* Textarea element for multi-line input */}
             <textarea
                ref={textareaRef} // Attach the ref
                rows={1} // Start with one row height
                placeholder="Ask Arth Shikshak..." // Informative placeholder text
                value={value} // Controlled component value
                onChange={onChange} // Update state on change
                onKeyDown={handleKeyDown} // Handle Enter key submission
                disabled={isLoading} // Disable input while AI is responding
                className={cn(
                    "flex-1 bg-transparent border-none resize-none overflow-y-auto max-h-36", // Layout, no resize handle, scrollable with max height
                    "p-2 text-sm text-neutral-100 placeholder:text-neutral-500", // Padding, text and placeholder styling
                    "focus:outline-none focus:ring-0", // Remove default browser focus outline
                    "disabled:cursor-not-allowed disabled:opacity-60", // Disabled state styling
                    "scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-transparent" // Custom scrollbar styling
                )}
            />
            {/* Send Button */}
            <button
                type="button" // Prevents accidental form submission if nested
                onClick={handleSendClick} // Trigger send action
                disabled={isLoading || !value.trim()} // Disable if loading or input is empty/whitespace
                className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md transition-colors flex-shrink-0", // Size, layout, and transition
                    "bg-blue-600 text-white hover:bg-blue-700", // Normal state styles
                    "disabled:bg-neutral-700 disabled:text-neutral-400 disabled:cursor-not-allowed" // Disabled state styles
                )}
                aria-label="Send message" // Accessibility label
             >
                 {/* Show loading spinner or send icon based on isLoading state */}
                 {isLoading ? (
                      <FiLoader className="h-4 w-4 animate-spin" /> // Spinning loader icon
                 ): (
                     <FiSend className="w-4 h-4" /> // Send icon
                 )}
            </button>
        </div>
    );
}