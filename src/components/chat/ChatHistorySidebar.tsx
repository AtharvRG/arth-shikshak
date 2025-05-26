// src/components/chat/ChatHistorySidebar.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FiPlusCircle, FiTrash2, FiLoader, FiMessageSquare, FiAlertCircle } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import { useLoading } from '@/context/LoadingContext';
import CustomLink from '../ui/CustomLink'; // Use CustomLink for navigation items
import DeleteChatModal from './DeleteChatModal'; // Import the modal

// Hint definitions (customize)
const HINTS_SIDEBAR_NEW_CHAT: string[] = ["Starting fresh chat...", "Getting assistant ready..."];
const HINTS_LOADING_CHAT: string[] = ["Loading conversation...", "Fetching messages...", "Getting context ready..."];

interface ChatHistoryItem { id: string; title: string; updatedAt?: Date | string; }

export default function ChatHistorySidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const { startLoading } = useLoading();
    const [isLoadingNewChat, setIsLoadingNewChat] = useState(false);
    const [chatToDelete, setChatToDelete] = useState<ChatHistoryItem | null>(null); // Store chat object for modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeletingActive, setIsDeletingActive] = useState(false); // Separate state for modal delete action
    const [error, setError] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    // Fetch chat history function
    const fetchHistory = useCallback(async (showLoading = true) => {
        if (showLoading) setIsLoadingHistory(true);
        setError(null);
        try {
            const response = await fetch('/api/chat/history');
            if (!response.ok) { throw new Error('Failed to fetch history'); }
            const data = await response.json();
            setChatHistory(data);
        } catch (err) { setError(err instanceof Error ? err.message : "Could not load history."); }
        finally { if (showLoading) setIsLoadingHistory(false); }
    }, []); // Empty dependency array, fetch once or manually

    useEffect(() => { fetchHistory(); }, [fetchHistory]);

    // Handle New Chat button click
    const handleNewChatClick = async () => {
        setIsLoadingNewChat(true); setError(null);
        startLoading('fullPage', HINTS_SIDEBAR_NEW_CHAT);
        try {
            const response = await fetch('/api/chat/new', { method: 'POST' });
            if (!response.ok) { throw new Error('Failed to start new chat'); }
            const { chatId } = await response.json();
            await fetchHistory(false); // Re-fetch history without showing loading skeleton
            router.push(`/chat/${chatId}`);
        } catch (err) { /* error handling */ setError(err instanceof Error ? err.message : "Error"); startLoading(null); }
        finally { setIsLoadingNewChat(false); }
    };

    // --- Delete Chat Logic ---
    // Open modal when delete icon is clicked
    const openDeleteModal = (chat: ChatHistoryItem, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setChatToDelete(chat);
        setIsModalOpen(true);
    };

    // Close modal handler
    const closeDeleteModal = () => {
        setIsModalOpen(false);
        // Delay resetting chatToDelete to allow modal fade-out
        setTimeout(() => setChatToDelete(null), 300);
    };

    // Confirm deletion handler (called by modal)
    const confirmDelete = async () => {
        if (!chatToDelete) return;
        setIsDeletingActive(true); // Show loading in modal button
        setError(null);
        try {
            const response = await fetch(`/api/chat/${chatToDelete.id}`, { method: 'DELETE' });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to delete chat.');
            }
            // Optimistic UI update & redirect if needed
            setChatHistory(prev => prev.filter(chat => chat.id !== chatToDelete.id));
            const currentChatId = pathname.split('/')[2];
            closeDeleteModal(); // Close modal on success
            if (currentChatId === chatToDelete.id) {
                 startLoading('fullPage', ["Chat deleted. Loading..."]);
                 router.push('/chat');
            }
        } catch (err) {
            console.error("Error deleting chat:", err);
            setError(err instanceof Error ? err.message : "Could not delete chat.");
            // Keep modal open to show error maybe? Or close and show error in sidebar.
            // For now, we rely on the sidebar error display.
            closeDeleteModal();
        } finally {
            setIsDeletingActive(false); // Reset modal deleting state
        }
    };
    // --- End Delete Chat Logic ---

    const currentChatId = pathname.startsWith('/chat/') ? pathname.split('/')[2] : null;

    return (
        <>
            <aside className="w-64 md:w-72 bg-neutral-950/80 backdrop-blur-xl p-4 flex flex-col h-full border-r border-neutral-700/60 shrink-0 shadow-lg">
                {/* New Chat Button - Enhanced Style */}
                 <button onClick={handleNewChatClick} disabled={isLoadingNewChat} className={cn("flex items-center justify-center gap-2.5 w-full px-3 py-2.5 mb-5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-950 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed")}>
                     {isLoadingNewChat ? (<FiLoader className="animate-spin w-4 h-4" />) : (<FiPlusCircle className="w-4 h-4" />)}
                     Start New Chat
                 </button>

                {/* Error Display */}
                 {error && !isLoadingHistory && (
                    <div className="flex items-center gap-1.5 text-xs text-red-400 mb-2 px-2 py-1.5 bg-red-900/30 border border-red-700/50 rounded-md">
                         <FiAlertCircle className="w-3.5 h-3.5 shrink-0"/> <span>{error}</span>
                    </div>
                 )}

                {/* Chat History - Enhanced List */}
                 <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 -mr-1 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                     <h3 className="text-xs font-bold text-neutral-400/80 uppercase tracking-wider mb-2 px-1 sticky top-0 bg-neutral-950/80 backdrop-blur-sm py-1 z-10">Chat History</h3>
                     {isLoadingHistory ? (
                         <div className="space-y-2 px-1"> {/* Skeleton Loader */}
                             <div className="h-9 bg-neutral-800/60 rounded-lg animate-pulse"></div>
                             <div className="h-9 bg-neutral-800/60 rounded-lg animate-pulse w-5/6"></div>
                             <div className="h-9 bg-neutral-800/60 rounded-lg animate-pulse w-4/6"></div>
                         </div>
                     ) : chatHistory.length > 0 ? (
                         chatHistory.map((chat) => (
                             // History Item - Using CustomLink + Button for Delete
                             <div key={chat.id} className="group relative">
                                 <CustomLink
                                     href={`/chat/${chat.id}`}
                                     loadingType="fullPage"
                                     loadingHints={HINTS_LOADING_CHAT}
                                     className={cn(
                                         "flex items-center justify-between pl-3 pr-8 py-2 text-sm rounded-lg w-full text-left", // Added pr for button space
                                         "transition-all duration-150 ease-in-out",
                                         currentChatId === chat.id
                                             ? "bg-gradient-to-r from-neutral-700/80 to-neutral-800/60 text-white font-medium shadow-inner ring-1 ring-neutral-600/50" // Enhanced active state
                                             : "text-neutral-300 hover:bg-neutral-800/70 hover:text-neutral-100"
                                     )}
                                 >
                                      {/* Icon and Title */}
                                      <div className="flex items-center gap-2 truncate">
                                          <FiMessageSquare className={cn("w-4 h-4 shrink-0", currentChatId === chat.id ? "text-blue-300" : "text-neutral-500 group-hover:text-neutral-300")}/>
                                          <span className="truncate flex-1">{chat.title || "Untitled Chat"}</span>
                                      </div>
                                 </CustomLink>
                                  {/* Delete Button - Visible on Hover */}
                                  <button
                                     onClick={(e) => openDeleteModal(chat, e)}
                                     disabled={isDeletingActive} // Disable all delete buttons while one is processing
                                     className={cn(
                                         "absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded text-neutral-500 hover:bg-red-900/40 hover:text-red-400 transition-all duration-150",
                                         "opacity-0 group-hover:opacity-100 focus:opacity-100" // Group hover controls visibility
                                     )}
                                     aria-label={`Delete chat "${chat.title || 'Untitled Chat'}"`}
                                  >
                                     <FiTrash2 className="w-4 h-4"/>
                                  </button>
                             </div>
                         ))
                     ) : (
                         <p className="text-sm text-neutral-500 px-3 py-4 text-center">No previous chats found.</p>
                     )}
                 </div>
                 {/* Optional Footer */}
                 {/* <div className="mt-auto pt-3 border-t border-neutral-800"> ... </div> */}
            </aside>

             {/* Render the Confirmation Modal */}
            {chatToDelete && (
                <DeleteChatModal
                    isOpen={isModalOpen}
                    onClose={closeDeleteModal}
                    onConfirmDelete={confirmDelete}
                    chatTitle={chatToDelete.title || "Untitled Chat"}
                    isDeleting={isDeletingActive}
                />
            )}
        </>
    );
}