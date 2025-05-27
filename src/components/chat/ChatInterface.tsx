// src/components/chat/ChatInterface.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation'; // Hook to read URL query parameters
import ChatMessage from './ChatMessage'; // Component to display individual messages
import ChatInput from './ChatInput';     // Component for the user input area
import { cn } from '@/lib/utils'; // Utility for class names

// Define the structure for a message object
interface Message {
    id: string; // Unique identifier for React keys
    role: 'user' | 'model' | 'system'; // Sender role
    content: string; // Message text content (can be Markdown)
    createdAt?: Date; // Optional timestamp
}

// Define the props expected by this component
interface ChatInterfaceProps {
    chatId: string; // The unique ID of the current chat session
    initialMessages?: Message[]; // Messages loaded initially (e.g., from history)
}

export default function ChatInterface({ chatId, initialMessages = [] }: ChatInterfaceProps) {
    const searchParams = useSearchParams(); // Hook to access URL search parameters
    // Initialize state DIRECTLY from props passed by the server component
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputMessage, setInputMessage] = useState(''); // State for the text in the input box
    const [isLoading, setIsLoading] = useState(false); // State to track if waiting for AI response
    const messagesEndRef = useRef<HTMLDivElement>(null); // Ref to auto-scroll to the bottom
    const initialQuerySentRef = useRef(false); // Ref to prevent sending initial URL query multiple times
    const chatContainerRef = useRef<HTMLDivElement>(null); // Ref for the message container div

    // Effect to UPDATE internal message state when initialMessages prop changes (due to navigation)
    useEffect(() => {
        console.log(`ChatInterface Effect: chatId or initialMessages changed. Resetting state. ChatId: ${chatId}, Initial Msg Count: ${initialMessages.length}`);
        setMessages(initialMessages); // Reset messages state to the new props from the server
        initialQuerySentRef.current = false; // Reset initial query flag for the new chat
        setInputMessage(''); // Clear any leftover input
        setIsLoading(false); // Ensure loading state is reset
    }, [chatId, initialMessages]); // Re-run ONLY when chatId or initialMessages change

    // Effect to scroll down smoothly when new messages are added
    useEffect(() => {
        // Use a short timeout to allow the DOM to update before scrolling
        const timer = setTimeout(() => {
             if (messagesEndRef.current) {
                 messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
             }
        }, 100);
        return () => clearTimeout(timer); // Cleanup timer
    }, [messages]); // Run when messages array changes

    // Effect to scroll down immediately when the chat ID changes (navigating between chats)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: "auto", block: "end" });
            }
        }, 0); // Execute immediately after render
        return () => clearTimeout(timer);
    }, [chatId]); // Run only when chat ID changes

    // Function to handle sending a message to the backend API
    const handleSendMessage = useCallback(async (messageContent: string) => {
        const content = messageContent.trim();
        if (!content || isLoading) return; // Prevent empty or concurrent submissions

        // Create the user's message object for optimistic UI update
        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: content,
            createdAt: new Date()
        };

        // Add user's message to the state immediately
        setMessages(prev => [...prev, userMessage]);
        setInputMessage(''); // Clear the input field
        setIsLoading(true); // Show loading indicator

        try {
            // Call the backend API endpoint for this chat
            const response = await fetch(`/api/chat/${chatId}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: content }), // Send the user's message
            });

            // Handle potential errors from the API
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})); // Try parsing error JSON
                throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
            }

            // Get the AI's response message from the API
            const modelMessage: Message = await response.json();

            // Add the AI's message to the chat display state
            setMessages(prev => [...prev, modelMessage]);

        } catch (error) {
            console.error("Error sending message or receiving AI response:", error);
            // Create and display an error message in the chat interface
            const errorMessage: Message = {
                 id: crypto.randomUUID(),
                 role: 'system', // Use 'system' role for errors
                 content: `Error: ${error instanceof Error ? error.message : 'Could not get response.'}`,
                 createdAt: new Date()
             };
             setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false); // Hide loading indicator
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chatId, isLoading]); // Dependencies for the memoized callback

    // Effect to automatically send the initial query from URL (?q=...) on first appropriate load
    useEffect(() => {
        if (!searchParams) return; // Ensure searchParams are available
        const initialQuery = searchParams.get('q');

        // Log current state for debugging this effect
        console.log("ChatInterface Init Query Effect: ChatID:", chatId, "Query:", initialQuery, "Msg Count:", messages.length, "Sent Flag:", initialQuerySentRef.current, "Loading:", isLoading);

        // Check conditions carefully: query exists, chat is new (<=1 msg), flag is false, not loading
        if (initialQuery && messages.length <= 1 && !initialQuerySentRef.current && !isLoading) {
            // Check if the existing message (if any) is just the system prompt
            if (messages.length === 0 || messages[0]?.role === 'system') {
                console.log("--- Sending initial query from URL ---", initialQuery);
                initialQuerySentRef.current = true; // Set flag to prevent re-sending
                handleSendMessage(initialQuery); // Send the query as the first user message
            }
        }
    // Add all relevant dependencies to ensure effect runs when needed but not excessively
    }, [searchParams, chatId, initialMessages, messages, isLoading, handleSendMessage]);

    return (
        // Main container for the chat interface area
        <div className="flex flex-col h-full bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-neutral-100">

            {/* Message list container - allows scrolling */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 md:px-6 lg:px-8 space-y-5 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent relative" // Added relative for potential overlays
            >
                 {/* Optional: Placeholder for very new/empty chats */}
                {messages.length === 0 || (messages.length === 1 && messages[0].role === 'system' && !messages[0].content.toLowerCase().includes('error')) ? (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-500 text-center opacity-80">
                         <h2 className="text-2xl font-semibold mb-2">Arth Shikshak</h2>
                         <p className="text-sm">Your AI Financial Planning Assistant</p>
                         <p className="text-xs mt-4">Ask anything or start with a suggestion below.</p>
                    </div>
                ) : (
                    // Render the list of messages
                    messages.map((msg, index) => (
                        <ChatMessage
                            key={msg.id || `msg-${index}`} // Use message ID or index as React key
                            role={msg.role}
                            content={msg.content}
                         />
                    ))
                )}
                {/* Display loading indicator using ChatMessage styling */}
                {isLoading && <ChatMessage role="model" content="" isLoading={true} />}
                {/* Empty div at the end to ensure scrolling works correctly */}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area container at the bottom */}
            <div className="p-3 md:p-4 lg:px-6 border-t border-neutral-800 bg-neutral-950/80 backdrop-blur-sm sticky bottom-0 z-10">
                {/* ChatInput component handles text entry and send button */}
                <ChatInput
                    value={inputMessage} // Pass current input value
                    onChange={(e) => setInputMessage(e.target.value)} // Update state on input change
                    onSendMessage={() => handleSendMessage(inputMessage)} // Trigger send on action
                    isLoading={isLoading} // Pass loading state to disable input/button
                />
                 {/* Optional: Small disclaimer text */}
                 <p className="text-center text-[10px] text-neutral-600 mt-2 px-4">
                     AI responses may not always be accurate. Please verify critical financial information.
                 </p>
            </div>
        </div>
    );
}